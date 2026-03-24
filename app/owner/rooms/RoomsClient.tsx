'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { KeySquare, ChevronDown, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { AddRoomModal } from './AddRoomModal'
import { EditRoomModal } from './EditRoomModal'

interface RoomsClientProps {
  rooms: any[]
  currentBuilding: any
}

export function RoomsClient({ rooms, currentBuilding }: RoomsClientProps) {
  const { t } = useLanguage()
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({})

  const toggleFloor = (floor: string) => {
    setExpandedFloors(prev => ({ ...prev, [floor]: !prev[floor] }))
  }

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.floor_number !== null ? room.floor_number.toString() : 'N/A'
    if (!acc[floor]) acc[floor] = []
    acc[floor].push(room)
    return acc
  }, {} as Record<string, any[]>)

  // Sort floors logically (numbers first, then N/A)
  const sortedFloors = Object.keys(roomsByFloor).sort((a, b) => {
    if (a === 'N/A') return 1
    if (b === 'N/A') return -1
    return parseInt(a) - parseInt(b)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('rooms.title')}</h1>
        {currentBuilding && <AddRoomModal building={currentBuilding} />}
      </div>

      <Card className="p-0 overflow-hidden text-left">
        <Table>

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
                sortedFloors.map(floor => (
                    <React.Fragment key={floor}>
                        <Tr className="bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => toggleFloor(floor)}>
                            <Td colSpan={6} className="font-semibold text-gray-800">
                                <div className="flex items-center">
                                    {expandedFloors[floor] ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                                    {floor === 'N/A' ? t('rooms.floor_abbr') + ' N/A' : t('rooms.floor_abbr') + ' ' + floor} 
                                    <span className="ml-2 text-sm text-gray-500 font-normal">({roomsByFloor[floor].length})</span>
                                </div>
                            </Td>
                        </Tr>
                        {expandedFloors[floor] && (
                          <React.Fragment>
                            <Tr className="bg-gray-100/50 text-xs text-gray-500 uppercase border-y border-gray-200">
                              <Th className="py-2 pl-8 font-semibold">{t('rooms.number')}</Th>
                              <Th className="py-2 font-semibold">{t('rooms.building')}</Th>
                              <Th className="py-2 font-semibold">{t('rooms.type')}</Th>
                              <Th className="py-2 font-semibold">{t('rooms.rent')}</Th>
                              <Th className="py-2 font-semibold">{t('rooms.status')}</Th>
                              <Th className="py-2 text-right pr-6 font-semibold">{t('rooms.actions')}</Th>
                            </Tr>
                            {roomsByFloor[floor].map((room: any) => (
                              <Tr key={room.id} className="bg-white">
                                <Td className="font-semibold text-gray-900 line-clamp-1 max-w-xs pl-8">{room.room_number}</Td>
                                {/* @ts-ignore */}
                                <Td className="text-gray-600 font-medium">{room.buildings?.name}</Td>
                                <Td><span className="capitalize">{t(`rooms.type_${room.room_type || 'default'}`)}</span></Td>
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
                            ))}
                          </React.Fragment>
                        )}
                    </React.Fragment>
                ))
            )}
          </Tbody>
        </Table>
      </Card>
    </div>
  )
}
