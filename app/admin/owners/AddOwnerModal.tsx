'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, CheckCircle, Copy } from 'lucide-react'
import { createOwnerAction } from './actions'

export function AddOwnerModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{email: string, password: string} | null>(null)

  const handleClose = () => {
    setOpen(false)
    // Reset state after close animation/delay
    setTimeout(() => {
      setSuccessData(null)
      setError(null)
      setLoading(false)
    }, 200)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Call server action
    const result = await createOwnerAction(null, formData)
    
    if (result.success && result.email && result.password) {
      setSuccessData({ email: result.email, password: result.password })
    } else {
      setError(result.error || 'Failed to create owner')
    }
    setLoading(false)
  }

  return (
    <>
      <Button size="md" variant="primary" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Owner
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900">
                 {successData ? 'Owner Created Successfully' : 'Create New Owner'}
               </h2>
               <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 text-2xl leading-none">&times;</button>
            </div>
             
            {successData ? (
               <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      The owner account has been created. Please securely share these credentials with the owner. They will be prompted to change the password upon first login.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                      <div className="mt-1 flex items-center justify-between bg-white px-3 py-2 border rounded-md">
                        <span className="text-gray-900 text-sm font-medium">{successData.email}</span>
                        <button onClick={() => copyToClipboard(successData.email)} className="text-gray-400 hover:text-gray-600">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Temporary Password</label>
                      <div className="mt-1 flex items-center justify-between bg-white px-3 py-2 border rounded-md">
                        <span className="text-gray-900 text-sm font-medium font-mono">{successData.password}</span>
                        <button onClick={() => copyToClipboard(successData.password)} className="text-gray-400 hover:text-blue-600" title="Copy password">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
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
                  
                  <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        id="full_name"
                        name="full_name"
                        type="text" 
                        required
                        placeholder="John Doe"
                        className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" 
                      />
                  </div>
                  <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        id="email"
                        name="email"
                        type="email" 
                        required
                        placeholder="john@example.com"
                        className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" 
                      />
                  </div>
                  <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        id="phone"
                        name="phone"
                        type="tel" 
                        placeholder="+251 911 234 567"
                        className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" 
                      />
                  </div>

                  <div className="pt-4 flex justify-end space-x-2 border-t border-gray-100">
                      <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                      <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Owner'}
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
