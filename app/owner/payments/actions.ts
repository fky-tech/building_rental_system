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

    const months_to_pay = parseInt(formData.get('months_to_pay') as string || '1')
    const amountPerMonth = amount / months_to_pay

    // Determine target month/year from payment date (or current date if desired)
    const pDate = new Date(payment_date)
    
    // Create multiple payment records if multi-month is selected
    const paymentsToInsert = []
    
    for (let i = 0; i < months_to_pay; i++) {
      const targetDate = new Date(pDate)
      targetDate.setMonth(pDate.getMonth() + i)
      const month = targetDate.getMonth() + 1
      const year = targetDate.getFullYear()
      
      paymentsToInsert.push({
        owner_id: ownerRec.id,
        lease_id: lease_id || null,
        amount: amountPerMonth,
        payment_method,
        payment_date,
        month,
        year,
        // Append index to transaction_id to maintain uniqueness if multiple months are paid at once
        transaction_id: transaction_id ? (months_to_pay > 1 ? `${transaction_id}-${i + 1}` : transaction_id) : null,
        status: lease_id ? 'pending' : 'unassigned',
        note: note || (months_to_pay > 1 ? `Multi-month payment (${i + 1}/${months_to_pay})` : null)
      })
    }

    const { error } = await supabase.from('payments').insert(paymentsToInsert)

    if (error) {
      console.error('Error recording payment(s):', error)
      return { success: false, error: 'Failed to record payment(s).' }
    }

    revalidatePath('/owner/payments')
    return { success: true, message: 'Payment recorded successfully' }
  } catch (err: any) {
    console.error('Unexpected error recording payment:', err)
    return { success: false, error: err.message || 'An unexpected error occurred' }
  }
}
