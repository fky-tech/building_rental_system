import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { Plus, CreditCard, Check, Clock, AlertCircle } from 'lucide-react'
import { AddPaymentModal } from './AddPaymentModal'

export default async function OwnerPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ownerRec } = await supabase.from('owners').select('id').eq('user_id', user?.id).single()

  // Fetch active leases for the payment modal dropdown
  const { data: activeLeases } = await supabase
    .from('leases')
    .select('id, monthly_rent, rooms(room_number), tenants(full_name)')
    .eq('status', 'active')
    .eq('rooms.buildings.owner_id', ownerRec?.id)

  const leasesList = activeLeases?.map(l => ({
    id: l.id,
    // @ts-ignore
    tenant_name: l.tenants?.full_name || 'Unknown',
    // @ts-ignore
    room_number: l.rooms?.room_number || '?',
    monthly_rent: Number(l.monthly_rent)
  })) || []

  const { data: payments } = await supabase
    .from('payments')
    .select('*, leases(rooms(room_number), tenants(full_name))')
    .eq('owner_id', ownerRec?.id)
    .order('payment_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payments</h1>
        <AddPaymentModal leases={leasesList} />
      </div>

      <Card className="p-0 overflow-hidden">
         <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Tenant / Room</Th>
              <Th>Amount</Th>
              <Th>Method / Tx ID</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!payments || payments.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <CreditCard className="h-10 w-10 text-gray-300 mb-2" />
                    <p>No payments recorded yet.</p>
                  </div>
                </Td>
              </Tr>
            ) : (
              payments.map((payment) => (
                <Tr key={payment.id}>
                  <Td>{payment.payment_date}</Td>
                  <Td>
                     {/* @ts-ignore */}
                     <span className="font-semibold block text-gray-900">{payment.leases?.tenants?.full_name || 'Unassigned'}</span>
                     {/* @ts-ignore */}
                     {payment.leases && <span className="text-xs text-gray-500">Room {payment.leases?.rooms?.room_number}</span>}
                  </Td>
                  <Td className="font-medium text-emerald-600">${payment.amount}</Td>
                  <Td>
                     <span className="capitalize block">{payment.payment_method}</span>
                     <span className="text-xs text-gray-500 font-mono">{payment.transaction_id || '-'}</span>
                  </Td>
                  <Td>
                    {payment.status === 'verified' && <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-1 text-xs rounded-full"><Check className="w-3 h-3 mr-1"/> Verified</span>}
                    {payment.status === 'pending' && <span className="inline-flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 text-xs rounded-full"><Clock className="w-3 h-3 mr-1"/> Pending</span>}
                    {payment.status === 'unassigned' && <span className="inline-flex items-center text-red-700 bg-red-100 px-2 py-1 text-xs rounded-full"><AlertCircle className="w-3 h-3 mr-1"/> Unassigned</span>}
                  </Td>
                  <Td className="text-right">
                    {payment.status === 'unassigned' ? (
                       <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">Assign Lease</Button>
                    ) : (
                       <Button variant="ghost" size="sm">Details</Button>
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </div>
  )
}
