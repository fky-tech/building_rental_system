import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader } from '@/components/ui/Card'
import { BarChart, Building } from 'lucide-react'

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const { data: payments } = await supabase.from('payments').select('amount, status, payment_date')
  
  const totalRevenue = payments?.filter(p => p.status === 'verified').reduce((acc, curr) => acc + curr.amount, 0) || 0
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-blue-50 to-white">
          <div className="p-4 rounded-full bg-blue-100 mb-4 text-blue-600">
            <BarChart className="h-10 w-10" />
          </div>
          <p className="text-lg font-medium text-gray-600">Total Verified Revenue</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          <p className="mt-2 text-sm text-gray-500">Across all buildings and owners</p>
        </Card>

        <Card>
           <CardHeader title="Building Performance" subtitle="Revenue by Building" />
           <div className="h-48 flex items-center justify-center border border-dashed border-gray-200 rounded-lg text-gray-400">
              <Building className="mr-2 h-5 w-5" /> Detailed building performance chart goes here
           </div>
        </Card>
      </div>
    </div>
  )
}
