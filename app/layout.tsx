import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Building Rental SaaS',
  description: 'Manage buildings, tenants, leases, and payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
