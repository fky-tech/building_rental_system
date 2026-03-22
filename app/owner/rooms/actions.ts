'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRoomAction(prevState: any, formData: FormData) {
  try {
    const building_id = formData.get('building_id') as string
    const room_number = formData.get('room_number') as string
    const floor_number = formData.get('floor_number') as string
    const room_type = formData.get('room_type') as string
    const rent_amount = parseFloat(formData.get('rent_amount') as string)
    const description = formData.get('description') as string

    if (!building_id || !room_number || isNaN(rent_amount)) {
      return { success: false, error: 'Building, room number, and rent are required' }
    }

    const supabase = await createClient()
    
    // Verify ownership (optional but good for security)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: building } = await supabase
        .from('buildings')
        .select('owner_id, owners!inner(user_id)')
        .eq('id', building_id)
        // @ts-ignore
        .eq('owners.user_id', user?.id)
        .single()
    
    if (!building) return { success: false, error: 'Unauthorized or building not found' }

    const { error } = await supabase.from('rooms').insert({
      building_id,
      room_number,
      floor_number: floor_number ? parseInt(floor_number) : null,
      room_type,
      rent_amount,
      description,
      status: 'available'
    })

    if (error) throw error

    revalidatePath('/owner/rooms')
    return { success: true, message: 'Room created successfully' }
  } catch (err: any) {
    console.error('Error creating room:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function updateRoomAction(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string
    const room_number = formData.get('room_number') as string
    const floor_number = formData.get('floor_number') as string
    const room_type = formData.get('room_type') as string
    const rent_amount = parseFloat(formData.get('rent_amount') as string)
    const status = formData.get('status') as string
    const description = formData.get('description') as string

    if (!id || !room_number || isNaN(rent_amount)) {
      return { success: false, error: 'ID, room number, and rent are required' }
    }

    const supabase = await createClient()

    const { error } = await supabase.from('rooms').update({
      room_number,
      floor_number: floor_number ? parseInt(floor_number) : null,
      room_type,
      rent_amount,
      status,
      description
    }).eq('id', id)

    if (error) throw error

    revalidatePath('/owner/rooms')
    return { success: true, message: 'Room updated successfully' }
  } catch (err: any) {
    console.error('Error updating room:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}

export async function deleteRoomAction(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/owner/rooms')
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting room:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
