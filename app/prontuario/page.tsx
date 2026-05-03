'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClients'; // Ajuste para 'supabaseClient' se necessário
import Link from 'next/link';

export default function SelecionarPacienteEvolucao() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  async function carregarPacientes() {
    try {
      setCarregando(true);
      const { data } = await supabase.from('pacientes').select('*').order('nome');
      if (data) setPacientes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPacientes();
  }, []);

  const filtrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.cpf?.includes(busca)
  );

  if (carregando) return (
    <div className="flex h-screen items-center justify-center bg-white font-black text-teal-600 animate-pulse text-xs uppercase tracking-widest">
      Sincronizando...
    </div>
  );

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-sans bg-white text-slate-800">
      {/* LOGO MARCA D'ÁGUA DE FUNDO - Padronizado */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-10 opacity-[0.07] grayscale select-none">
        <img src="/logocs.png" alt="" className="w-full max-w-2xl object-contain" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        {/* HEADER PADRONIZADO */}
        <header className="w-full p-6 flex justify-between items-center border-b border-slate-50 bg-white/80 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-slate-800">Prontuários</h1>
            <p className="text-[9px] text-teal-600 font-bold uppercase tracking-[0.3em] mt-1">Selecione o paciente para prontuário</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="BUSCAR NOME OU CPF..." 
                  className="px-5 py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-teal-100 w-64 transition-all"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
             </div>
          </div>
        </header>

        {/* LISTAGEM EM GRID DE CARDS */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map(paciente => (
              <Link 
                key={paciente.id} 
                href={`/prontuario/${paciente.id}`}
                className="group relative bg-white/60 backdrop-blur-sm p-8 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-500 flex flex-col justify-between overflow-hidden"
              >
                {/* Detalhe estético no card */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-teal-600/20">
                      {paciente.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-tight text-slate-800 group-hover:text-teal-600 transition-colors">
                        {paciente.nome}
                      </h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        CPF: {paciente.cpf || '---'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    Acessar Histórico →
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}

            {filtrados.length === 0 && !carregando && (
              <div className="col-span-full py-20 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Nenhum paciente encontrado</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}