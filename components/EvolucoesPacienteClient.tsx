'use client'
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClients';
import Link from 'next/link';

interface Paciente {
  nome: string;
}

interface SessaoEvolucao {
  id: string;
  data: string;
  evolucao: string | null;
  status: string;
}

export default function EvolucoesPacienteClient({ id }: { id: string }) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [evolucoes, setEvolucoes] = useState<SessaoEvolucao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEditado, setTextoEditado] = useState('');

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      const { data: p } = await supabase.from('pacientes').select('nome').eq('id', id).single();
      if (p) setPaciente(p);

      const { data: sessoes } = await supabase.from('agenda')
        .select('id, data, evolucao, status')
        .eq('paciente_id', id)
        .order('data', { ascending: false });

      if (sessoes) setEvolucoes(sessoes as SessaoEvolucao[]);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  async function salvarEdicao(sessaoId: string) {
    const { error } = await supabase
      .from('agenda')
      .update({ evolucao: textoEditado })
      .eq('id', sessaoId);

    if (!error) {
      setEditandoId(null);
      carregarDados();
    }
  }

  useEffect(() => { carregarDados(); }, [carregarDados]);

  if (carregando) return <div className="flex h-screen items-center justify-center bg-white font-black text-teal-600 animate-pulse text-xs uppercase tracking-widest">Carregando Histórico...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-20">
      <header className="w-full p-6 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href={`/pacientes/${id}`} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">{paciente?.nome}</h1>
            <p className="text-[9px] text-teal-600 font-bold uppercase tracking-[0.3em] mt-1">Histórico de Evoluções</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {evolucoes.map((sessao) => (
          <div key={sessao.id} className="bg-white rounded-[30px] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    {new Date(sessao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase ${sessao.status === 'finalizado' ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-600'}`}>
                    {sessao.status}
                  </span>
                </div>

                {editandoId !== sessao.id && (
                  <button
                    onClick={() => { setEditandoId(sessao.id); setTextoEditado(sessao.evolucao || ''); }}
                    className="text-[9px] font-black uppercase text-teal-600 hover:underline"
                  >
                    Editar Texto
                  </button>
                )}
              </div>

              {editandoId === sessao.id ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <textarea
                    className="w-full p-5 h-64 rounded-2xl bg-slate-50 border-none text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-teal-100 resize-none"
                    value={textoEditado}
                    onChange={(e) => setTextoEditado(e.target.value)}
                    placeholder="Digite a evolução aqui..."
                    autoFocus
                  />
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditandoId(null)} className="text-[9px] font-black uppercase text-slate-400 px-4">Cancelar</button>
                    <button
                      onClick={() => salvarEdicao(sessao.id)}
                      className="bg-slate-800 text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-800/20"
                    >
                      Salvar Alteração
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                    {sessao.evolucao || "Nenhuma evolução registrada para esta sessão."}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {evolucoes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum registro encontrado.</p>
          </div>
        )}
      </main>
    </div>
  );
}
