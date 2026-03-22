import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader } from '@/components/ui/Card'
import { Home, CheckCircle, AlertCircle, TrendingDown, Clock } from 'lucide-react'

export default async function OwnerDashboardPage() {
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

  // Fetch building-specific room counts
  const { count: totalRooms } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', currentBuilding?.id)

  const { count: occupiedRooms } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', currentBuilding?.id)
    .eq('status', 'occupied')

  const { count: availableRooms } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', currentBuilding?.id)
    .eq('status', 'available')

  // Calculate unpaid leases for THIS month in THIS building
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // 1. Get IDs of leases that have a verified payment this month
  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('lease_id')
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .eq('status', 'verified')
  
  const paidLeaseIds = monthlyPayments?.map(p => p.lease_id).filter(Boolean) || []

  const todayDay = new Date().getDate()
  
  // 2. Get detailed info for UNPAID active leases in this building
  const { data: activeLeases } = await supabase
    .from('leases')
    .select('id, payment_due_day, monthly_rent, rooms!inner(room_number, building_id), tenants!inner(full_name, phone)')
    .eq('status', 'active')
    .eq('rooms.building_id', currentBuilding?.id)

  const unpaidLeasesDetail = activeLeases?.filter(lease => {
    const isPaid = paidLeaseIds.includes(lease.id)
    // User wants it to count when due day arrives
    return !isPaid && todayDay >= (lease as any).payment_due_day
  }).map(l => ({
    id: l.id,
    due_day: (l as any).payment_due_day,
    monthly_rent: l.monthly_rent,
    // @ts-ignore
    tenant_name: l.tenants?.full_name || 'Unknown',
    // @ts-ignore
    phone: l.tenants?.phone || '-',
    // @ts-ignore
    room_number: l.rooms?.room_number || '?'
  })) || []

  const stats = [
    { name: 'Total Rooms', value: totalRooms || 0, color: 'text-blue-600', bg: 'bg-blue-100', type: 'total' },
    { name: 'Occupied Rooms', value: occupiedRooms || 0, color: 'text-green-600', bg: 'bg-green-100', type: 'occupied' },
    { name: 'Available Rooms', value: availableRooms || 0, color: 'text-yellow-600', bg: 'bg-yellow-100', type: 'available' },
    { name: 'Unpaid Rents', value: unpaidLeasesDetail.length, color: 'text-red-600', bg: 'bg-red-100', type: 'unpaid' },
  ]

  return (
    <DashboardClient stats={stats} unpaidLeases={unpaidLeasesDetail} />
  )
}

import { DashboardClient } from './DashboardClient'
