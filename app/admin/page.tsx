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

  // Fetch 5 most recent owners
  const { data: recentOwnersData } = await supabase
    .from('owners')
    .select('*, profiles!inner(full_name, created_at)')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentOwners = (recentOwnersData as any[])?.map(o => ({
    id: o.id,
    name: o.profiles?.full_name || 'Unknown',
    joined: new Date(o.created_at).toLocaleDateString(),
    status: o.status
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="flex flex-col items-center justify-center p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-2xl ${stat.bg} mb-4`}>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-8">
        <Card className="overflow-hidden shadow-sm">
          <CardHeader title="Recently Joined Owners" subtitle="Latest owner registrations" />
          <div className="divide-y divide-gray-100">
            {recentOwners.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No recent owners</div>
            ) : (
              recentOwners.map((owner) => (
                <div key={owner.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                      {owner.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900">{owner.name}</p>
                      <p className="text-xs text-gray-500">Joined on {owner.joined}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    owner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {owner.status || 'inactive'}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
        
        {/* You could add another card here for System Activity or Health */}
        <Card className="p-6 flex flex-col items-center justify-center text-center bg-blue-600 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="z-10">
               <Users className="h-12 w-12 mb-4 opacity-80" />
               <h3 className="text-xl font-bold mb-2">Welcome to your Control Center</h3>
               <p className="text-blue-100 text-sm max-w-xs mx-auto">
                 Manage buildings, owners, and system-wide configurations from one centralized platform.
               </p>
            </div>
        </Card>
      </div>
    </div>
  )
}
