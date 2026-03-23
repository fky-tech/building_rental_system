'use client'

import { Card } from '@/components/ui/Card'
import { BarChart, Users, TrendingUp } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

interface ReportsClientProps {
  monthlyIncome: number
  unpaidCount: number
  occupancyRate: number
}

export function ReportsClient({ monthlyIncome, unpaidCount, occupancyRate }: ReportsClientProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('reports.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <TrendingUp className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-gray-500">{t('reports.monthly_income')}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{t('common.birr')} {monthlyIncome.toFixed(2)}</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600 mb-3">
            <Users className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-gray-500">{t('reports.unpaid_tenants')}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{unpaidCount}</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
            <BarChart className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-gray-500">{t('reports.occupancy')}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{occupancyRate}%</p>
        </Card>
      </div>

      <Card className="mt-8">
         <div className="h-64 flex flex-col justify-center items-center text-gray-400">
            <BarChart className="h-10 w-10 mb-2" />
            <p>{t('reports.income_chart')}</p>
         </div>
      </Card>
    </div>
  )
}
