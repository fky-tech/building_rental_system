'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, CheckCircle, X } from 'lucide-react'
import { createTenantAction } from './actions'
import { useRouter } from 'next/navigation'

type RoomOption = {
  id: string
  room_number: string
  building_name: string
  rent: number
}

export function AddTenantModal({ rooms }: { rooms: RoomOption[] }) {
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
    const result = await createTenantAction(null, formData)
    
    if (result.success) {
      setSuccess(true)
      setLoading(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to add tenant and lease')
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="md" variant="primary" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative my-8 text-left">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900">
                 {success ? 'Tenant Registered Successfully' : 'Register New Tenant & Lease'}
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
                       Tenant record created and lease agreement activated.
                    </p>
                  </div>
                  <div className="pt-4 border-t flex justify-end">
                      <Button variant="primary" onClick={handleClose}>Done</Button>
                  </div>
               </div>
            ) : (
             <form onSubmit={onSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-100">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tenant Information Section */}
                    <div className="col-span-2">
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">1. Tenant Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input id="full_name" name="full_name" type="text" required placeholder="John Doe" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input id="phone" name="phone" type="text" placeholder="+251 ..." className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-1">ID / Passport Number</label>
                                <input id="id_number" name="id_number" type="text" placeholder="ID-12345" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Lease Information Section */}
                    <div className="col-span-2 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">2. Lease Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="room_id" className="block text-sm font-medium text-gray-700 mb-1">Select Room</label>
                                <select 
                                  id="room_id" 
                                  name="room_id" 
                                  required 
                                  className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  onChange={(e) => {
                                      const room = rooms.find(r => r.id === e.target.value);
                                      if (room) {
                                          const rentInput = document.getElementById('monthly_rent') as HTMLInputElement;
                                          if (rentInput) rentInput.value = room.rent.toString();
                                      }
                                  }}
                                >
                                  <option value="">Choose an available room...</option>
                                  {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.building_name} - Room {r.room_number}</option>
                                  ))}
                                </select>
                                {rooms.length === 0 && <p className="text-xs text-red-500 mt-1">No rooms available. Please add rooms first.</p>}
                            </div>

                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Lease Start Date</label>
                                <input id="start_date" name="start_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            
                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                                <input id="end_date" name="end_date" type="date" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div>
                                <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (Birr)</label>
                                <input id="monthly_rent" name="monthly_rent" type="number" step="0.01" required placeholder="0.00" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div>
                                <label htmlFor="payment_due_day" className="block text-sm font-medium text-gray-700 mb-1">Rent Due Day (1-31)</label>
                                <input id="payment_due_day" name="payment_due_day" type="number" min="1" max="31" required defaultValue="5" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-2 border-t border-gray-100 mt-6">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={loading || rooms.length === 0}>
                      {loading ? 'Processing...' : 'Register Tenant & Lease'}
                    </Button>
                </div>
             </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
