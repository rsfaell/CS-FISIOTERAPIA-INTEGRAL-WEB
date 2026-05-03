'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClients';

export default function HomePage() {
  const [nomeUsuario, setNomeUsuario] = useState('');

  useEffect(() => {
    async function obterUsuario() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const nome = user.user_metadata?.display_name?.split(' ')[0] 
                  || user.email?.split('@')[0] 
                  || 'Profissional';
        setNomeUsuario(nome);
      }
    }
    obterUsuario();
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-10 bg-white">
      {/* MARCA D'ÁGUA DE FUNDO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <Image src="/logocs.png" alt="" width={512} height={512} className="w-full max-w-lg grayscale" />
      </div>

      <div className="relative z-10 text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.5em]">
            Painel de Controle
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Olá, {nomeUsuario}
          </h1>
        </div>
        
        <div className="h-1 w-12 bg-teal-600 mx-auto rounded-full opacity-30"></div>
        
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
          Selecione uma opção no menu lateral para gerenciar seus pacientes e agenda.
        </p>
      </div>
    </div>
  );
}