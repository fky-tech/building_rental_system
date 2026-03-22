import React from 'react'

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        {children}
      </table>
    </div>
  )
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
      {children}
    </thead>
  )
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="hover:bg-gray-50 bg-white">{children}</tr>
}

export function Th({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-6 py-4 font-medium text-gray-900 ${className}`} {...props}>{children}</th>
}

export function Td({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-6 py-4 ${className}`} {...props}>{children}</td>
}
