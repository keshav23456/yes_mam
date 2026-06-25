import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YesMadam Partner Ops Desk',
  description: 'AI-powered partner operations for YesMadam',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
