'use client'
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClients';
import Link from 'next/link';

export default function EvolucoesDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;

  const [paciente, setPaciente] = useState<any>(null);
  const [evolucoes, setEvolucoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEditado, setTextoEditado] = useState('');

  async function carregarDados() {
    try {
      setCarregando(true);
      const { data: p } = await supabase.from('pacientes').select('nome').eq('id', id).single();
      if (p) setPaciente(p);
      const { data: sessoes } = await supabase.from('agenda').select('id, data, evolucao, status').eq('paciente_id', id).order('data', { ascending: false });
      if (sessoes) setEvolucoes(sessoes);
    } finally { setCarregando(false); }
  }

  async function salvarEdicao(sessaoId: string) {
    const { error } = await supabase.from('agenda').update({ evolucao: textoEditado }).eq('id', sessaoId);
    if (!error) { setEditandoId(null); carregarDados(); }
  }

  useEffect(() => { carregarDados(); }, [id]);

  if (carregando) return <div className="flex h-screen items-center justify-center bg-white font-black text-teal-600 animate-pulse text-xs uppercase tracking-widest tracking-[0.5em]">Carregando Histórico...</div>;

  return (
    <div className="relative min-h-screen bg-slate-50/30 overflow-hidden">
      {/* LOGICA DA LOGO EM BACKGROUND */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-10 select-none opacity-[0.08]">
        <img src="/logocs.png" alt="" className="w-full max-w-2xl grayscale object-contain" />
      </div>

      <div className="relative z-10">
        <header className="p-8 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-6">
            <Link href="/prontuario" className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-800 leading-none">{paciente?.nome}</h1>
              <p className="text-[9px] text-teal-600 font-bold uppercase tracking-[0.3em] mt-2">Prontuário de Evoluções</p>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-8 space-y-6">
          {evolucoes.map((sessao) => (
            <article key={sessao.id} className="bg-white/80 backdrop-blur-sm rounded-[35px] border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-teal-100">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
                      {new Date(sessao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase ${sessao.status === 'finalizado' ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-600'}`}>
                      {sessao.status}
                    </span>
                  </div>
                  {editandoId !== sessao.id && (
                    <button onClick={() => { setEditandoId(sessao.id); setTextoEditado(sessao.evolucao || ''); }} className="text-[10px] font-black uppercase text-teal-600 bg-teal-50/50 px-4 py-2 rounded-xl hover:bg-teal-100 transition-colors">Editar Registro</button>
                  )}
                </div>

                {editandoId === sessao.id ? (
                  <div className="space-y-4 animate-in zoom-in-95 duration-200">
                    <textarea 
                      className="w-full p-6 h-60 rounded-3xl bg-white border-2 border-teal-50 text-sm font-medium text-slate-700 outline-none focus:border-teal-200 resize-none shadow-inner"
                      aria-label="Editar evolução"
                      placeholder="Digite a evolução do atendimento aqui..."
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setEditandoId(null)} className="text-[10px] font-black uppercase text-slate-400 px-6">Cancelar</button>
                      <button onClick={() => salvarEdicao(sessao.id)} className="bg-slate-800 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Salvar Alterações</button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-600 leading-relaxed italic whitespace-pre-wrap">
                      {sessao.evolucao || "Sem evoluções registradas para este atendimento."}
                    </p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}