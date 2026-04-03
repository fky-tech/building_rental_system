'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { MessageSquare, CheckCircle, XCircle, Clock, Filter, X } from 'lucide-react'
import { gregStrToEthiopian } from '@/lib/ethiopian-calendar'
import { useLanguage } from '@/lib/LanguageContext'

type Message = {
  id: string
  tenant_id: string | null
  tenant_name: string
  phone: string
  message: string
  status: 'pending' | 'sent' | 'failed'
  error: string | null
  retry_count: number
  created_at: string
}

interface Props {
  messages: Message[]
  totalSent: number
  totalFailed: number
  totalPending: number
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function toDateStr(iso: string) {
  return iso ? iso.slice(0, 10) : ''
}

/** Group messages into daily buckets for last N days */
function buildChartData(messages: Message[], days = 7) {
  const buckets: Record<string, { sent: number; failed: number }> = {}
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    buckets[toDateStr(d.toISOString())] = { sent: 0, failed: 0 }
  }

  for (const msg of messages) {
    const day = toDateStr(msg.created_at)
    if (buckets[day]) {
      if (msg.status === 'sent')   buckets[day].sent++
      if (msg.status === 'failed') buckets[day].failed++
    }
  }

  return Object.entries(buckets).map(([date, counts]) => ({ date, ...counts }))
}

// ─── status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Message['status'] }) {
  const { t } = useLanguage()
  switch (status) {
    case 'sent':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" /> {t('sms.status_sent')}
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" /> {t('sms.status_failed')}
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3" /> {t('sms.status_pending')}
        </span>
      )
  }
}

// ─── bar chart (pure SVG / Tailwind) ─────────────────────────────────────────

function BarChart({ data }: { data: { date: string; sent: number; failed: number }[] }) {
  const { t } = useLanguage()
  const maxVal = Math.max(...data.flatMap(d => [d.sent, d.failed]), 1)
  const BAR_H  = 100  // px height of chart area

  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-blue-500" />
        {t('sms.chart_title')}
      </p>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />{t('sms.status_sent')}</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-400 inline-block" />{t('sms.status_failed')}</span>
      </div>

      <div className="flex items-end gap-2" style={{ height: BAR_H + 28 }}>
        {data.map(d => {
          const sentH   = Math.round((d.sent   / maxVal) * BAR_H)
          const failedH = Math.round((d.failed / maxVal) * BAR_H)
          // short label: dd/MM
          const parts   = d.date.split('-')
          const label   = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.date

          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-0.5 group">
              {/* Bars */}
              <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: BAR_H }}>
                <div
                  className="w-3 rounded-t bg-emerald-500 transition-all duration-300 group-hover:opacity-80"
                  style={{ height: sentH || 2 }}
                  title={`Sent: ${d.sent}`}
                />
                <div
                  className="w-3 rounded-t bg-red-400 transition-all duration-300 group-hover:opacity-80"
                  style={{ height: failedH || 2 }}
                  title={`Failed: ${d.failed}`}
                />
              </div>
              {/* Date label */}
              <span className="text-[10px] text-gray-400 leading-tight text-center">{label}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── main component ────────────────────────────────────────────────────────────

export function MessagesClient({ messages, totalSent, totalFailed, totalPending }: Props) {
  const { t } = useLanguage()

  // ── filter state ──
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'failed' | 'pending'>('all')
  const [tenantSearch, setTenantSearch] = useState('')
  const [fromDate, setFromDate]         = useState('')
  const [toDate, setToDate]             = useState('')

  const hasFilters = statusFilter !== 'all' || tenantSearch || fromDate || toDate

  const clearFilters = () => {
    setStatusFilter('all')
    setTenantSearch('')
    setFromDate('')
    setToDate('')
  }

  // ── derived data ──
  const chartData = useMemo(() => buildChartData(messages), [messages])

  const filtered = useMemo(() => {
    return messages.filter(msg => {
      if (statusFilter !== 'all' && msg.status !== statusFilter) return false
      if (tenantSearch && !msg.tenant_name.toLowerCase().includes(tenantSearch.toLowerCase())) return false
      if (fromDate && toDateStr(msg.created_at) < fromDate) return false
      if (toDate   && toDateStr(msg.created_at) > toDate)   return false
      return true
    })
  }, [messages, statusFilter, tenantSearch, fromDate, toDate])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          {t('sms.history')}
        </h1>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('sms.total_sent')}</p>
            <p className="text-2xl font-bold text-gray-900">{totalSent}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('sms.total_failed')}</p>
            <p className="text-2xl font-bold text-gray-900">{totalFailed}</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-yellow-100">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('sms.status_pending')}</p>
            <p className="text-2xl font-bold text-gray-900">{totalPending}</p>
          </div>
        </Card>
      </div>

      {/* ── Bar Chart – last 7 days ── */}
      {messages.length > 0 && <BarChart data={chartData} />}

      {/* ── Filters ── */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mr-1">
            <Filter className="h-3.5 w-3.5" />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">{t('sms.filter_status')}</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="h-9 rounded-md border border-gray-300 px-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">{t('sms.filter_all')}</option>
              <option value="sent">{t('sms.status_sent')}</option>
              <option value="failed">{t('sms.status_failed')}</option>
              <option value="pending">{t('sms.status_pending')}</option>
            </select>
          </div>

          {/* Tenant search */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">{t('sms.tenant')}</label>
            <input
              type="text"
              placeholder={t('sms.filter_tenant')}
              value={tenantSearch}
              onChange={e => setTenantSearch(e.target.value)}
              className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 w-44"
            />
          </div>

          {/* From date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">{t('sms.filter_from')}</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="h-9 rounded-md border border-gray-300 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* To date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">{t('sms.filter_to')}</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="h-9 rounded-md border border-gray-300 px-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 h-9 px-3 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors self-end"
            >
              <X className="h-3.5 w-3.5" /> {t('sms.clear_filters')}
            </button>
          )}
        </div>
      </Card>

      {/* ── Messages Table ── */}
      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <MessageSquare className="h-10 w-10 mb-2" />
            <p>{messages.length === 0 ? t('sms.no_messages') : 'No messages match the filter.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('sms.tenant')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('sms.phone')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('sms.message_preview')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('sms.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('sms.retry_count')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('sms.sent_at')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map(msg => (
                  <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {msg.tenant_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap font-mono">
                      {msg.phone}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                      <p className="line-clamp-2">{msg.message}</p>
                      {msg.error && (
                        <p className="text-red-500 mt-0.5 text-[10px]">{msg.error}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={msg.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap text-center">
                      {msg.retry_count > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 font-medium">
                          {msg.retry_count}×
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {gregStrToEthiopian(msg.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* row count */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              {filtered.length} / {messages.length} messages
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
