import React from 'react'
import { LayoutDashboard, Users, Building, CreditCard, BarChart, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { SidebarProvider } from '@/components/layout/SidebarProvider'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    redirect('/owner')
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { name: 'Owners', href: '/admin/owners', icon: 'Users' },
    { name: 'Buildings', href: '/admin/buildings', icon: 'Building' },
    { name: 'Payments Monitor', href: '/admin/payments', icon: 'CreditCard' },
    { name: 'Reports', href: '/admin/reports', icon: 'BarChart' },
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          navItems={navItems} 
          title="Admin Portal" 
          logoColor="text-blue-600"
          type="admin"
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <h2 className="text-lg font-medium text-gray-800">Welcome, {user.email}</h2>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
