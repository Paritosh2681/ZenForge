import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'GuruCortex | Active Cognitive Learning OS',
  description: 'Your personal AI learning companion - 100% local, 100% private',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#050B14] font-sans antialiased text-slate-100">{children}</body>
    </html>
  )
}
