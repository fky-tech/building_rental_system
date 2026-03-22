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

  // 2. Count active leases in this building not in the paid list
  let unpaidCount = 0
  const { data: activeLeases } = await supabase
    .from('leases')
    .select('id, rooms!inner(building_id)')
    .eq('status', 'active')
    .eq('rooms.building_id', currentBuilding?.id)

  if (activeLeases) {
    unpaidCount = activeLeases.filter(lease => !paidLeaseIds.includes(lease.id)).length
  }
  
  const stats = [
    { name: 'Total Rooms', value: totalRooms || 0, icon: Home, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Occupied Rooms', value: occupiedRooms || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Available Rooms', value: availableRooms || 0, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Unpaid Rents', value: unpaidCount, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Owner Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="flex flex-col p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                   <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
         <Card>
            <CardHeader title="Recent Payments" />
            <div className="h-64 flex flex-col justify-center items-center text-gray-400">
              <Clock className="h-8 w-8 mb-2" />
              <p>No recent payments found</p>
            </div>
         </Card>
      </div>
    </div>
  )
}
