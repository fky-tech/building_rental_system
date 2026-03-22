'use client'

import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Home, CheckCircle, AlertCircle, TrendingDown, Clock, X, MessageSquare, Phone, User, Calendar, HelpCircle } from 'lucide-react'

type UnpaidLease = {
  id: string
  due_day: number
  monthly_rent: number
  tenant_name: string
  phone: string
  room_number: string
}

type Stat = {
  name: string
  value: number
  color: string
  bg: string
  type: string
}

type RecentPayment = {
  id: string
  amount: number
  date: string
  status: string
  tenant_name: string
  room_number: string
}

export function DashboardClient({ stats, unpaidLeases, recentPayments }: { 
    stats: Stat[], 
    unpaidLeases: UnpaidLease[],
    recentPayments: RecentPayment[]
  }) {
  const [showUnpaidModal, setShowUnpaidModal] = useState(false)
  const [sendingSms, setSendingSms] = useState<string | null>(null)

  const iconMap: Record<string, any> = {
    total: Home,
    occupied: CheckCircle,
    available: AlertCircle,
    unpaid: TrendingDown
  }

  const handleSendSms = (leaseId: string) => {
    setSendingSms(leaseId)
    // Mock SMS sending
    setTimeout(() => {
      setSendingSms(null)
      alert('Reminder SMS sent successfully!')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Owner Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = iconMap[stat.type] || HelpCircle
          const isUnpaid = stat.type === 'unpaid'
          
          return (
            <Card 
              key={stat.name} 
              className={`flex flex-col p-6 shadow-sm transition-all duration-200 ${
                isUnpaid ? 'cursor-pointer hover:shadow-md hover:ring-2 hover:ring-red-500/20 active:scale-[0.98]' : ''
              }`}
              onClick={() => isUnpaid && setShowUnpaidModal(true)}
            >
              <div className="flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                   <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              {isUnpaid && stat.value > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-red-600 font-medium">
                   <span>Click to view tenants</span>
                   <span className="ml-1">→</span>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
         <Card className="flex flex-col overflow-hidden">
            <CardHeader title="Recent Payments" />
            <div className="flex-1 overflow-x-auto">
              {recentPayments.length === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-gray-400">
                  <Clock className="h-8 w-8 mb-2" />
                  <p>No recent payments found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant / Room</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payment.tenant_name}</div>
                          <div className="text-xs text-gray-500">Room {payment.room_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                          ${payment.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           {payment.status === 'verified' ? (
                             <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                               <CheckCircle className="w-3 h-3 mr-1" /> Verified
                             </span>
                           ) : (
                             <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                               <Clock className="w-3 h-3 mr-1" /> {payment.status}
                             </span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
         </Card>
      </div>

      {/* Unpaid Rents Modal */}
      {showUnpaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <AlertCircle className="h-5 w-5" />
                <span>Unpaid Rents Detail</span>
              </div>
              <button 
                onClick={() => setShowUnpaidModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {unpaidLeases.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-medium">
                   All rents are paid for this month!
                </div>
              ) : (
                <div className="space-y-4">
                  {unpaidLeases.map((lease) => (
                    <div key={lease.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 hover:border-red-200 transition-colors group">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className="text-gray-900 font-bold">{lease.tenant_name}</span>
                                <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-tighter shadow-sm">
                                  Room {lease.room_number}
                                </span>
                             </div>
                             <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                   <Phone className="h-3 w-3" />
                                   <span>{lease.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                   <Calendar className="h-3 w-3" />
                                   <span>Due: Day {lease.due_day}</span>
                                </div>
                                <div className="font-bold text-red-600">
                                   Amount: ${lease.monthly_rent}
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-2">
                             <Button 
                               variant="outline" 
                               size="sm" 
                               className="border-gray-200 text-gray-700 hover:bg-white shadow-sm"
                               onClick={() => window.location.href = `tel:${lease.phone}`}
                             >
                                <Phone className="h-3.5 w-3.5 mr-1.5" />
                                Call
                             </Button>
                             <Button 
                               variant="primary" 
                               size="sm" 
                               className="bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 border-none"
                               disabled={sendingSms === lease.id}
                               onClick={() => handleSendSms(lease.id)}
                             >
                                {sendingSms === lease.id ? (
                                   <>Sending...</>
                                ) : (
                                   <>
                                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                      Send Reminder
                                   </>
                                )}
                             </Button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 border-t flex justify-end">
               <Button onClick={() => setShowUnpaidModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
