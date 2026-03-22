import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader } from '@/components/ui/Card'
import { Building2, Home, Users, CreditCard } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // For Admin dashboard, we count totals.
  const [{ count: ownersCount }, { count: buildingsCount }, { count: roomsCount }, { count: paymentsCount }] = await Promise.all([
    supabase.from('owners').select('*', { count: 'exact', head: true }),
    supabase.from('buildings').select('*', { count: 'exact', head: true }),
    supabase.from('rooms').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('*', { count: 'exact', head: true })
  ])

  const stats = [
    { name: 'Total Owners', value: ownersCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Buildings', value: buildingsCount || 0, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Total Rooms', value: roomsCount || 0, icon: Home, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Total Payments', value: paymentsCount || 0, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="flex flex-col items-center justify-center p-6 text-center">
              <div className={`p-3 rounded-full ${stat.bg} mb-4`}>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Placeholder for payments overview chart or recent list */}
      <Card className="mt-8">
        <CardHeader title="Payments Overview" subtitle="System-wide payment tracking" />
        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          [Payments Chart / Recent Activities Here]
        </div>
      </Card>
    </div>
  )
}
