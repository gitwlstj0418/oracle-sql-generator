import { Analytics } from '@vercel/analytics/next'
import { Inter, JetBrains_Mono, Noto_Sans_KR } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-code' })
const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-korean' })

export const metadata: Metadata = {
  title: 'SQLForge | Oracle SQL Generator',
  description: '자연어로 Oracle 19c·21c SQL을 생성하고 안전하게 검토하세요.',
  applicationName: 'SQLForge',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#faf9f6',
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="light bg-background">
      <body className={`${inter.variable} ${jetBrainsMono.variable} ${notoSansKr.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
