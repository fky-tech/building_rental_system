'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTenantAction(prevState: any, formData: FormData) {
  try {
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const id_number = formData.get('id_number') as string
    const notes = formData.get('notes') as string

    // Lease data
    const room_id = formData.get('room_id') as string
    const start_date = formData.get('start_date') as string
    const end_date = formData.get('end_date') as string
    const monthly_rent_str = formData.get('monthly_rent') as string
    const monthly_rent = parseFloat(monthly_rent_str)
    const payment_due_day_str = formData.get('payment_due_day') as string
    const payment_due_day = parseInt(payment_due_day_str)

    if (!full_name) {
      return { success: false, error: 'Full name is required' }
    }

    if (!room_id || !start_date || isNaN(monthly_rent)) {
      return { success: false, error: 'Lease details (room, start date, rent) are required' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: ownerRec } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    if (!ownerRec) return { success: false, error: 'Owner record not found' }

    // 1. Create Tenant
    const { data: tenant, error: tenantError } = await supabase.from('tenants').insert({
      owner_id: ownerRec.id,
      full_name,
      phone: phone || null,
      id_number: id_number || null,
      notes: notes || null
    }).select().single()

    if (tenantError) {
      console.error('Error creating tenant:', tenantError)
      return { success: false, error: 'Failed to create tenant.' }
    }

    // 2. Create Lease
    const { error: leaseError } = await supabase.from('leases').insert({
      room_id,
      tenant_id: tenant.id,
      start_date,
      end_date: end_date || null,
      monthly_rent,
      payment_due_day: isNaN(payment_due_day) ? 5 : payment_due_day,
      status: 'active'
    })

    if (leaseError) {
      console.error('Error creating lease:', leaseError)
      // Rollback tenant creation perhaps? For simplicity, we just return error
      return { success: false, error: 'Tenant created, but lease failed. Please check lease manually.' }
    }

    // 3. Mark room as occupied
    await supabase.from('rooms').update({ status: 'occupied' }).eq('id', room_id)

    revalidatePath('/owner/tenants')
    revalidatePath('/owner/rooms')
    return { success: true, message: 'Tenant registered and lease created successfully' }
  } catch (err: any) {
    console.error('Unexpected error in integrated tenant creation:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
