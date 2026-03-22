import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader } from '@/components/ui/Card'
import { Home, CheckCircle, AlertCircle, TrendingDown, Clock } from 'lucide-react'

export default async function OwnerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ownerRec } = await supabase.from('owners').select('id').eq('user_id', user?.id).single()

  const { count: roomsCount } = await supabase.from('rooms').select('*, buildings!inner(owner_id)', { count: 'exact', head: true }).eq('buildings.owner_id', ownerRec?.id) // Proxy count
  
  const stats = [
    { name: 'Total Rooms', value: roomsCount || 0, icon: Home, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Occupied Rooms', value: 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Available Rooms', value: 0, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Unpaid Rents', value: 0, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
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
