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

  // Get current building from slug
  const headersList = await (await import('next/headers')).headers()
  const host = headersList.get('host') || ''
  const slug = host.includes('.localhost') ? host.split('.localhost')[0] : null

  const { data: currentBuilding } = await supabase
    .from('buildings')
    .select('id, name')
    .eq('slug', slug)
    .single()

  // Identify who has already paid THIS month
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('lease_id')
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .eq('status', 'verified')
  
  const paidLeaseIds = monthlyPayments?.map(p => p.lease_id).filter(Boolean) || []

  // Fetch active leases for the payment modal dropdown for THIS building only
  const { data: activeLeases } = await supabase
    .from('leases')
    .select('id, monthly_rent, rooms!inner(room_number, building_id), tenants!inner(full_name)')
    .eq('status', 'active')
    .eq('rooms.building_id', currentBuilding?.id)

  // Filter out those who already paid this month
  const unpaidLeases = activeLeases?.filter(l => !paidLeaseIds.includes(l.id)) || []

  const leasesList = unpaidLeases.map(l => ({
    id: l.id,
    // @ts-ignore
    tenant_name: l.tenants?.full_name || 'Unknown',
    // @ts-ignore
    room_number: l.rooms?.room_number || '?',
    monthly_rent: Number(l.monthly_rent)
  })) || []

  const { data: payments } = await supabase
    .from('payments')
    .select('*, leases!inner(rooms!inner(room_number, building_id), tenants!inner(full_name))')
    .eq('leases.rooms.building_id', currentBuilding?.id)
    .order('payment_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payments</h1>
        <AddPaymentModal leases={leasesList} />
      </div>

      <OwnerPaymentsClient initialPayments={payments || []} />
    </div>
  )
}

import { OwnerPaymentsClient } from './OwnerPaymentsClient'
