import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, Building, CreditCard, BarChart, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    redirect('/owner') // fallback to owner or login
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Owners', href: '/admin/owners', icon: Users },
    { name: 'Buildings', href: '/admin/buildings', icon: Building },
    { name: 'Payments Monitor', href: '/admin/payments', icon: CreditCard },
    { name: 'Reports', href: '/admin/reports', icon: BarChart },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold tracking-tight text-blue-600">Admin Portal</h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.name} href={item.href} className="flex items-center px-2 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50 group transition-colors">
                <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <form action="/auth/signout" method="post">
             <button type="submit" className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors">
               <LogOut className="mr-3 h-5 w-5 text-gray-400" />
               Sign out
             </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium text-gray-800">Welcome, {user.email}</h2>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
