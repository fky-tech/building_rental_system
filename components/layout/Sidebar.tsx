'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './SidebarProvider'
import { 
  Menu, X, LogOut, ChevronLeft, ChevronRight,
  LayoutDashboard, Users, Building, CreditCard, BarChart, Settings, Home
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

type NavItem = {
  name: string
  href: string
  icon: string // Changed to string for serialization
}

const IconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  Building,
  CreditCard,
  BarChart,
  Settings,
  Home
}

export function Sidebar({ 
  navItems, 
  title, 
  logoColor = "text-blue-600",
  type = "admin" 
}: { 
  navItems: NavItem[], 
  title: string, 
  logoColor?: string,
  type?: 'admin' | 'owner'
}) {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const pathname = usePathname()

  const isOwner = type === 'owner'
  const bgColor = isOwner ? "bg-[#1e293b]" : "bg-white"
  const textColor = isOwner ? "text-slate-300" : "text-gray-700"
  const activeColor = isOwner ? "text-white bg-slate-800" : "text-blue-600 bg-gray-50"
  const iconColor = isOwner ? "text-slate-400" : "text-gray-400"
  const activeIconColor = isOwner ? "text-blue-400" : "text-blue-500"
  const borderColor = isOwner ? "border-slate-800" : "border-gray-200"

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} ${bgColor} border-r ${borderColor} flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0 z-40`}>
      {/* Header */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b ${borderColor} shrink-0`}>
        {!isCollapsed && (
          <h1 className={`text-xl font-bold tracking-tight ${logoColor} truncate`}>
            {title}
          </h1>
        )}
        <button 
          onClick={toggleSidebar}
          className={`p-2 rounded-lg hover:bg-gray-100 ${isCollapsed ? 'text-gray-400' : 'text-gray-400'} transition-colors`}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-3 py-6 space-y-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto no-scrollbar'}`}>
        {navItems.map((item) => {
          const Icon = IconMap[item.icon] || Home
          // Fixed active logic: Dashboard only active on exact match
          const isActive = (item.href === '/admin' || item.href === '/owner') 
            ? pathname === item.href 
            : pathname.startsWith(item.href)
          
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`
                flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative
                ${isActive ? activeColor : `${textColor} hover:bg-opacity-80 hover:${isOwner ? 'bg-slate-800' : 'bg-gray-50'}`}
              `}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? activeIconColor : iconColor} group-hover:scale-110 transition-transform`} />
              {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
              {isCollapsed && (
                 <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                    {item.name}
                 </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t ${borderColor}`}>
        <form action="/auth/signout" method="post">
           <button 
            type="submit" 
            className={`
              flex w-full items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-all duration-200
            `}
           >
             <LogOut className={`h-5 w-5 shrink-0`} />
             {!isCollapsed && <span className="ml-3">Sign out</span>}
           </button>
        </form>
      </div>
    </aside>
  )
}
