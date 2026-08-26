import { Analytics } from '@vercel/analytics/next'
import { Noto_Sans_KR } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-korean' })

export const metadata: Metadata = {
  title: 'Oracle SQL Generator',
  description: '자연어로 빠르고 정확한 Oracle SQL을 생성하세요.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#faf9f6',
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="bg-background">
      <body className={`${notoSansKr.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
