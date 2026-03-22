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

export async function updateOwnerStatusAction(id: string, status: 'active' | 'inactive') {
  try {
    const supabaseAdmin = createAdminClient()
    
    // 1. Update owner status
    const { error: ownerError } = await supabaseAdmin
      .from('owners')
      .update({ status })
      .eq('id', id)
      
    if (ownerError) throw ownerError

    // 2. Update all buildings for this owner
    const { error: buildingError } = await supabaseAdmin
      .from('buildings')
      .update({ status })
      .eq('owner_id', id)
      
    if (buildingError) throw buildingError

    revalidatePath('/admin/owners')
    revalidatePath('/admin/buildings')
    revalidatePath('/', 'layout')

    return { success: true, message: `Owner and associated buildings ${status === 'active' ? 'activated' : 'deactivated'}` }
  } catch (err: any) {
    console.error('Error updating owner status:', err)
    return { success: false, error: 'Failed to update owner status.' }
  }
}

export async function updateOwnerAction(id: string, formData: FormData) {
  try {
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    
    if (!fullName) return { success: false, error: 'Full name is required' }
    
    const supabaseAdmin = createAdminClient()
    
    // Get the owner record to find user_id
    const { data: owner } = await supabaseAdmin.from('owners').select('user_id').eq('id', id).single()
    if (!owner) throw new Error('Owner not found')
    
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null
      })
      .eq('id', owner.user_id)
      
    if (error) throw error
    
    revalidatePath('/admin/owners')
    return { success: true, message: 'Owner profile updated successfully' }
  } catch (err: any) {
    console.error('Error updating owner:', err)
    return { success: false, error: err.message || 'Failed to update owner' }
  }
}

export async function deleteOwnerAction(id: string) {
  try {
    if (!id) return { success: false, error: 'Owner ID is required' }
    
    const supabaseAdmin = createAdminClient()
    
    // 1. Get owner data
    const { data: owner } = await supabaseAdmin.from('owners').select('user_id').eq('id', id).single()
    if (!owner) throw new Error('Owner not found')
    
    // 2. Auth Delete (Cascades to profile/owner if FK set, but we handle it just in case)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(owner.user_id)
    if (authError) throw authError
    
    // Note: Database triggers/FKs should handle the rest, but we revalidate manually
    revalidatePath('/admin/owners')
    revalidatePath('/admin/buildings')
    
    return { success: true, message: 'Owner and all associated data removed' }
  } catch (err: any) {
    console.error('Error deleting owner:', err)
    return { success: false, error: err.message || 'Failed to delete owner' }
  }
}
