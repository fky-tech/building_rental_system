'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(prevState: any, formData: FormData) {
  try {
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string

    if (!full_name) return { success: false, error: 'Full name is required' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // 1. Update Auth Email if changed
    if (email && email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({ email })
      if (authError) {
        console.error('Error updating auth email:', authError)
        return { success: false, error: authError.message }
      }
    }

    // 2. Update Profile
    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name, 
        phone: phone || null 
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: 'Failed to update profile.' }
    }

    revalidatePath('/owner/settings')
    return { 
      success: true, 
      message: email !== user.email 
        ? 'Profile updated. Please check your NEW email for a verification link to complete the email change.' 
        : 'Profile updated successfully' 
    }
  } catch (err: any) {
    console.error('Unexpected error updating profile:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function updatePasswordAction(prevState: any, formData: FormData) {
  try {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' }
    }
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      console.error('Error updating password:', error)
      return { success: false, error: error.message }
    }

    // Also mark must_change_password as false if it was true
    await supabase.from('profiles').update({ must_change_password: false }).eq('id', (await supabase.auth.getUser()).data.user?.id)

    return { success: true, message: 'Password updated successfully' }
  } catch (err: any) {
    console.error('Unexpected error updating password:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
