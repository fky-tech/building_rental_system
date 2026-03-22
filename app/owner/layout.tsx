import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Building, CreditCard, BarChart, Settings, LogOut, Home, Mail, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { LanguageToggle } from './LanguageToggle'

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
    { name: 'Dashboard', href: '/owner', icon: LayoutDashboard },
    { name: 'Rooms', href: '/owner/rooms', icon: Home },
    { name: 'Tenants', href: '/owner/tenants', icon: Users },
    { name: 'Payments', href: '/owner/payments', icon: CreditCard },
    { name: 'Reports', href: '/owner/reports', icon: BarChart },
    { name: 'Settings', href: '/owner/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-[#1e293b] text-white flex-col hidden md:flex h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 bg-[#0f172a]">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">
            {currentBuilding?.name || 'Owner Portal'}
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-800 group transition-colors">
                <Icon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-blue-400" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 bg-[#0f172a]">
          <form action="/auth/signout" method="post">
             <button type="submit" className="flex w-full items-center px-3 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-red-900/50 hover:text-red-400 transition-colors">
               <LogOut className="mr-3 h-5 w-5 text-slate-400" />
               Sign out
             </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center">
             <span className="text-gray-900 font-bold text-lg">{currentBuilding?.name || 'Owner Portal'}</span>
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
  )
}
