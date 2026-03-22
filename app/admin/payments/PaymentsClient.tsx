'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { Check, Clock, AlertCircle } from 'lucide-react'

export function PaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const [filter, setFilter] = useState<'all' | 'verified' | 'unassigned'>('all')

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
                  <Td>{payment.payment_date}</Td>
                  <Td className="font-mono text-sm">{payment.transaction_id || '-'}</Td>
                  <Td className="capitalize">{payment.payment_method}</Td>
                  <Td className="font-medium text-gray-900">${payment.amount}</Td>
                  <Td>
                    {payment.status === 'verified' && <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-1 text-xs rounded-full"><Check className="w-3 h-3 mr-1"/> Verified</span>}
                    {payment.status === 'pending' && <span className="inline-flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 text-xs rounded-full"><Clock className="w-3 h-3 mr-1"/> Pending</span>}
                    {payment.status === 'unassigned' && <span className="inline-flex items-center text-red-700 bg-red-100 px-2 py-1 text-xs rounded-full"><AlertCircle className="w-3 h-3 mr-1"/> Unassigned</span>}
                  </Td>
                  <Td className="text-right">
                     <Button variant="outline" size="sm">Details</Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </div>
  )
}
