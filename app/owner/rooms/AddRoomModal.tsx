'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, CheckCircle, X } from 'lucide-react'
import { createRoomAction, createBulkRoomsJSONAction } from './actions'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

type BulkRoomItem = {
  id: string
  room_number: string
  floor_number: string
  room_type: string
  rent_amount: string
}

type BuildingInfo = {
  id: string
  name: string
}

export function AddRoomModal({ building }: { building: BuildingInfo }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [viewMode, setViewMode] = useState<'single' | 'bulk_setup' | 'bulk_edit'>('single')
  const [numRooms, setNumRooms] = useState<number>(10)
  const [bulkRooms, setBulkRooms] = useState<BulkRoomItem[]>([])
  const [createdCount, setCreatedCount] = useState<number>(0)
  const { t } = useLanguage()
  const router = useRouter()

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setError(null)
      setLoading(false)
      setSuccess(false)
      setViewMode('single')
      setNumRooms(10)
      setBulkRooms([])
      setCreatedCount(0)
    }, 200)
  }

  const generateTable = () => {
    const newRooms: BulkRoomItem[] = []
    for (let i = 0; i < numRooms; i++) {
        newRooms.push({
            id: Math.random().toString(36).substr(2, 9),
            room_number: '',
            floor_number: '',
            room_type: 'single',
            rent_amount: ''
        })
    }
    setBulkRooms(newRooms)
    setViewMode('bulk_edit')
  }

  const handleBulkChange = (id: string, field: keyof BulkRoomItem, value: string) => {
    setBulkRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('building_id', building.id)
    
    let result;
    if (viewMode === 'bulk_edit') {
        const isValid = bulkRooms.every(r => r.room_number.trim() && r.rent_amount && !isNaN(parseFloat(r.rent_amount)))
        if (!isValid) {
            setError(t('common.error') || 'Please ensure all room numbers and valid rent amounts are filled.')
            setLoading(false)
            return
        }
        formData.append('bulk_data', JSON.stringify(bulkRooms))
        result = await createBulkRoomsJSONAction(null, formData)
    } else {
        result = await createRoomAction(null, formData)
    }
    
    if (result.success) {
      if (viewMode === 'bulk_edit') {
        setCreatedCount(bulkRooms.length)
      } else {
        setCreatedCount(1)
      }
      setSuccess(true)
      setLoading(false)
      router.refresh()
    } else {
      setError(result.error || t('common.error'))
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="md" variant="primary" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('rooms.add')}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto text-left">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative my-8">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900">
                 {success ? t('rooms.add_success') : t('rooms.add_title')}
               </h2>
               <button onClick={handleClose} type="button" className="text-gray-400 hover:text-gray-500">
                 <X className="h-6 w-6" />
               </button>
            </div>
             
            {success ? (
               <div className="space-y-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                       <CheckCircle className="h-8 w-8" />
                    </div>
                    <p className="text-gray-600">
                       {createdCount > 1 ? `${createdCount} rooms added in ` : t('rooms.added_in')} <strong>{building.name}</strong>.
                    </p>
                  </div>
                  <div className="pt-4 border-t flex justify-end">
                      <Button variant="primary" onClick={handleClose}>{t('rooms.done')}</Button>
                  </div>
               </div>
            ) : (
             <form onSubmit={onSubmit} className="space-y-4">
                <div className="flex border-b mb-4">
                  <button 
                    type="button"
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${viewMode === 'single' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => { setViewMode('single'); setError(null); }}
                  >
                    {t('rooms.single_room')}
                  </button>
                  <button 
                    type="button"
                    className={`pb-2 px-4 text-sm font-medium transition-colors ${viewMode !== 'single' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => { setViewMode('bulk_setup'); setError(null); }}
                  >
                    {t('rooms.bulk_add')}
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-100">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1">{t('rooms.building')}</label>
                        <div className="w-full h-10 rounded-md border border-gray-100 bg-gray-50 px-3 flex items-center text-gray-700 font-medium">
                          {building.name}
                        </div>
                    </div>

                    {viewMode === 'single' && (
                      <>
                        <div className="col-span-2 md:col-span-1">
                            <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-1">{t('rooms.number')}</label>
                            <input id="room_number" name="room_number" type="text" required placeholder="e.g. 101A" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        
                        <div className="col-span-2 md:col-span-1">
                            <label htmlFor="floor_number" className="block text-sm font-medium text-gray-700 mb-1">{t('rooms.floor')}</label>
                            <input id="floor_number" name="floor_number" type="number" placeholder="1" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 mb-1">{t('rooms.type')}</label>
                            <select id="room_type" name="room_type" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white">
                              <option value="office">{t('rooms.type_office')}</option>
                              <option value="shop">{t('rooms.type_shop')}</option>
                              <option value="single">{t('rooms.type_single')}</option>
                              <option value="double">{t('rooms.type_double')}</option>
                              <option value="studio">{t('rooms.type_studio')}</option>
                              <option value="apartment">{t('rooms.type_apartment')}</option>
                            </select>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label htmlFor="rent_amount" className="block text-sm font-medium text-gray-700 mb-1">{t('rooms.rent_birr')}</label>
                            <input id="rent_amount" name="rent_amount" type="number" step="0.01" required placeholder="500.00" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">{t('rooms.description')}</label>
                            <textarea id="description" name="description" rows={3} placeholder={t('rooms.desc_placeholder')} className="w-full rounded-md border border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                      </>
                    )}

                    {viewMode === 'bulk_setup' && (
                        <div className="col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('rooms.how_many')}</label>
                                <input type="number" min="1" max="50" value={numRooms} onChange={(e) => setNumRooms(parseInt(e.target.value) || 1)} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <Button type="button" variant="outline" className="w-full" onClick={generateTable}>{t('rooms.generate_table')}</Button>
                        </div>
                    )}

                    {viewMode === 'bulk_edit' && (
                        <div className="col-span-2 overflow-x-auto">
                            <table className="w-full min-w-[500px] text-sm text-left">
                                <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-100">
                                    <tr>
                                        <th className="px-3 py-2">{t('rooms.number')}</th>
                                        <th className="px-3 py-2 w-20">{t('rooms.floor')}</th>
                                        <th className="px-3 py-2">{t('rooms.type')}</th>
                                        <th className="px-3 py-2 w-32">{t('rooms.rent_birr')}</th>
                                        <th className="px-3 py-2 text-center">{t('rooms.remove')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bulkRooms.map((room) => (
                                        <tr key={room.id} className="border-b border-gray-50">
                                            <td className="p-2">
                                                <input type="text" required placeholder="e.g. 101" value={room.room_number} onChange={(e) => handleBulkChange(room.id, 'room_number', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                            </td>
                                            <td className="p-2">
                                                <input type="number" placeholder="1" value={room.floor_number} onChange={(e) => handleBulkChange(room.id, 'floor_number', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                            </td>
                                            <td className="p-2">
                                                <select value={room.room_type} onChange={(e) => handleBulkChange(room.id, 'room_type', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
                                                    <option value="office">{t('rooms.type_office')}</option>
                                                    <option value="shop">{t('rooms.type_shop')}</option>
                                                    <option value="single">{t('rooms.type_single')}</option>
                                                    <option value="double">{t('rooms.type_double')}</option>
                                                    <option value="studio">{t('rooms.type_studio')}</option>
                                                    <option value="apartment">{t('rooms.type_apartment')}</option>
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                <input type="number" step="0.01" required placeholder="500" value={room.rent_amount} onChange={(e) => handleBulkChange(room.id, 'rent_amount', e.target.value)} className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500" />
                                            </td>
                                            <td className="p-2 text-center">
                                                <button type="button" onClick={() => setBulkRooms(prev => prev.filter(r => r.id !== room.id))} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center justify-center w-full bg-red-50 hover:bg-red-100 rounded px-2 py-1 transition-colors">
                                                    <X className="h-3 w-3 mr-1" />
                                                    {t('rooms.remove')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bulkRooms.length === 0 && (
                                <div className="p-4 text-center text-gray-500 text-sm">No rooms to add.</div>
                            )}
                            <div className="mt-2 text-right">
                                <Button type="button" variant="outline" size="sm" onClick={() => {
                                    setBulkRooms([...bulkRooms, { id: Math.random().toString(36).substr(2, 9), room_number: '', floor_number: '', room_type: 'single', rent_amount: '' }])
                                }}>{t('rooms.add_row')}</Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end space-x-2 border-t border-gray-100 mt-6">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>{t('rooms.cancel')}</Button>
                    {viewMode !== 'bulk_setup' && (
                        <Button type="submit" variant="primary" disabled={loading || (viewMode === 'bulk_edit' && bulkRooms.length === 0)}>
                          {loading ? t('rooms.processing') : t('rooms.save')}
                        </Button>
                    )}
                </div>
             </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
