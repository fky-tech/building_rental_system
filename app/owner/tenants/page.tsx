import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { Plus, Users, UserCog } from 'lucide-react'

import { AddTenantModal } from './AddTenantModal'

export default async function OwnerTenantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ownerRec } = await supabase.from('owners').select('id').eq('user_id', user?.id).single()

  // Fetch available rooms for the integrated tenant/lease modal
  const { data: availableRooms } = await supabase
    .from('rooms')
    .select('id, room_number, rent_amount, buildings!inner(name, owner_id)')
    // @ts-ignore
    .eq('buildings.owner_id', ownerRec?.id)
    .eq('status', 'available')

  const roomsList = availableRooms?.map(r => ({
    id: r.id,
    room_number: r.room_number,
    // @ts-ignore
    building_name: r.buildings?.name || 'Unknown',
    rent: Number(r.rent_amount)
  })) || []

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*')
    .eq('owner_id', ownerRec?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tenants Directory</h1>
        <AddTenantModal rooms={roomsList} />
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Full Name</Th>
              <Th>Contact Phone</Th>
              <Th>ID Number</Th>
              <Th>Added On</Th>
              <Th className="text-right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!tenants || tenants.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="h-10 w-10 text-gray-300 mb-2" />
                    <p>No tenants registered yet.</p>
                  </div>
                </Td>
              </Tr>
            ) : (
              tenants.map((tenant) => (
                <Tr key={tenant.id}>
                  <Td className="font-medium text-gray-900">{tenant.full_name}</Td>
                  <Td>{tenant.phone || '-'}</Td>
                  <Td className="font-mono text-sm">{tenant.id_number || 'N/A'}</Td>
                  <Td className="text-sm text-gray-500">{new Date(tenant.created_at).toLocaleDateString()}</Td>
                  <Td className="text-right">
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900"><UserCog className="w-4 h-4 mr-2" /> Manage</Button>
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
