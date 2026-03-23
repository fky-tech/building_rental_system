import React from 'react'
import { LayoutDashboard, Users, CreditCard, BarChart, Settings, LogOut, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { LanguageToggle } from './LanguageToggle'
import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarProvider } from '@/components/layout/SidebarProvider'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'owner' && profile?.role !== 'admin') {
    redirect('/login')
  }

  // Get slug from headers
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const slug = host.includes('.localhost') ? host.split('.localhost')[0] : null
  
  const { data: currentBuilding } = slug 
    ? await supabase.from('buildings').select('name').eq('slug', slug).single()
    : { data: null }

  const navItems = [
    { name: 'Dashboard', href: '/owner', icon: 'LayoutDashboard' },
    { name: 'Rooms', href: '/owner/rooms', icon: 'Home' },
    { name: 'Tenants', href: '/owner/tenants', icon: 'Users' },
    { name: 'Payments', href: '/owner/payments', icon: 'CreditCard' },
    { name: 'Reports', href: '/owner/reports', icon: 'BarChart' },
    { name: 'Settings', href: '/owner/settings', icon: 'Settings' },
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar 
          navItems={navItems} 
          title={currentBuilding?.name || 'Owner Portal'} 
          logoColor="text-blue-400"
          type="owner"
        />

        <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center">
               <span className="text-gray-900 font-bold text-lg truncate max-w-[200px] md:max-w-none">
                 {currentBuilding?.name || 'Owner Portal'}
               </span>
            </div>
            <div className="flex items-center gap-4 text-normal">
              <LanguageToggle />
            </div>
          </header>
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
