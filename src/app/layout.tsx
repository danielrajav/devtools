import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dev Tools Hub - Essential Development Tools',
  description: 'Your one-stop destination for essential development tools including JSON formatter, URL encoder, Base64 converter, and more.',
  keywords: 'developer tools, JSON formatter, URL encoder, Base64, development utilities',
  authors: [{ name: 'Dev Tools Hub' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#667eea',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}