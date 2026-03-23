import { createClient } from '@/lib/supabase/server'
import { ReportsClient } from './ReportsClient'

export default async function OwnerReportsPage() {
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

  // 1. Monthly Income (Verified payments this month in this building)
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, leases!inner(rooms!inner(building_id))')
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .eq('status', 'verified')
    .eq('leases.rooms.building_id', currentBuilding?.id)

  const monthlyIncome = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // 2. Unpaid Tenants (Active leases without verified payment this month)
  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('lease_id')
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .eq('status', 'verified')
  
  const paidLeaseIds = monthlyPayments?.map(p => p.lease_id).filter(Boolean) || []

  const { data: activeLeases } = await supabase
    .from('leases')
    .select('id, rooms!inner(building_id)')
    .eq('status', 'active')
    .eq('rooms.building_id', currentBuilding?.id)

  const unpaidCount = activeLeases ? activeLeases.filter(l => !paidLeaseIds.includes(l.id)).length : 0

  // 3. Occupancy Rate
  const { count: totalRooms } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', currentBuilding?.id)

  const { count: occupiedRooms } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', currentBuilding?.id)
    .eq('status', 'occupied')

  const occupancyRate = totalRooms && totalRooms > 0 
    ? Math.round((Number(occupiedRooms) / totalRooms) * 100) 
    : 0
  
  return (
    <ReportsClient 
      monthlyIncome={monthlyIncome} 
      unpaidCount={unpaidCount} 
      occupancyRate={occupancyRate} 
    />
  )
}
