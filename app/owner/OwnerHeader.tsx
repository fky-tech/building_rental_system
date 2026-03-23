'use client'

import React from 'react'
import { LanguageToggle } from './LanguageToggle'
import { useLanguage } from '@/lib/LanguageContext'

export function OwnerHeader({ buildingName }: { buildingName?: string | null }) {
  const { t } = useLanguage()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center overflow-hidden">
         <span className="text-gray-900 font-bold text-lg truncate">
           {buildingName || t('nav.dashboard')}
         </span>
      </div>
      <div className="flex items-center gap-4 text-normal shrink-0">
        <LanguageToggle />
      </div>
    </header>
  )
}
