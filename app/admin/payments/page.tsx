import { createClient } from '@/lib/supabase/server'
import { PaymentsClient } from './PaymentsClient'

export default async function PaymentsMonitorPage() {
  const supabase = await createClient()

  // Fetch all payments for admin with full details
  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      *,
      leases(
        room_id,
        rooms(
          room_number,
          buildings(name)
        ),
        tenants(
          full_name
        )
      )
    `)
    .order('payment_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payments Monitor</h1>
      </div>

      <PaymentsClient initialPayments={payments || []} />
    </div>
  )
}
