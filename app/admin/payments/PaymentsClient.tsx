'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { Check, Clock, AlertCircle, X, Info, Building as BuildingIcon, User, Home } from 'lucide-react'
import { gregStrToEthiopian } from '@/lib/ethiopian-calendar'

export function PaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const [filter, setFilter] = useState<'all' | 'verified' | 'unassigned'>('all')
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)

  const filtered = initialPayments.filter((p) => {
    if (filter === 'all') return true
    return p.status === filter
  })

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>All Payments</Button>
        <Button variant={filter === 'verified' ? 'primary' : 'outline'} onClick={() => setFilter('verified')}>Verified</Button>
        <Button variant={filter === 'unassigned' ? 'primary' : 'outline'} onClick={() => setFilter('unassigned')}>Unassigned</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Transaction ID</Th>
              <Th>Method</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-8 text-gray-500">No {filter !== 'all' && filter} payments found.</Td>
              </Tr>
            ) : (
              filtered.map((payment) => (
                <Tr key={payment.id}>
                  <Td>{gregStrToEthiopian(payment.payment_date)}</Td>
                  <Td className="font-mono text-sm">{payment.transaction_id || '-'}</Td>
                  <Td className="capitalize">{payment.payment_method}</Td>
                  <Td className="font-medium text-gray-900">Birr {payment.amount}</Td>
                  <Td>
                    {payment.status === 'verified' && <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-1 text-xs rounded-full"><Check className="w-3 h-3 mr-1"/> Verified</span>}
                    {payment.status === 'pending' && <span className="inline-flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 text-xs rounded-full"><Clock className="w-3 h-3 mr-1"/> Pending</span>}
                    {payment.status === 'unassigned' && <span className="inline-flex items-center text-red-700 bg-red-100 px-2 py-1 text-xs rounded-full"><AlertCircle className="w-3 h-3 mr-1"/> Unassigned</span>}
                  </Td>
                  <Td className="text-right">
                     <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>Details</Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
             <div className="flex justify-between items-center mb-6 border-b pb-3">
               <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                 <Info className="h-5 w-5 text-blue-600" />
                 Payment Details
               </h2>
               <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-500">
                 <X className="h-6 w-6" />
               </button>
             </div>

              <div className="space-y-4">
                {(() => {
                  const lease = Array.isArray(selectedPayment.leases) ? selectedPayment.leases[0] : selectedPayment.leases;
                  const room = Array.isArray(lease?.rooms) ? lease?.rooms[0] : lease?.rooms;
                  const building = Array.isArray(room?.buildings) ? room?.buildings[0] : room?.buildings;
                  const tenant = Array.isArray(lease?.tenants) ? lease?.tenants[0] : lease?.tenants;

                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                           <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><BuildingIcon className="h-3 w-3" /> Building</p>
                           <p className="text-sm font-semibold">{building?.name || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                           <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Home className="h-3 w-3" /> Room</p>
                           <p className="text-sm font-semibold">{room?.room_number || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                        <p className="text-xs text-blue-600 mb-1 flex items-center gap-1 font-medium"><User className="h-3 w-3" /> Tenant Name</p>
                        <p className="text-base font-bold text-blue-900 border-l-2 border-blue-300 pl-3 ml-1 mt-1">
                           {tenant?.full_name || 'Unassigned Tenant'}
                        </p>
                      </div>
                    </>
                  );
                })()}

                <div className="space-y-3 pt-2">
                   <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-mono font-medium">{selectedPayment.transaction_id || 'Cash/Manual'}</span>
                   </div>
                   <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">Amount Paid</span>
                      <span className="font-bold text-gray-900">Birr {selectedPayment.amount}</span>
                   </div>
                   <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">Status</span>
                      <span className={`capitalize font-medium ${selectedPayment.status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedPayment.status}</span>
                   </div>
                   <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-500">Payment Date</span>
                      <span className="font-medium">{selectedPayment.payment_date}</span>
                   </div>
                </div>
             </div>

             <div className="mt-8 flex justify-end">
                <Button variant="primary" onClick={() => setSelectedPayment(null)} className="w-full">Close</Button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
