'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Edit, CheckCircle, X } from 'lucide-react'
import { updateBuildingAction } from './actions'
import { useRouter } from 'next/navigation'

type OwnerOption = {
  id: string
  name: string
}

export function EditBuildingModal({ building, owners }: { building: any, owners: OwnerOption[] }) {
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
    formData.append('id', building.id)
    
    const result = await updateBuildingAction(null, formData)
    
    if (result.success) {
      setSuccess(true)
      setLoading(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update building')
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Edit / Assign</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative my-8 text-left">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900">
                 {success ? 'Building Updated Successfully' : 'Edit Building'}
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
                    <p className="text-gray-600">Building and owner status updated successfully.</p>
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
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                        <input id="name" name="name" type="text" required defaultValue={building.name} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                    <div>
                        <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700 mb-1">Assign Owner</label>
                        <select id="owner_id" name="owner_id" required defaultValue={building.owner_id} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="">Select an owner...</option>
                          {owners.map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Building Status</label>
                        <select id="status" name="status" defaultValue={building.status} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1 italic">
                            * Deactivating a building will also deactivate its assigned owner.
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-2 border-t border-gray-100 mt-6">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
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
