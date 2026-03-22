import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { BarChart, Users, TrendingUp } from 'lucide-react'

export default async function OwnerReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // For a real app, query aggregated payments for the current month
  // and count unpaid tenants.
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Property Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <TrendingUp className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-gray-500">Monthly Income (Verified)</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">$0.00</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600 mb-3">
            <Users className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-gray-500">Unpaid Tenants</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">0</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
            <BarChart className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">0%</p>
        </Card>
      </div>

      <Card className="mt-8">
         <div className="h-64 flex flex-col justify-center items-center text-gray-400">
            <BarChart className="h-10 w-10 mb-2" />
            <p>Income vs. Expected Rent Chart</p>
         </div>
      </Card>
    </div>
  )
}
