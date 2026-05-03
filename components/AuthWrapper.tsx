'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClients';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [modoLogin, setModoLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    // 1. Verifica se já existe uma sessão ativa ao carregar
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setCarregando(false);
    };

    checkSession();

    // 2. Escuta mudanças (Login/Logout) em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCarregando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro('ACESSO NEGADO: CREDENCIAIS INVÁLIDAS');
    }
  };

  // TELA DE CARREGAMENTO INICIAL (Evita que o sistema "pisque" antes de checar o login)
  if (carregando) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[10000]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] animate-pulse">
            Sincronizando Portal
          </p>
        </div>
      </div>
    );
  }

  // TELA DE BLOQUEIO (Se não estiver logado)
  if (!session) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center font-sans overflow-hidden">
        
        {/* MARCA D'ÁGUA CENTRALIZADA */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none p-10">
          <img 
            src="/logocs.png" 
            alt="" 
            className="w-full max-w-3xl opacity-[0.06] grayscale object-contain" 
          />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8 text-center">
          <div className="mb-12 space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 leading-tight tracking-tighter uppercase">
              CS FISIOTERAPIA<br/>
              <span className="text-teal-600">INTEGRAL</span>
            </h1>
            <div className="h-1.5 w-12 bg-teal-600 mx-auto rounded-full opacity-40"></div>
          </div>

          {!modoLogin ? (
            <button 
              onClick={() => setModoLogin(true)}
              className="bg-teal-600 text-white px-12 py-5 rounded-[25px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-teal-600/30 hover:bg-teal-700 transition-all hover:scale-105 active:scale-95"
            >
              Começar Atendimento
            </button>
          ) : (
            <form onSubmit={handleLogin} className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="text-left space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">E-mail Profissional</label>
                <input 
                  type="email" 
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[22px] text-xs font-bold outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                  placeholder="DIGITE SEU E-MAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="text-left space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Senha de Acesso</label>
                <input 
                  type="password" 
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[22px] text-xs font-bold outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>

              {erro && (
                <div className="py-2 px-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{erro}</p>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-5 rounded-[22px] font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all active:scale-95 mt-2"
              >
                Acessar Sistema
              </button>
              
              <button 
                type="button" 
                onClick={() => setModoLogin(false)}
                className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors pt-2"
              >
                Voltar ao Início
              </button>
            </form>
          )}
        </div>

        <footer className="absolute bottom-8 text-center opacity-30">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.5em]">
            Gestão Administrativa © 2026
          </p>
        </footer>
      </div>
    );
  }

  // SE ESTIVER LOGADO: Renderiza o App normalmente
  return <>{children}</>;
}