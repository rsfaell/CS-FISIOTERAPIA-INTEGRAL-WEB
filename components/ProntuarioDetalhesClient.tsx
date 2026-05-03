'use client'
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClients';
import Link from 'next/link';
import Image from 'next/image';

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
}

interface Sessao {
  id: string;
  paciente_id: string;
  data: string;
  valor_consulta: number;
  forma_pagamento: string;
  status: string;
  evolucao?: string;
}

export default function ProntuarioDetalhesClient({ id }: { id: string }) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historico, setHistorico] = useState<Sessao[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Edição na Timeline
  const [editandoSessaoId, setEditandoSessaoId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editEvolucao, setEditEvolucao] = useState('');


  const carregarDados = useCallback(async () => {
    try {
      if (!id) return;
      setCarregando(true);
      const { data: p } = await supabase.from('pacientes').select('*').eq('id', id).single();
      if (p) setPaciente(p as Paciente);

      const { data: sessoes } = await supabase
        .from('agenda')
        .select('*')
        .eq('paciente_id', id)
        .order('data', { ascending: false });

      if (sessoes) setHistorico(sessoes as Sessao[]);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  async function salvarAjuste(sessaoId: string) {
    const { error } = await supabase.from('agenda').update({
      status: editStatus,
      evolucao: editEvolucao
    }).eq('id', sessaoId);

    if (!error) {
      setEditandoSessaoId(null);
      carregarDados();
    } else {
      console.error("Erro ao salvar ajuste:", error);
      alert("Ocorreu um erro ao salvar as alterações. Tente novamente.");
    }
  }

  async function excluirSessao(sessaoId: string) {
    if (!confirm("Tem certeza que deseja excluir este registro permanentemente?")) return;

    const { error } = await supabase.from('agenda').delete().eq('id', sessaoId);

    if (!error) {
      carregarDados();
    } else {
      console.error("Erro ao excluir sessão:", error);
      alert("Ocorreu um erro ao excluir a sessão. Tente novamente.");
    }
  }

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center bg-white font-black text-teal-600 animate-pulse text-xs uppercase tracking-widest">
        Sincronizando...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-white text-slate-800 font-sans overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none grayscale select-none">
        <Image src="/logocs.png" alt="Logo de fundo" width={600} height={600} className="w-full max-w-2xl object-contain" priority />
      </div>
      <div className="relative z-10 flex flex-col w-full h-full p-6 md:p-12">
        <header className="flex items-center gap-6 mb-12">
          <Link href="/prontuario" className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
              {paciente?.nome || 'Paciente'}
            </h1>
            <p className="text-teal-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">
              Prontuário Individual
            </p>
          </div>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Identificação</h3>
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">CPF: <span className="text-slate-800 ml-1">{paciente?.cpf || '---'}</span></p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Contato: <span className="text-slate-800 ml-1">{paciente?.telefone || '---'}</span></p>
              </div>
            </div>
          </aside>
          <section className="md:col-span-2 space-y-6">
            {historico.length > 0 ? (
              historico.map((sessao) => (
                <article key={sessao.id} className="bg-white/80 backdrop-blur-md p-6 rounded-[30px] border border-slate-100 shadow-sm transition-all hover:shadow-lg hover:border-teal-100">
                  {editandoSessaoId === sessao.id ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(sessao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        <select
                          className="p-2 bg-slate-50 rounded-lg text-[10px] font-bold uppercase"
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value)}
                          aria-label="Status da Sessão"
                        >
                          <option value="agendado">Agendado</option>
                          <option value="finalizado">Finalizado</option>
                          <option value="faltou">Faltou</option>
                        </select>
                      </div>
                      <textarea
                        className="w-full p-4 h-40 bg-slate-50 rounded-2xl text-xs text-slate-700 outline-none resize-none focus:ring-2 focus:ring-teal-200"
                        placeholder="Evolução da sessão..."
                        value={editEvolucao}
                        onChange={e => setEditEvolucao(e.target.value)}
                      />
                      <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setEditandoSessaoId(null)} className="text-[9px] font-black uppercase text-slate-400 px-4 py-2 hover:text-slate-600">
                          Cancelar
                        </button>
                        <button onClick={() => salvarAjuste(sessao.id)} className="bg-teal-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-700 transition-colors">
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {new Date(sessao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase border ${sessao.status === 'finalizado' ? 'bg-teal-50 text-teal-600 border-teal-100' : sessao.status === 'faltou' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                            {sessao.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { setEditandoSessaoId(sessao.id); setEditStatus(sessao.status); setEditEvolucao(sessao.evolucao || ''); }} className="p-2 text-slate-300 hover:text-teal-600 transition-colors" title="Editar sessão">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                          </button>
                          <button type="button" onClick={() => excluirSessao(sessao.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Excluir sessão">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-600 italic whitespace-pre-wrap leading-relaxed">
                        {sessao.evolucao || "Nenhuma evolução registrada para esta sessão."}
                      </div>
                    </>
                  )}
                </article>
              ))
            ) : (
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-20 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                Nenhum registro de evolução encontrado.
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
