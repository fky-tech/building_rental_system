'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { Check, Clock, AlertCircle, X, Info, User, Home, CreditCard, ChevronDown, ChevronRight } from 'lucide-react'
import { gregStrToEthiopian } from '@/lib/ethiopian-calendar'
import { useLanguage } from '@/lib/LanguageContext'

// Helper to map month number to name
const getMonthName = (monthNum: number, locale: 'en' | 'am') => {
  const amMonths = ['መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዚያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሃሴ', 'ጳጉሜ']
  const enMonths = ['Meskerem', 'Tikemet', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume']
  if (monthNum < 1 || monthNum > 13) return monthNum.toString()
  return locale === 'am' ? amMonths[monthNum - 1] : enMonths[monthNum - 1]
}

export function OwnerPaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const { t, language } = useLanguage()

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  // Group multi-month payments together
  const groupedPayments: any[] = []
  const groupMap = new Map<string, any>()

  initialPayments.forEach(p => {
    // Generate grouping key based on the batch creation traits
    const groupId = p.transaction_id 
      ? p.transaction_id.replace(/-\d+$/, '') 
      : `${p.lease_id}-${p.payment_date}-${p.amount}-${p.payment_method}`
      
    if (!groupMap.has(groupId)) {
      const newGroup = { 
        ...p, 
        groupId,
        isGroup: false, 
        subPayments: [p], 
        totalAmount: p.amount, 
        monthsList: [p.month] 
      }
      groupMap.set(groupId, newGroup)
      groupedPayments.push(newGroup)
    } else {
      const group = groupMap.get(groupId)
      group.isGroup = true
      group.subPayments.push(p)
      group.totalAmount += p.amount
      group.monthsList.push(p.month)
      // Sort subPayments by month to keep them in order
      group.subPayments.sort((a: any, b: any) => a.month - b.month)
      group.monthsList.sort((a: number, b: number) => a - b)
      
      // If any sub-payment is verified, we can consider the group verified or partially verified. 
      // We'll keep the group status as the lowest denominator (unassigned -> pending -> verified)
      if (group.status === 'verified' && p.status !== 'verified') {
        group.status = p.status
      } else if (group.status === 'unassigned') {
        // stay unassigned
      }
    }
  })

  // The user requested to remove the payments from the table once verified if it's a multi-month payment
  // "and once the payment status verified remove it from the payments table"
  // If we should hide verified multi-month payments entirely:
  const displayPayments = groupedPayments.filter(g => {
    if (g.isGroup && g.status === 'verified') {
      return false // Remove verified multi-month payments from the table
    }
    return true
  })

  return (
    <>
      <Card className="p-0 overflow-hidden text-left">
         <Table>
          <Thead>
            <Tr>
              <Th className="w-10"></Th>
              <Th>{t('payments.date')}</Th>
              <Th>{t('payments.tenant_room')}</Th>
              <Th>{t('payments.amount')}</Th>
              <Th>{t('payments.method_txid')}</Th>
              <Th>{t('payments.status')}</Th>
              <Th className="text-right">{t('payments.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {!displayPayments || displayPayments.length === 0 ? (
              <Tr>
                <Td colSpan={7} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <CreditCard className="h-10 w-10 text-gray-300 mb-2" />
                    <p>{t('payments.no_payments')}</p>
                  </div>
                </Td>
              </Tr>
            ) : (
              displayPayments.map((group) => (
                <React.Fragment key={group.groupId}>
                  <Tr className={group.isGroup ? "bg-gray-50/50" : ""}>
                    <Td className="w-10 text-center">
                      {group.isGroup && (
                        <button 
                          onClick={() => toggleGroup(group.groupId)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                          title={expandedGroups.has(group.groupId) ? t('payments.collapse') : t('payments.expand')}
                        >
                          {expandedGroups.has(group.groupId) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                    </Td>
                    <Td>{gregStrToEthiopian(group.payment_date)}</Td>
                    <Td>
                       {/* @ts-ignore */}
                       <span className="font-semibold block text-gray-900">{group.leases?.tenants?.full_name || t('payments.unassigned')}</span>
                       {/* @ts-ignore */}
                       {group.leases && <span className="text-xs text-gray-500">{t('rooms.title_singular')} {group.leases?.rooms?.room_number}</span>}
                    </Td>
                    <Td className="font-medium text-emerald-600 font-bold">{t('common.birr')} {group.totalAmount}</Td>
                    <Td>
                       <span className="capitalize block">
                         {group.payment_method} 
                         {group.isGroup && <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{group.subPayments.length} {t('payments.multi_month_group')}</span>}
                       </span>
                       <span className="text-xs text-gray-500 font-mono">{group.transaction_id ? group.transaction_id.replace(/-\d+$/, '') : '-'}</span>
                    </Td>
                    <Td>
                      {group.status === 'verified' && <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-1 text-xs rounded-full font-medium"><Check className="w-3 h-3 mr-1"/> {t('payments.verified')}</span>}
                      {group.status === 'pending' && <span className="inline-flex items-center text-yellow-700 bg-yellow-100 px-2 py-1 text-xs rounded-full font-medium"><Clock className="w-3 h-3 mr-1"/> {t('payments.pending')}</span>}
                      {group.status === 'unassigned' && <span className="inline-flex items-center text-red-700 bg-red-100 px-2 py-1 text-xs rounded-full font-medium"><AlertCircle className="w-3 h-3 mr-1"/> {t('payments.unassigned')}</span>}
                    </Td>
                    <Td className="text-right">
                      {!group.isGroup && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedPayment(group)}>{t('payments.details')}</Button>
                      )}
                    </Td>
                  </Tr>
                  
                  {/* Expanded Sub-Payments */}
                  {group.isGroup && expandedGroups.has(group.groupId) && group.subPayments.map((sub: any, index: number) => (
                    <Tr key={sub.id} className="bg-gray-50/30 border-l-4 border-l-blue-200">
                      <Td className="w-10"></Td>
                      <Td className="text-sm pl-6 text-gray-500">
                        {/* Show month name for sub-payment */}
                        {getMonthName(sub.month, language as 'en' | 'am')} {sub.year}
                      </Td>
                      <Td className="text-sm text-gray-500">
                        {/* Keep empty or show tenant again */}
                      </Td>
                      <Td className="text-sm font-medium text-emerald-600/80">{t('common.birr')} {sub.amount}</Td>
                      <Td className="text-sm text-gray-500 font-mono">{sub.transaction_id || '-'}</Td>
                      <Td>
                        {sub.status === 'verified' && <span className="inline-flex items-center text-green-700 bg-green-50 px-2 py-0.5 text-xs rounded-full"><Check className="w-3 h-3 mr-1"/> {t('payments.verified')}</span>}
                        {sub.status === 'pending' && <span className="inline-flex items-center text-yellow-700 bg-yellow-50 px-2 py-0.5 text-xs rounded-full"><Clock className="w-3 h-3 mr-1"/> {t('payments.pending')}</span>}
                        {sub.status === 'unassigned' && <span className="inline-flex items-center text-red-700 bg-red-50 px-2 py-0.5 text-xs rounded-full"><AlertCircle className="w-3 h-3 mr-1"/> {t('payments.unassigned')}</span>}
                      </Td>
                      <Td className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedPayment(sub)}>{t('payments.details')}</Button>
                      </Td>
                    </Tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200 text-left">
             <div className="flex justify-between items-center mb-6 border-b pb-3 text-left">
               <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                 <Info className="h-5 w-5 text-blue-600" />
                 {t('payments.payment_details')}
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
                         <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Home className="h-3 w-3" /> {t('rooms.title_singular')}</p>
                         <p className="text-sm font-semibold">{t('rooms.title_singular')} {room?.room_number || 'N/A'}</p>
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                        <p className="text-xs text-blue-600 mb-1 flex items-center gap-1 font-medium"><User className="h-3 w-3" /> {t('tenants.full_name')}</p>
                        <p className="text-base font-bold text-blue-900 border-l-2 border-blue-300 pl-3 ml-1 mt-1">
                           {tenant?.full_name || t('payments.unassigned_tenant')}
                        </p>
                      </div>
                    </>
                  );
                })()}

                <div className="space-y-3 pt-2">
                   <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">{t('payments.method_txid')}</span>
                      <span className="font-mono font-medium">{selectedPayment.transaction_id || 'Cash/Manual'}</span>
                   </div>
                   <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">{t('payments.amount_paid')}</span>
                      <span className="font-bold text-gray-900">{t('common.birr')} {selectedPayment.amount}</span>
                   </div>
                   <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">Paid For Month</span>
                      <span className="font-medium text-gray-900">
                         {selectedPayment.month ? `${getMonthName(selectedPayment.month, language as 'en' | 'am')} ${selectedPayment.year}` : '-'}
                      </span>
                   </div>
                   <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">{t('payments.status')}</span>
                      <span className={`capitalize font-medium ${selectedPayment.status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {t(`payments.${selectedPayment.status}`)}
                      </span>
                   </div>
                   <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-500">{t('payments.date')}</span>
                      <span className="font-medium">{gregStrToEthiopian(selectedPayment.payment_date)}</span>
                   </div>
                </div>
             </div>

             <div className="mt-8 flex justify-end">
                <Button variant="primary" onClick={() => setSelectedPayment(null)} className="w-full">{t('common.close')}</Button>
             </div>
          </div>
        </div>
      )}
    </>
  )
}
