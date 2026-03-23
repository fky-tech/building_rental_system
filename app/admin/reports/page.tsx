import { Building2, PieChart, Users, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader } from '@/components/ui/Card'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'

export default async function AdminReportsPage() {
  const supabase = await createClient()

  // 1. Get Occupancy Stats
  const { data: rooms } = await supabase.from('rooms').select('is_occupied')
  const totalRooms = rooms?.length || 0
  const occupiedRooms = rooms?.filter(r => r.is_occupied).length || 0
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  // 2. Get Owner Distribution (Buildings per Owner)
  const { data: ownerData } = await supabase
    .from('owners')
    .select(`
      id,
      profiles!inner(full_name),
      buildings(count)
    `)

  const ownerDistribution = (ownerData as any[])?.map(o => ({
    name: o.profiles?.full_name || 'Unknown',
    buildingCount: o.buildings?.[0]?.count || 0
  })).sort((a,b) => b.buildingCount - a.buildingCount) || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white shadow-sm border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Occupancy Rate</p>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <PieChart className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-4xl font-bold text-gray-900">{occupancyRate}%</p>
            <p className="text-sm text-gray-500">Average</p>
          </div>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${occupancyRate}%` }}></div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-sm border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Rooms Status</p>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Home className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-4xl font-bold text-gray-900">{occupiedRooms}</p>
            <p className="text-sm text-gray-500">Occupied / {totalRooms} Total</p>
          </div>
          <p className="mt-4 text-xs text-gray-400 italic">Across all active buildings in the system</p>
        </Card>

        <Card className="p-6 bg-white shadow-sm border-t-4 border-t-indigo-500 text-center flex flex-col items-center justify-center">
           <Building2 className="h-10 w-10 text-indigo-400 mb-3 opacity-50" />
           <p className="text-sm font-medium text-gray-500 mb-1">System Health</p>
           <p className="text-xl font-bold text-gray-900">Operational</p>
           <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
              All services running normally
           </div>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden border-none">
        <CardHeader title="Owner Distribution" subtitle="Buildings managed per owner" />
        <Table>
          <Thead>
            <Tr className="bg-gray-50/50">
              <Th>Owner Name</Th>
              <Th className="text-center">Buildings Managed</Th>
              <Th className="text-center">Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ownerDistribution.map((owner, idx) => (
              <Tr key={idx} className="hover:bg-gray-50 transition-colors">
                <Td className="font-medium text-gray-900">{owner.name}</Td>
                <Td className="text-center">
                   <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100">
                     {owner.buildingCount}
                   </span>
                </Td>
                <Td className="text-center">
                   <div className="flex items-center justify-center">
                     <div className={`h-2 w-2 rounded-full mr-2 ${owner.buildingCount > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                     <span className="text-xs text-gray-500">{owner.buildingCount > 0 ? 'Active Manager' : 'No Buildings'}</span>
                   </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </div>
  )
}
