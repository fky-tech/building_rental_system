'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { updateOwnerAction } from './actions'
import { Edit2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function EditOwnerModal({ owner }: { owner: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateOwnerAction(owner.id, formData)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update owner')
    }
    setLoading(false)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} title="Edit Owner">
        <Edit2 className="h-4 w-4 text-blue-600" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto text-left">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
               <h2 className="text-xl font-bold text-gray-900 border-none">Edit Owner</h2>
               <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-500 p-1">
                 <X className="h-6 w-6" />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-100 italic">
                  {error}
                </div>
              )}
              
              <Input 
                label="Full Name" 
                name="full_name" 
                defaultValue={owner.full_name} 
                required 
              />
              
              <Input 
                label="Phone Number" 
                name="phone" 
                defaultValue={owner.phone} 
                placeholder="+251 ..." 
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email (View Only)</label>
                <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 flex items-center text-gray-500 text-sm">
                   {owner.email}
                </div>
              </div>

              <p className="text-[10px] text-gray-400 italic bg-gray-50 p-2 rounded">
                Note: Email changes for owners are restricted in this panel.
              </p>

              <div className="pt-6 flex justify-end space-x-3 border-t mt-6">
                <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
