'use client'

import './globals.css'
import Sidebar from '@/components/Sidebar'
import AuthWrapper from '@/components/AuthWrapper'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className="overscroll-none select-none">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0d9488" />
      </head>
      <body className="flex h-screen bg-white overflow-hidden">
        <AuthWrapper>
          <Sidebar />
          <main className="flex-1 overflow-y-auto relative">
            {children}
          </main>
        </AuthWrapper>
      </body>
    </html>
  )
}