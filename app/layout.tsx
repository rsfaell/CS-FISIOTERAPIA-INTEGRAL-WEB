import './globals.css'
import Sidebar from '@/components/Sidebar'
import AuthWrapper from '@/components/AuthWrapper' // Importe o componente que criamos

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="flex h-screen bg-white">
        <AuthWrapper>
          {/* Tudo aqui dentro só aparece após o login */}
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </AuthWrapper>
      </body>
    </html>
  )
}