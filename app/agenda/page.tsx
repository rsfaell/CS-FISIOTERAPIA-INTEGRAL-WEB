'use client'
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClients';
import Link from 'next/link';
import Image from 'next/image';

type FiltroPeriodo = 'dia' | 'semana' | 'mes' | 'ano';

interface Agendamento {
  id: string;
  data: string;
  status: string;
  valor_consulta: number;
  forma_pagamento: string;
  pacientes: { id: string; nome: string } | null;
}

export default function AgendaCompleta() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState<FiltroPeriodo>('dia');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [novoValor, setNovoValor] = useState<number>(0);
  const [novoPagamento, setNovoPagamento] = useState('');

  const carregarAgenda = useCallback(async () => {
    setCarregando(true);
    const inicio = new Date(dataSelecionada + 'T00:00:00');
    const fim = new Date(dataSelecionada + 'T23:59:59');

    if (periodo === 'dia') {
      inicio.setHours(0, 0, 0, 0); fim.setHours(23, 59, 59, 999);
    } else if (periodo === 'semana') {
      const diaSemana = inicio.getDay();
      inicio.setDate(inicio.getDate() - diaSemana);
      fim.setDate(inicio.getDate() + 6);
    } else if (periodo === 'mes') {
      inicio.setDate(1);
      fim.setMonth(fim.getMonth() + 1); fim.setDate(0);
    } else if (periodo === 'ano') {
      inicio.setMonth(0, 1); fim.setMonth(11, 31);
    }

    const { data, error } = await supabase
      .from('agenda')
      .select(`id, data, status, valor_consulta, forma_pagamento, pacientes (id, nome)`)
      .gte('data', inicio.toISOString())
      .lte('data', fim.toISOString())
      .order('data', { ascending: true });

    if (!error) setAgendamentos((data as unknown as Agendamento[]) || []);
    setCarregando(false);
  }, [dataSelecionada, periodo]);

  async function apagarSessao(id: string) {
    if (!window.confirm("Deseja excluir permanentemente esta sessão?")) return;
    const { error } = await supabase.from('agenda').delete().eq('id', id);
    if (!error) setAgendamentos(agendamentos.filter(item => item.id !== id));
  }

  async function salvarEdicao(id: string) {
    const eFalta = novoStatus === 'faltou';
    const valorFinal = eFalta ? 0 : (novoPagamento === 'gratis' ? 0 : novoValor);
    
    const { error } = await supabase
      .from('agenda')
      .update({
        status: novoStatus,
        valor_consulta: valorFinal,
        forma_pagamento: eFalta ? 'faltou' : novoPagamento 
      })
      .eq('id', id);

    if (!error) { setEditandoId(null); carregarAgenda(); }
  }

  useEffect(() => { carregarAgenda(); }, [carregarAgenda]);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-sans bg-white">
      {/* Marca d'água */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-10 opacity-[0.08]">
        <Image src="/logocs.png" alt="" width={600} height={600} className="w-full max-w-2xl grayscale object-contain" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <header className="w-full p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50 bg-white/80 backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Agenda</h1>
            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-[0.3em] mt-1">Gestão de atendimentos</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <nav className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {(['dia', 'semana', 'mes', 'ano'] as FiltroPeriodo[]).map((p) => (
                <button 
                  key={p} 
                  type="button"
                  onClick={() => setPeriodo(p)} 
                  aria-pressed={periodo === p ? "true" : "false"}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${periodo === p ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {p === 'mes' ? 'MÊS' : p}
                </button>
              ))}
            </nav>
            <input type="date" aria-label="Selecionar data" className="p-2.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 bg-white text-xs font-black uppercase text-slate-600" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-4">
            {carregando ? (
              <div className="flex justify-center py-20 text-teal-600 animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando...</div>
            ) : agendamentos.length > 0 ? (
              agendamentos.map((item) => (
                <div key={item.id} className="bg-white/60 backdrop-blur-md border border-slate-100 p-5 rounded-[30px] shadow-sm">
                  {editandoId === item.id ? (
                    <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Status</label>
                          <select aria-label="Status da sessão" className="w-full p-3 bg-white rounded-xl text-xs font-bold border border-slate-100 outline-none" value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)}>
                            <option value="agendado">Agendado</option>
                            <option value="finalizado">Finalizado</option>
                            <option value="faltou">Faltou</option>
                          </select>
                        </div>

                        {/* Campos condicionais: somem se for 'faltou' */}
                        {novoStatus !== 'faltou' && (
                          <>
                            <div className="space-y-1 animate-in slide-in-from-top-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Valor</label>
                              <input type="number" aria-label="Valor da consulta" className="w-full p-3 bg-white rounded-xl text-xs font-bold border border-slate-100 outline-none" value={novoValor} onChange={(e) => setNovoValor(Number(e.target.value))} />
                            </div>
                            <div className="space-y-1 animate-in slide-in-from-top-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Pagamento</label>
                              <select aria-label="Forma de pagamento" className="w-full p-3 bg-white rounded-xl text-xs font-bold border border-slate-100 outline-none" value={novoPagamento} onChange={(e) => setNovoPagamento(e.target.value)}>
                                <option value="Pix">Pix</option>
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="Cartão">Cartão</option>
                                <option value="gratis">Gratuito</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditandoId(null)} className="px-6 py-2 text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                        <button onClick={() => salvarEdicao(item.id)} className="px-8 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-teal-600/20">Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-6 w-full">
                        <div className="text-center min-w-[100px] border-r border-slate-100 pr-6">
                          <p className="text-[10px] font-black text-teal-600 uppercase">{new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                          <p className="text-2xl font-black text-slate-800 leading-none my-1">{new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.data).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex-1">
                          <Link href={`/pacientes/perfil?id=${item.pacientes?.id}`} className="text-lg font-black text-slate-800 hover:text-teal-600 uppercase tracking-tight">{item.pacientes?.nome || 'Paciente'}</Link>
                          <div className="mt-2">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase border ${item.status === 'agendado' ? 'bg-blue-50 text-blue-600 border-blue-100' : item.status === 'finalizado' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{item.status}</span>
                          </div>                             
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => apagarSessao(item.id)} 
                          aria-label="Excluir agendamento" 
                          title="Excluir"
                          className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                        <button onClick={() => { setEditandoId(item.id); setNovoStatus(item.status); setNovoValor(item.valor_consulta); setNovoPagamento(item.forma_pagamento); }} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase">Ajustar</button>
                        <Link href={`/prontuario/detalhes?id=${item.pacientes?.id}`} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-600/20">Prontuário</Link>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-[40px]">
                <p className="text-slate-300 font-black text-2xl uppercase italic">Agenda vazia</p>
              </div>
            )}
          </div>
        </main>
        <footer className="p-4 text-center opacity-30 mt-auto text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">CS FISIOTERAPIA INTEGRAL</footer>
      </div>
    </div>
  );
}
