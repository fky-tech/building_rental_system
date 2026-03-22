'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRoomAction(prevState: any, formData: FormData) {
  try {
    const building_id = formData.get('building_id') as string
    const room_number = formData.get('room_number') as string
    const floor_number_str = formData.get('floor_number') as string
    const floor_number = floor_number_str ? parseInt(floor_number_str) : null
    const room_type = formData.get('room_type') as string
    const rent_amount_str = formData.get('rent_amount') as string
    const rent_amount = parseFloat(rent_amount_str)
    const description = formData.get('description') as string

    if (!building_id || !room_number || isNaN(rent_amount)) {
      return { success: false, error: 'Building, room number, and rent amount are required' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: ownerRec } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    if (!ownerRec) return { success: false, error: 'Owner record not found' }

    // Verify ownership
    const { data: building } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', building_id)
      .eq('owner_id', ownerRec.id)
      .single()

    if (!building) return { success: false, error: 'Invalid building selected' }

    const { error } = await supabase.from('rooms').insert({
      building_id,
      room_number,
      floor_number,
      room_type: room_type || 'office',
      rent_amount,
      description: description || null,
      status: 'available'
    })

    if (error) {
      console.error('Error creating room:', error)
      return { success: false, error: 'Failed to create room.' }
    }

    revalidatePath('/owner/rooms')
    return { success: true, message: 'Room created successfully' }
  } catch (err: any) {
    console.error('Unexpected error creating room:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
