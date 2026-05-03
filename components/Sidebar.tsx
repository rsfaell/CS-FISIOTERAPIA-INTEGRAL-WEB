'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' // Importamos useRouter
import { supabase } from '@/lib/supabaseClients' // Importamos o supabase

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter() // Hook para redirecionar se necessário

  const bebasStyle = { fontFamily: "'Bebas Neue', sans-serif" }

  const baseButtonStyle = "flex items-center gap-4 px-6 py-2.5 rounded-[18px] text-2xl uppercase tracking-[0.15em] bg-white text-black shadow-lg border border-gray-100 transition-all active:scale-95 hover:bg-gray-50 w-full"
  
  const activeStyle = "ring-2 ring-black/10 bg-gray-50 border-teal-200"

  // FUNÇÃO PARA DESLOGAR
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      // O AuthWrapper vai detectar a mudança, 
      // mas podemos forçar o redirecionamento para a home
      router.push('/')
    } else {
      console.error('Erro ao sair:', error.message)
    }
  }

  return (
    <nav className="w-80 bg-teal-600 text-white p-6 flex flex-col border-r border-teal-700 shadow-2xl h-screen shrink-0">
      
      {/* CONTAINER DO LOGO */}
      <div className="h-40 flex flex-col justify-center items-center mt-[-10px]">
        <Link href="/" className="flex justify-center items-center">
          <img 
            src="/logocs.png" 
            alt="Logo" 
            className="w-40 h-40 object-contain hover:scale-105 transition-transform duration-300" 
          />
        </Link>
      </div>

      {/* LINHA SEPARADORA */}
      <div className="border-b border-teal-500/50 w-full mt-4 mb-3"></div>

      {/* LINKS DE NAVEGAÇÃO */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        <Link 
          href="/" 
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname === '/' ? activeStyle : ''}`}
        >
          <span className="text-2xl mt-[-4px]">🏠</span> Início
        </Link>

        <Link 
          href="/agenda" 
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname === '/agenda' ? activeStyle : ''}`}
        >
          <span className="text-2xl mt-[-4px]">📅</span> Agenda
        </Link>

        <Link 
          href="/pacientes" 
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname.startsWith('/pacientes') && !pathname.includes('prontuario') ? activeStyle : ''}`}
        >
          <span className="text-2xl mt-[-4px]">👥</span> Pacientes
        </Link>

        <Link 
          href="/prontuario" 
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname.startsWith('/prontuario') ? activeStyle : ''}`}
        >
          <span className="text-2xl mt-[-4px]">📝</span> Prontuários
        </Link>

        <Link 
          href="/financeiro" 
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname === '/financeiro' ? activeStyle : ''}`}
        >
          <span className="text-2xl mt-[-4px]">💰</span> Financeiro
        </Link>
      </div>

      {/* BOTÃO SAIR (Transformado em Button para disparar função) */}
      <div className="pt-6 border-t border-teal-500/50">
        <button 
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 px-6 py-2.5 rounded-[18px] text-2xl uppercase bg-white text-red-600 shadow-lg hover:bg-red-50 transition-all active:scale-95 border border-red-50 w-full cursor-pointer bebas-neue"
        >
          <span>🚪</span> Sair
        </button>
      </div>
    </nav>
  )
}