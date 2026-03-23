import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { BarChart, Users, TrendingUp } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Property Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <TrendingUp className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-gray-500">Monthly Income (Verified)</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">Birr {monthlyIncome.toFixed(2)}</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600 mb-3">
            <Users className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-gray-500">Unpaid Tenants</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{unpaidCount}</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
            <BarChart className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{occupancyRate}%</p>
        </Card>
      </div>

      <Card className="mt-8">
         <div className="h-64 flex flex-col justify-center items-center text-gray-400">
            <BarChart className="h-10 w-10 mb-2" />
            <p>Income vs. Expected Rent Chart</p>
         </div>
      </Card>
    </div>
  )
}
