'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { Check, Clock, AlertCircle, X, Info, User, Home, CreditCard } from 'lucide-react'

export function OwnerPaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)

  return (
    <>
      <Card className="p-0 overflow-hidden">
         <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Tenant / Room</Th>
              <Th>Amount</Th>
              <Th>Method / Tx ID</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!initialPayments || initialPayments.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <CreditCard className="h-10 w-10 text-gray-300 mb-2" />
                    <p>No payments recorded yet.</p>
                  </div>
                </Td>
              </Tr>
            ) : (
              initialPayments.map((payment) => (
                <Tr key={payment.id}>
                  <Td>{payment.payment_date}</Td>
                  <Td>
                     {/* @ts-ignore */}
                     <span className="font-semibold block text-gray-900">{payment.leases?.tenants?.full_name || 'Unassigned'}</span>
                     {/* @ts-ignore */}
                     {payment.leases && <span className="text-xs text-gray-500">Room {payment.leases?.rooms?.room_number}</span>}
                  </Td>
                  <Td className="font-medium text-emerald-600">Birr {payment.amount}</Td>
                  <Td>
                     <span className="capitalize block">{payment.payment_method}</span>
                     <span className="text-xs text-gray-500 font-mono">{payment.transaction_id || '-'}</span>
                  </Td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
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
                  const tenant = Array.isArray(lease?.tenants) ? lease?.tenants[0] : lease?.tenants;

                  return (
                    <>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                         <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Home className="h-3 w-3" /> Room</p>
                         <p className="text-sm font-semibold">Room {room?.room_number || 'N/A'}</p>
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
    </>
  )
}
