import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { AddBuildingModal } from './AddBuildingModal'
import { EditBuildingModal } from './EditBuildingModal'

export default async function BuildingsPage() {
  const supabase = await createClient()

  // Fetch buildings joined with owner details
  const { data: buildings } = await supabase
    .from('buildings')
    .select('*, owners(id, status, profiles(full_name))')
    .order('created_at', { ascending: false })

  // Fetch all owners for the assignment dropdown
  const { data: owners } = await supabase
    .from('owners')
    .select('id, status, profiles!inner(full_name)')
    
  // @ts-ignore
  const ownersList = owners?.map(o => ({ 
    id: o.id, 
    // @ts-ignore - Handle array from Supabase join
    name: `${o.profiles?.[0]?.full_name || o.profiles?.full_name || 'Unknown'}${o.status !== 'active' ? ' (Inactive)' : ''}` 
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Buildings Management</h1>
        <AddBuildingModal owners={ownersList} />
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Slug / Subdomain</Th>
              <Th>Location</Th>
              <Th>Owner</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!buildings || buildings.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-8 text-gray-500">No buildings found.</Td>
              </Tr>
            ) : (
              buildings.map((building) => (
                <Tr key={building.id}>
                  <Td className="font-medium text-gray-900">{building.name}</Td>
                  <Td className="text-blue-600">{building.slug}</Td>
                  <Td>{building.city}, {building.sub_city}</Td>
                  <Td>
                    {/* @ts-ignore */}
                    {building.owners?.profiles?.full_name || building.owners?.[0]?.profiles?.full_name || 'No Owner'}
                  </Td>
                  <Td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      building.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {building.status}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <EditBuildingModal building={building} owners={ownersList} />
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
