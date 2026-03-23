'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, CheckCircle, X } from 'lucide-react'
import { createPaymentAction } from './actions'
import { useRouter } from 'next/navigation'

type LeaseOption = {
  id: string
  tenant_name: string
  room_number: string
  monthly_rent: number
}

export function AddPaymentModal({ leases }: { leases: LeaseOption[] }) {
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
    const result = await createPaymentAction(null, formData)
    
    if (result.success) {
      setSuccess(true)
      setLoading(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to record payment')
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="md" variant="primary" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative my-8 text-left">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900">
                 {success ? 'Payment Recorded Successfully' : 'Record Payment'}
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
                       Payment has been recorded successfully.
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
                        <label htmlFor="lease_id" className="block text-sm font-medium text-gray-700 mb-1">Select Unpaid Tenant</label>
                        <select 
                          id="lease_id" 
                          name="lease_id" 
                          required
                          className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          onChange={(e) => {
                            const lease = leases.find(l => l.id === e.target.value);
                            if (lease) {
                              const amountInput = document.getElementById('amount') as HTMLInputElement;
                              const roomDisplay = document.getElementById('room_display') as HTMLInputElement;
                              if (amountInput) amountInput.value = lease.monthly_rent.toString();
                              if (roomDisplay) roomDisplay.value = `Room ${lease.room_number}`;
                            }
                          }}
                        >
                          <option value="">Choose a tenant...</option>
                          {leases.map(l => (
                            <option key={l.id} value={l.id}>{l.tenant_name}</option>
                          ))}
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="room_display" className="block text-sm font-medium text-gray-700 mb-1">Assigned Room</label>
                        <input id="room_display" name="room_display" type="text" readOnly placeholder="Select a tenant first" className="w-full h-10 rounded-md border border-gray-100 px-3 bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Total Amount (Birr)</label>
                        <input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="months_to_pay" className="block text-sm font-medium text-gray-700 mb-1">Months Included</label>
                        <select 
                          id="months_to_pay" 
                          name="months_to_pay" 
                          className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          onChange={(e) => {
                            const months = parseInt(e.target.value);
                            const leaseId = (document.getElementById('lease_id') as HTMLSelectElement).value;
                            const lease = leases.find(l => l.id === leaseId);
                            if (lease) {
                              const amountInput = document.getElementById('amount') as HTMLInputElement;
                              if (amountInput) amountInput.value = (lease.monthly_rent * months).toString();
                            }
                          }}
                        >
                          <option value="1">1 Month (Default)</option>
                          <option value="3">3 Months</option>
                          <option value="6">6 Months</option>
                        </select>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                        <input id="payment_date" name="payment_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select id="payment_method" name="payment_method" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="bank">Bank Transfer</option>
                          <option value="telebirr">Telebirr</option>
                          <option value="cash">Cash</option>
                        </select>
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700 mb-1">Tx ID / Ref #</label>
                        <input id="transaction_id" name="transaction_id" type="text" placeholder="Optional" className="w-full h-10 rounded-md border border-gray-300 px-3 focus:ring-blue-500 focus:border-blue-500" />
                    </div>

                    <div className="col-span-2">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Note / Description</label>
                        <textarea id="note" name="note" rows={2} placeholder="Optional" className="w-full rounded-md border border-gray-300 p-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                </div>

                <div className="pt-4 flex justify-end space-x-2 border-t border-gray-100 mt-6">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? 'Recording...' : 'Save Payment'}
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
