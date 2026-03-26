import type { Metadata } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const fontOutfit = Outfit({ 
  subsets: ['latin'], 
  variable: '--font-outfit',
})

const fontMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'gurucortex | Knowledge Intelligence Platform',
  description: 'Your personal AI learning companion — 100% local, 100% private',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${fontOutfit.variable} ${fontMono.variable}`}>
      <body style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>{children}</body>
    </html>
  )
}
