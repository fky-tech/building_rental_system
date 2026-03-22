'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { generateSecurePassword } from '@/lib/utils/password'
import { revalidatePath } from 'next/cache'

export async function createOwnerAction(prevState: any, formData: FormData) {
  try {
    const fullName = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    if (!fullName || !email) {
      return { success: false, error: 'Full name and email are required' }
    }

    const password = generateSecurePassword()
    const supabaseAdmin = createAdminClient()

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName } // Optional, good practice
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return { success: false, error: authError.message }
    }

    const userId = authData.user.id

    // 2. Insert into profiles with must_change_password (if column exists, it will be set, if not we will run our alter script)
    // using the admin client to bypass RLS
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        phone: phone || null,
        role: 'owner',
        must_change_password: true
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Cleanup the auth user since profile failed
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { success: false, error: 'Failed to create owner profile.' }
    }

    // 3. Insert into owners table
    const { error: ownerError } = await supabaseAdmin
      .from('owners')
      .insert({
        user_id: userId,
        status: 'active'
      })

    if (ownerError) {
      console.error('Error creating owner record:', ownerError)
      // Attempt cleanup (ignoring errors)
      await supabaseAdmin.from('profiles').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { success: false, error: 'Failed to create owner management record.' }
    }

    revalidatePath('/admin/owners')

    return { 
      success: true, 
      email, 
      password, 
      message: 'Owner created successfully' 
    }

  } catch (err: any) {
    console.error('Unexpected error creating owner:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
