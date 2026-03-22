'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw, Play, Square } from 'lucide-react'
import { AddOwnerModal } from './AddOwnerModal'
import { updateOwnerStatusAction } from './actions'

export function OwnersClient({ initialOwners }: { initialOwners: any[] }) {
  const [owners, setOwners] = useState(initialOwners)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setOwners(initialOwners)
  }, [initialOwners])

  const toggleStatus = async (id: string, currentStatus: 'active' | 'inactive') => {
    if (!confirm(`Are you sure you want to ${currentStatus === 'active' ? 'deactivate' : 'activate'} this owner and all their buildings?`)) return
    
    setLoading(true)
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    const result = await updateOwnerStatusAction(id, newStatus)
    
    if (!result.success) {
      alert(result.error || 'Failed to update status')
    }
    // Note: revalidatePath will trigger a server-side refresh of initialOwners
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <AddOwnerModal />
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Phone</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {owners.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="text-center py-8 text-gray-500">No owners found. Add one to get started.</Td>
              </Tr>
            ) : (
              owners.map((owner) => (
                <Tr key={owner.id}>
                  <Td className="font-medium text-gray-900">{owner.full_name}</Td>
                  <Td>{owner.email}</Td>
                  <Td>{owner.phone || '-'}</Td>
                  <Td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      owner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {owner.status}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleStatus(owner.id, owner.status)}
                      disabled={loading}
                    >
                      {owner.status === 'active' ? <Square className="mr-1.5 h-3.5 w-3.5" /> : <Play className="mr-1.5 h-3.5 w-3.5" />}
                      {owner.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
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
