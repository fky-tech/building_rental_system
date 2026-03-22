'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPaymentAction(prevState: any, formData: FormData) {
  try {
    const amount_str = formData.get('amount') as string
    const amount = parseFloat(amount_str)
    const payment_method = formData.get('payment_method') as string
    const payment_date = formData.get('payment_date') as string
    const transaction_id = formData.get('transaction_id') as string
    const note = formData.get('note') as string
    const lease_id = formData.get('lease_id') as string

    if (isNaN(amount) || !payment_method || !payment_date) {
      return { success: false, error: 'Amount, method, and date are required' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: ownerRec } = await supabase.from('owners').select('id').eq('user_id', user.id).single()
    if (!ownerRec) return { success: false, error: 'Owner record not found' }

    // Determine target month/year from payment date (or current date if desired)
    const pDate = new Date(payment_date)
    const month = pDate.getMonth() + 1
    const year = pDate.getFullYear()

    const { error } = await supabase.from('payments').insert({
      owner_id: ownerRec.id,
      lease_id: lease_id || null,
      amount,
      payment_method,
      payment_date,
      month,
      year,
      transaction_id: transaction_id || null,
      status: lease_id ? 'pending' : 'unassigned',
      note: note || null
    })

    if (error) {
      console.error('Error recording payment:', error)
      return { success: false, error: 'Failed to record payment.' }
    }

    revalidatePath('/owner/payments')
    return { success: true, message: 'Payment recorded successfully' }
  } catch (err: any) {
    console.error('Unexpected error recording payment:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
