import React from 'react'
import { AlertTriangle, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { headers } from 'next/headers'

export default async function NotWorkingPage() {
  const headersList = await (await import('next/headers')).headers()
  const host = headersList.get('host') || 'localhost:3000'
  const loginUrl = host.includes('.localhost') ? `http://${host}/login` : 'http://localhost:3000/login'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <AlertTriangle size={40} />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Building Deactivated</h1>
        <p className="text-slate-600">
          This building's portal is currently inactive or has been disabled by the administrator. 
          Please contact the building management for more information.
        </p>
        
        <div className="pt-6">
          <Link href={loginUrl}>
            <Button variant="primary" size="lg" className="w-full">
              <Home className="mr-2 h-5 w-5" /> Return to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
