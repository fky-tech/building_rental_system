'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBuildingAction(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const owner_id = formData.get('owner_id') as string
    const city = formData.get('city') as string
    const sub_city = formData.get('sub_city') as string
    const address = formData.get('address') as string

    if (!name || !slug || !owner_id) {
      return { success: false, error: 'Name, slug, and owner are required' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('buildings')
      .insert({
        name,
        slug,
        owner_id,
        city: city || null,
        sub_city: sub_city || null,
        address: address || null,
        status: 'active'
      })

    if (error) {
      console.error('Error creating building:', error)
      // Check for unique slug constraint violation
      if (error.code === '23505' && error.message.includes('slug')) {
         return { success: false, error: 'Subdomain/Slug already exists. Please choose another.' }
      }
      return { success: false, error: 'Failed to create building.' }
    }

    revalidatePath('/admin/buildings')
    revalidatePath('/', 'layout')

    return { success: true, message: 'Building created successfully' }
  } catch (err: any) {
    console.error('Unexpected error creating building:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function updateBuildingAction(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const owner_id = formData.get('owner_id') as string
    const status = formData.get('status') as string

    if (!id || !name || !owner_id || !status) {
      return { success: false, error: 'All fields are required' }
    }

    const supabase = await createClient()

    // 1. Update building
    const { error: buildingError } = await supabase
      .from('buildings')
      .update({ name, owner_id, status })
      .eq('id', id)

    if (buildingError) throw buildingError

    revalidatePath('/admin/buildings')
    revalidatePath('/', 'layout')

    return { success: true, message: 'Building updated successfully' }
  } catch (err: any) {
    console.error('Error updating building:', err)
    return { success: false, error: 'Failed to update building.' }
  }
}
