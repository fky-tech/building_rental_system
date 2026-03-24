'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

const languages = [
  { code: 'am' as const, name: 'አማርኛ' },
  { code: 'en' as const, name: 'English' }
]

export function LanguageToggle() {
  const [open, setOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectLanguage = (code: 'en' | 'am') => {
    setLanguage(code)
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <Globe className="h-4 w-4 text-blue-600" />
        <span>{languages.find(l => l.code === language)?.name.split(' ')[0]}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Select Language
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors group"
            >
              <span className={language === lang.code ? 'text-blue-600 font-semibold' : 'text-gray-700'}>
                {lang.name}
              </span>
              {language === lang.code && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
