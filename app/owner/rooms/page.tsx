import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { Plus, Edit2, KeySquare } from 'lucide-react'

import { AddRoomModal } from './AddRoomModal'
import { EditRoomModal } from './EditRoomModal'

export default async function OwnerRoomsPage() {
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

  // Fetch rooms for the specific building
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*, buildings!inner(name, owner_id)')
    .eq('building_id', currentBuilding?.id)
    .order('room_number', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Rooms Management</h1>
        {currentBuilding && <AddRoomModal building={currentBuilding} />}
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Room Number</Th>
              <Th>Building</Th>
              <Th>Floor / Type</Th>
              <Th>Rent</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!rooms || rooms.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <KeySquare className="h-10 w-10 text-gray-300 mb-2" />
                    <p>No rooms added yet.</p>
                  </div>
                </Td>
              </Tr>
            ) : (
              rooms.map((room) => (
                <Tr key={room.id}>
                  <Td className="font-semibold text-gray-900 line-clamp-1 max-w-xs">{room.room_number}</Td>
                  {/* @ts-ignore */}
                  <Td className="text-gray-600 font-medium">{room.buildings?.name}</Td>
                  <Td>Fl {room.floor_number} - <span className="capitalize">{room.room_type}</span></Td>
                  <Td className="font-medium text-emerald-600">Birr {room.rent_amount}</Td>
                  <Td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.status === 'available' ? 'bg-green-100 text-green-800' : 
                      room.status === 'occupied' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {room.status}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <EditRoomModal room={room} />
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
