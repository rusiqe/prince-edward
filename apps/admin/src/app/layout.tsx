import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prince Edward — Admin',
  description: 'School calendar admin dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
