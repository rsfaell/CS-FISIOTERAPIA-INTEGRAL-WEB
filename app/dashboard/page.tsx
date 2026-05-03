'use client'
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClients';
import { useRouter } from 'next/navigation';

export default function DetalhesPaciente({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams?.id;

  const [paciente, setPaciente] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        if (!id) return;
        const { data: p } = await supabase.from('pacientes').select('*').eq('id', id).single();
        if (p) setPaciente(p);
      } catch (err) { console.error(err); } 
      finally { setCarregando(false); }
    }
    carregarDados();
  }, [id]);

  // Função de redirecionamento direto
  const irParaAgenda = () => {
    // Substitua pelo caminho real da sua página de agenda, 
    // geralmente algo como /pacientes/[id]/agenda ou similar
    router.push(`/agenda`); 
  };

  if (carregando) return <div className="flex h-screen items-center justify-center font-bold text-teal-600 animate-pulse tracking-widest uppercase text-sm">Carregando...</div>;

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-sans bg-white">
      
      {/* MARCA D'ÁGUA (Opacidade 0.08 e centralizada) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-10 select-none">
        <img 
          src="/logocs.png" 
          alt="" 
          className="w-full max-w-2xl opacity-[0.08] grayscale object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Como é uma página inicial de recepção, o header pode ser omitido 
            ou mantido apenas para exibir o nome do paciente */}
        <header className="w-full p-4 flex justify-end items-center animate-in fade-in">
           <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
             Sessão Ativa: {paciente?.nome?.split(' ')[0]}
           </span>
        </header>

        <main className="flex-1 flex flex-col items-center justify-start p-6">
          
          <div className="w-full mt-10 md:mt-16 flex flex-col items-center animate-in fade-in zoom-in duration-700 text-center">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-slate-800 leading-tight tracking-tighter uppercase">
                Bem-vindo à <br/>
                <span className="text-teal-600">CS Fisioterapia Integral</span>
              </h2>
              <div className="h-1 w-16 bg-teal-600 mx-auto rounded-full my-4 opacity-40"></div>
            </div>  
            

            {/* BOTÃO COM REDIRECIONAMENTO REAL */}
            <button 
              onClick={irParaAgenda}
              className="mt-10 bg-teal-600 text-white px-10 py-4 rounded-[20px] font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:scale-105 transition-all active:scale-95"
              title="Ir para a página de agenda"
              aria-label="Começar Atendimento"
            >
              Começar Atendimento
            </button>
          </div>
        </main>

        <footer className="p-6 text-center opacity-30 mt-auto">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">
             CS FISIOTERAPIA INTEGRAL © 2026
           </p>
        </footer>
      </div>
    </div>
  );
}