import React from 'react'
import { LayoutDashboard, Users, CreditCard, BarChart, Settings, LogOut, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { LanguageToggle } from './LanguageToggle'
import { OwnerHeader } from './OwnerHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarProvider } from '@/components/layout/SidebarProvider'
import { LanguageProvider } from '@/lib/LanguageContext'

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
    { name: 'Dashboard', href: '/owner', icon: 'LayoutDashboard', translationKey: 'nav.dashboard' },
    { name: 'Rooms', href: '/owner/rooms', icon: 'Home', translationKey: 'nav.rooms' },
    { name: 'Tenants', href: '/owner/tenants', icon: 'Users', translationKey: 'nav.tenants' },
    { name: 'Payments', href: '/owner/payments', icon: 'CreditCard', translationKey: 'nav.payments' },
    { name: 'Reports', href: '/owner/reports', icon: 'BarChart', translationKey: 'nav.reports' },
    { name: 'Settings', href: '/owner/settings', icon: 'Settings', translationKey: 'nav.settings' },
  ]

  return (
    <LanguageProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-slate-50 flex">
          <Sidebar 
            navItems={navItems} 
            title={currentBuilding?.name || 'Owner Portal'} 
            logoColor="text-blue-400"
            type="owner"
          />

          <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
            <OwnerHeader buildingName={currentBuilding?.name} />
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </LanguageProvider>
  )
}
