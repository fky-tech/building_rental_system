'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, CheckCircle } from 'lucide-react'
import { createBuildingAction } from './actions'
import { useRouter } from 'next/navigation'

type OwnerOption = {
  id: string
  name: string
}

export function AddBuildingModal({ owners }: { owners: OwnerOption[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleClose = () => {
    setOpen(false)
    // Clear state after close
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
    
    // Call server action
    const result = await createBuildingAction(null, formData)
    
    if (result.success) {
      setSuccess(true)
      setLoading(false)
      // Refresh the page data from server
      router.refresh()
    } else {
      setError(result.error || 'Failed to create building')
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="md" variant="primary" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Building
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative my-8">
            
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900">
                 {success ? 'Building Added Successfully' : 'Create New Building'}
               </h2>
               <button onClick={handleClose} type="button" className="text-gray-400 hover:text-gray-500 text-2xl leading-none">&times;</button>
            </div>
             
            {success ? (
               <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                       <CheckCircle className="h-8 w-8" />
                    </div>
                    <p className="text-center text-gray-600">
                       The building has been successfully created and added to the management list.
                    </p>
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
                    <div className="col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                        <input 
                          id="name"
                          name="name"
                          type="text" 
                          required
                          placeholder="e.g. Skyline Tower"
                          className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    
                    <div className="col-span-2">
                        <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700 mb-1">Assign Owner</label>
                        <select 
                          id="owner_id"
                          name="owner_id"
                          required
                          className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="">Select an owner...</option>
                          {owners.map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Subdomain / Slug</label>
                        <input 
                          id="slug"
                          name="slug"
                          type="text" 
                          required
                          placeholder="skyline"
                          className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Used for building URLs.</p>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input 
                          id="city"
                          name="city"
                          type="text" 
                          placeholder="Addis Ababa"
                          className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="sub_city" className="block text-sm font-medium text-gray-700 mb-1">Sub City</label>
                        <input 
                          id="sub_city"
                          name="sub_city"
                          type="text" 
                          placeholder="Bole"
                          className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
                        <input 
                          id="address"
                          name="address"
                          type="text" 
                          placeholder="Around Edna Mall..."
                          className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-2 border-t border-gray-100 mt-6">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Building'}
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
