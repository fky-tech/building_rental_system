'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Edit2, CheckCircle, X, Trash2 } from 'lucide-react'
import { updateRoomAction, deleteRoomAction } from './actions'
import { useRouter } from 'next/navigation'

export function EditRoomModal({ room }: { room: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setError(null)
      setLoading(false)
      setSuccess(false)
    }, 200)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append('id', room.id)
    
    const result = await updateRoomAction(null, formData)
    
    if (result.success) {
      setSuccess(true)
      setLoading(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update room')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this room? This cannot be undone.')) return
    
    setLoading(true)
    const result = await deleteRoomAction(room.id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to delete room')
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900" onClick={() => setOpen(true)}>
          <Edit2 className="w-4 h-4"/>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative my-8 text-left text-normal">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900">
                 {success ? 'Room Updated Successfully' : 'Edit Room'}
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
                    <p className="text-gray-600">Room details updated successfully.</p>
                  </div>
                  <div className="pt-4 border-t flex justify-end">
                      <Button variant="primary" onClick={handleClose}>Done</Button>
                  </div>
               </div>
            ) : (
             <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-100">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                        <input id="room_number" name="room_number" type="text" required defaultValue={room.room_number} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="floor_number" className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                        <input id="floor_number" name="floor_number" type="number" defaultValue={room.floor_number} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                        <select id="room_type" name="room_type" defaultValue={room.room_type} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="office">Office</option>
                          <option value="shop">Shop</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="rent_amount" className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (Birr)</label>
                        <input id="rent_amount" name="rent_amount" type="number" step="0.01" required defaultValue={room.rent_amount} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                    <div className="col-span-2">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="status" name="status" defaultValue={room.status} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="description" name="description" rows={3} defaultValue={room.description} className="w-full rounded-md border border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-6">
                    <Button type="button" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={handleDelete} disabled={loading}>
                        <Trash2 className="w-4 h-4 mr-1"/> Delete
                    </Button>
                    <div className="flex space-x-2">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
             </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
