import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ShrimpSense',
  description: 'ระบบจัดการฟาร์มกุ้งอัจฉริยะ ที่ช่วยให้คุณดูแลบ่อกุ้งได้อย่างมีประสิทธิภาพ',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShrimpSense',
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: 'Smart Shrimp Farm',
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#fcfaf7',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#fcfaf7',
  interactiveWidget: 'resizes-content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        {/* PWA Manifest Link */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon and PWA Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ShrimpSense" />
        <meta name="msapplication-TileColor" content="#fcfaf7" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ServiceWorkerRegistration>
              {children}
            </ServiceWorkerRegistration>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}