'use client'

import React, { useState, useEffect } from 'react'
import { ethiopianToGregorian, gregorianToEthiopian, localDateToString } from '@/lib/ethiopian-calendar'

const ETHIOPIAN_MONTHS_EN = [
  'Meskerem', 'Tikemet', 'Hidar', 'Tahsas',
  'Tir', 'Yekatit', 'Megabit', 'Miyazia',
  'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
]

interface EthiopianDateInputProps {
  name: string
  id?: string
  required?: boolean
  defaultValue?: string // Gregorian YYYY-MM-DD
  className?: string
  onChange?: (gregorianDate: string) => void
}

export function EthiopianDateInput({
  name,
  id,
  required,
  defaultValue,
  className,
  onChange,
}: EthiopianDateInputProps) {
  // Parse defaultValue (gregorian) into Ethiopian
  const today = new Date()
  const ethToday = gregorianToEthiopian(today)

  const getInitialEth = () => {
    if (defaultValue) {
      const d = new Date(defaultValue + 'T00:00:00')
      if (!isNaN(d.getTime())) return gregorianToEthiopian(d)
    }
    return ethToday
  }

  const initialEth = getInitialEth()
  const [ethYear, setEthYear] = useState(initialEth.year)
  const [ethMonth, setEthMonth] = useState(initialEth.month)
  const [ethDay, setEthDay] = useState(initialEth.day)

  // Convert back to gregorian for the hidden input
  const gregorianDate = (() => {
    try {
      const d = ethiopianToGregorian(ethYear, ethMonth, ethDay)
      if (isNaN(d.getTime())) return ''
      // Use local date formatting to avoid UTC timezone shift (off-by-one in UTC+3)
      return localDateToString(d)
    } catch {
      return ''
    }
  })()

  useEffect(() => {
    if (onChange && gregorianDate) onChange(gregorianDate)
  }, [gregorianDate])

  // Days in this Ethiopian month (30, except Pagume = 5 or 6)
  const daysInMonth = ethMonth === 13 ? ((ethYear % 4 === 3) ? 6 : 5) : 30

  return (
    <div className="flex gap-2 items-center">
      {/* Hidden input with Gregorian value — this is what gets submitted */}
      <input type="hidden" name={name} value={gregorianDate} />

      {/* Ethiopian Day */}
      <select
        id={id}
        required={required}
        value={ethDay}
        onChange={e => {
          const val = Number(e.target.value)
          setEthDay(Math.min(val, daysInMonth))
        }}
        className={className || 'h-10 rounded-md border border-gray-300 px-2 focus:ring-blue-500 focus:border-blue-500 text-sm'}
      >
        {Array.from({ length: daysInMonth }, (_, i) => (
          <option key={i + 1} value={i + 1}>{i + 1}</option>
        ))}
      </select>

      {/* Ethiopian Month */}
      <select
        required={required}
        value={ethMonth}
        onChange={e => {
          setEthMonth(Number(e.target.value))
          const newDays = Number(e.target.value) === 13 ? ((ethYear % 4 === 3) ? 6 : 5) : 30
          setEthDay(prev => Math.min(prev, newDays))
        }}
        className={className || 'h-10 rounded-md border border-gray-300 px-2 focus:ring-blue-500 focus:border-blue-500 text-sm'}
      >
        {ETHIOPIAN_MONTHS_EN.map((m, i) => (
          <option key={i + 1} value={i + 1}>{m}</option>
        ))}
      </select>

      {/* Ethiopian Year */}
      <input
        type="number"
        required={required}
        value={ethYear}
        min={2000}
        max={2100}
        onChange={e => setEthYear(Number(e.target.value))}
        className={className || 'h-10 w-24 rounded-md border border-gray-300 px-2 focus:ring-blue-500 focus:border-blue-500 text-sm'}
        placeholder="Year"
      />

      {/* Show Gregorian equivalent as hint */}
      {gregorianDate && (
        <span className="text-xs text-gray-400 whitespace-nowrap">({gregorianDate})</span>
      )}
    </div>
  )
}
