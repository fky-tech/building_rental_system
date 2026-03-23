'use client'

import { Card } from '@/components/ui/Card'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { Users } from 'lucide-react'
import { gregStrToEthiopian } from '@/lib/ethiopian-calendar'
import { useLanguage } from '@/lib/LanguageContext'
import { AddTenantModal } from './AddTenantModal'
import { EditTenantModal } from './EditTenantModal'

interface TenantsClientProps {
  tenants: any[]
  roomsList: any[]
}

export function TenantsClient({ tenants, roomsList }: TenantsClientProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('tenants.title')}</h1>
        <AddTenantModal rooms={roomsList} />
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>{t('tenants.name')}</Th>
              <Th>{t('tenants.phone')}</Th>
              <Th>{t('tenants.id')}</Th>
              <Th>{t('tenants.joined')}</Th>
              <Th className="text-right">{t('tenants.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tenants.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="h-10 w-10 text-gray-300 mb-2" />
                    <p>{t('tenants.no_tenants')}</p>
                  </div>
                </Td>
              </Tr>
            ) : (
              tenants.map((tenant) => (
                <Tr key={tenant.id}>
                  <Td className="font-medium text-gray-900">{tenant.full_name}</Td>
                  <Td>{tenant.phone || '-'}</Td>
                  <Td className="font-mono text-sm">{tenant.id_number || 'N/A'}</Td>
                  <Td className="text-sm text-gray-500">{gregStrToEthiopian(tenant.created_at)}</Td>
                  <Td className="text-right">
                    <EditTenantModal tenant={tenant} />
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
