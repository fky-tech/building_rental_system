'use client'

import { Card } from '@/components/ui/Card'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { KeySquare } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { AddRoomModal } from './AddRoomModal'
import { EditRoomModal } from './EditRoomModal'

interface RoomsClientProps {
  rooms: any[]
  currentBuilding: any
}

export function RoomsClient({ rooms, currentBuilding }: RoomsClientProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('rooms.title')}</h1>
        {currentBuilding && <AddRoomModal building={currentBuilding} />}
      </div>

      <Card className="p-0 overflow-hidden text-left">
        <Table>
          <Thead>
            <Tr>
              <Th>{t('rooms.number')}</Th>
              <Th>{t('rooms.building')}</Th>
              <Th>{t('rooms.floor_type')}</Th>
              <Th>{t('rooms.rent')}</Th>
              <Th>{t('rooms.status')}</Th>
              <Th className="text-right">{t('rooms.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!rooms || rooms.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <KeySquare className="h-10 w-10 text-gray-300 mb-2" />
                    <p>{t('rooms.no_rooms')}</p>
                  </div>
                </Td>
              </Tr>
            ) : (
              rooms.map((room) => (
                <Tr key={room.id}>
                  <Td className="font-semibold text-gray-900 line-clamp-1 max-w-xs">{room.room_number}</Td>
                  {/* @ts-ignore */}
                  <Td className="text-gray-600 font-medium">{room.buildings?.name}</Td>
                  <Td>{t('rooms.floor_abbr')} {room.floor_number} - <span className="capitalize">{t(`rooms.type_${room.room_type || 'default'}`)}</span></Td>
                  <Td className="font-medium text-emerald-600">{t('common.birr')} {room.rent_amount}</Td>
                  <Td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.status === 'available' ? 'bg-green-100 text-green-800' : 
                      room.status === 'occupied' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {t(`rooms.status_${room.status}`)}
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
