'use client'
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClients';
import Link from 'next/link';
import Image from 'next/image';

interface PacienteProntuario {
  id: string;
  nome: string;
  cpf: string;
}

interface Agendamento {
  id: string;
  data: string;
  status: string;
  pacientes: { id: string; nome: string; cpf: string } | null;
}

export default function SelecionarPacienteEvolucao() {
  const [pacientes, setPacientes] = useState<PacienteProntuario[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);

      // Carregar sessões de hoje
      const hoje = new Date();
      const inicio = new Date(hoje.setHours(0, 0, 0, 0)).toISOString();
      const fim = new Date(hoje.setHours(23, 59, 59, 999)).toISOString();

      const { data: dataAgenda } = await supabase
        .from('agenda')
        .select(`id, data, status, pacientes (id, nome, cpf)`)
        .gte('data', inicio)
        .lte('data', fim)
        .order('data', { ascending: true });

      if (dataAgenda) setAgendamentos(dataAgenda as unknown as Agendamento[]);

      // Carregar todos os pacientes para busca
      const { data: dataPacientes } = await supabase.from('pacientes').select('id, nome, cpf').order('nome');
      if (dataPacientes) setPacientes(dataPacientes as PacienteProntuario[]);

    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

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
      {/* LOGO MARCA D'ÁGUA */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-10 opacity-[0.05] grayscale select-none">
        <Image src="/logocs.png" alt="" width={600} height={600} className="w-full max-w-2xl object-contain" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        {/* HEADER */}
        <header className="w-full p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-50 bg-white/80 backdrop-blur-md gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-slate-800">Prontuários</h1>
            <p className="text-[9px] text-teal-600 font-bold uppercase tracking-[0.3em] mt-1">Acesso rápido aos registros clínicos</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="BUSCAR PACIENTE..."
                  className="px-5 py-2.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-teal-100 w-full md:w-64 transition-all"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">

          {/* SEÇÃO DE AGENDAMENTOS DE HOJE */}
          {busca === '' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-8 bg-teal-600 rounded-full" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sessões de Hoje</h2>
              </div>

              {agendamentos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agendamentos.map((sessao) => (
                    <Link
                      key={sessao.id}
                      href={`/prontuario/detalhes?id=${sessao.pacientes?.id}`}
                      className="group flex items-center justify-between p-5 bg-teal-600 rounded-[25px] text-white shadow-lg shadow-teal-600/20 hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center bg-white/20 p-2 rounded-xl min-w-[60px]">
                          <span className="block text-[14px] font-black leading-none">
                            {new Date(sessao.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight truncate max-w-[150px]">
                            {sessao.pacientes?.nome || 'Paciente'}
                          </p>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-teal-100">
                            {sessao.status}
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-teal-600 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[30px] p-8 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma sessão agendada para hoje</p>
                </div>
              )}
            </section>
          )}

          {/* LISTA COMPLETA / RESULTADOS DE BUSCA */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-8 bg-slate-200 rounded-full" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                {busca !== '' ? 'Resultados da Busca' : 'Todos os Pacientes'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map(paciente => (
                <Link
                  key={paciente.id}
                  href={`/prontuario/detalhes?id=${paciente.id}`}
                  className="group relative bg-white border border-slate-100 p-6 rounded-[30px] shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-500 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-600 group-hover:text-white font-black text-sm transition-all">
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
                  <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                      Acessar Prontuário →
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all">
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
          </section>

        </main>
      </div>
    </div>
  );
}
