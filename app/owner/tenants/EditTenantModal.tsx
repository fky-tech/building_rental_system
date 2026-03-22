'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { UserCog, CheckCircle, X } from 'lucide-react'
import { updateTenantAction } from './actions'
import { useRouter } from 'next/navigation'

export function EditTenantModal({ tenant }: { tenant: any }) {
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
    formData.append('id', tenant.id)
    
    const result = await updateTenantAction(null, formData)
    
    if (result.success) {
      setSuccess(true)
      setLoading(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update tenant')
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900" onClick={() => setOpen(true)}>
          <UserCog className="w-4 h-4 mr-2" /> Manage
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative my-8 text-left">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900">
                 {success ? 'Tenant Updated Successfully' : 'Manage Tenant Details'}
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
                    <p className="text-gray-600">Tenant information has been updated.</p>
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
                
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 italic">
                    Note: Lease details cannot be changed here. To modify a lease, please manage it from the specific room or contact support.
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input id="full_name" name="full_name" type="text" required defaultValue={tenant.full_name} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input id="phone" name="phone" type="text" defaultValue={tenant.phone || ''} placeholder="+251 ..." className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div>
                        <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-1">ID / Passport Number</label>
                        <input id="id_number" name="id_number" type="text" defaultValue={tenant.id_number || ''} placeholder="ID-12345" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea id="notes" name="notes" rows={3} defaultValue={tenant.notes || ''} placeholder="Internal notes about the tenant..." className="w-full rounded-md border border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
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
