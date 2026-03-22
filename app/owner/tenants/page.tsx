import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { Plus, Users, UserCog } from 'lucide-react'

import { AddTenantModal } from './AddTenantModal'
import { EditTenantModal } from './EditTenantModal'

export default async function OwnerTenantsPage() {
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

  // Fetch available rooms for the integrated tenant/lease modal for THIS building only
  const { data: availableRooms } = await supabase
    .from('rooms')
    .select('id, room_number, rent_amount')
    .eq('building_id', currentBuilding?.id)
    .eq('status', 'available')

  const roomsList = availableRooms?.map(r => ({
    id: r.id,
    room_number: r.room_number,
    building_name: currentBuilding?.name || 'Unknown',
    rent: Number(r.rent_amount)
  })) || []

  // Fetch tenants who have leases in this specific building
  const { data: buildingLeases } = await supabase
    .from('leases')
    .select('id, tenant_id, rooms!inner(building_id)')
    .eq('rooms.building_id', currentBuilding?.id)
    .eq('status', 'active')
  
  const leaseMap = new Map((buildingLeases || []).map(l => [l.tenant_id, l.id]))
  const tenantIds = Array.from(leaseMap.keys())

  const { data: tenantsResult } = await supabase
    .from('tenants')
    .select('*')
    .in('id', tenantIds)
    .order('full_name', { ascending: true })

  const tenants = tenantsResult?.map(t => ({
    ...t,
    active_lease_id: leaseMap.get(t.id)
  })) || []

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
                    <EditTenantModal tenant={tenant} />
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
