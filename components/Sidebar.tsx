'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClients'
import { Menu, X, Home, Calendar, Users, FileText, DollarSign, LogOut } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

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
    <>
      {/* Botão Hambúrguer para Mobile */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed left-4 z-[100] p-3 bg-teal-600 rounded-2xl shadow-lg"
        style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        {isOpen ? <X className="text-white" size={24} /> : <Menu className="text-white" size={24} />}
      </button>

      <nav
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:static z-[90] w-80 bg-teal-600 text-white p-6 flex flex-col border-r border-teal-700 shadow-2xl h-screen shrink-0 transition-transform duration-300
        `}
        style={{
          paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))'
        }}
      >
      {/* CONTAINER DO LOGO */}
      <div className="h-40 flex flex-col justify-center items-center mt-[-10px]">
        <Link href="/" className="flex justify-center items-center">
          <Image 
            src="/logocs.png" 
            alt="Logo" 
            width={160}
            height={160}
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
          onClick={() => setIsOpen(false)}
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname === '/' ? activeStyle : ''}`}
        >
          <Home size={22} className="text-teal-600" /> Início
        </Link>

        <Link 
          href="/agenda" 
          onClick={() => setIsOpen(false)}
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname === '/agenda' ? activeStyle : ''}`}
        >
          <Calendar size={22} className="text-teal-600" /> Agenda
        </Link>

        <Link 
          href="/pacientes" 
          onClick={() => setIsOpen(false)}
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname.startsWith('/pacientes') && !pathname.includes('prontuario') ? activeStyle : ''}`}
        >
          <Users size={22} className="text-teal-600" /> Pacientes
        </Link>

        <Link 
          href="/prontuario" 
          onClick={() => setIsOpen(false)}
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname.startsWith('/prontuario') ? activeStyle : ''}`}
        >
          <FileText size={22} className="text-teal-600" /> Prontuários
        </Link>

        <Link 
          href="/financeiro" 
          onClick={() => setIsOpen(false)}
          style={bebasStyle}
          className={`${baseButtonStyle} ${pathname === '/financeiro' ? activeStyle : ''}`}
        >
          <DollarSign size={22} className="text-teal-600" /> Financeiro
        </Link>
      </div>

      {/* BOTÃO SAIR (Transformado em Button para disparar função) */}
      <div className="pt-6 border-t border-teal-500/50">
        <button 
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 px-6 py-2.5 rounded-[18px] text-2xl uppercase bg-white text-red-600 shadow-lg hover:bg-red-50 transition-all active:scale-95 border border-red-50 w-full cursor-pointer bebas-neue"
        >
          <LogOut size={22} /> Sair
        </button>
      </div>
    </nav>
    </>
  )
}