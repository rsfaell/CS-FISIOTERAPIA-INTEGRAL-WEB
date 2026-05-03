'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClients';

type FiltroPeriodo = 'dia' | 'semana' | 'mes' | 'ano';

export default function FinanceiroCompleto() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState<FiltroPeriodo>('mes');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [metricas, setMetricas] = useState({ recebido: 0, previsto: 0, total: 0 });
  
  // Novo estado para controlar o detalhamento
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoPagamento, setNovoPagamento] = useState('');

  // Agrupamento por tipo de pagamento
  const totaisPorTipo = agendamentos
    .filter(item => item.status === 'finalizado')
    .reduce((acc: any, item) => {
      const tipo = item.forma_pagamento || 'não definido';
      acc[tipo] = (acc[tipo] || 0) + (Number(item.valor_consulta) || 0);
      return acc;
    }, {});

  async function carregarDados() {
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
      .order('data', { ascending: false });

    if (!error && data) {
      setAgendamentos(data);
      const recebido = data.filter(i => i.status === 'finalizado').reduce((acc, item) => acc + (Number(item.valor_consulta) || 0), 0);
      const previsto = data.filter(i => i.status === 'agendado').reduce((acc, item) => acc + (Number(item.valor_consulta) || 0), 0);
      setMetricas({ recebido, previsto, total: recebido + previsto });
    }
    setCarregando(false);
  }

  async function salvarEdicao(id: string) {
    const eFalta = novoStatus === 'faltou';
    const eGratis = novoPagamento === 'gratis';
    const valorFinal = (eFalta || eGratis) ? 0 : Number(novoValor);
    
    const { error } = await supabase
      .from('agenda')
      .update({ 
        status: novoStatus, 
        valor_consulta: valorFinal, 
        forma_pagamento: eFalta ? 'faltou' : novoPagamento 
      })
      .eq('id', id);

    if (!error) { setEditandoId(null); carregarDados(); }
  }

  useEffect(() => { carregarDados(); }, [periodo, dataSelecionada]);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-sans bg-white">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-10 select-none opacity-[0.08]">
        <img src="/logocs.png" alt="" className="w-full max-w-2xl grayscale object-contain" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <header className="w-full p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50 bg-white/80 backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Financeiro</h1>
            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-[0.3em] mt-1">Gestão</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <nav className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {(['dia', 'semana', 'mes', 'ano'] as FiltroPeriodo[]).map((p) => (
                <button 
                  key={p} 
                  onClick={() => setPeriodo(p)} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${periodo === p ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {p === 'mes' ? 'MÊS' : p}
                </button>
              ))}
            </nav>
            <input type="date" aria-label="Data selecionada" className="p-2.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 bg-white text-xs font-black uppercase text-slate-600" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-100 px-5 py-3 rounded-[25px] border border-slate-200 text-center min-w-[120px]">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recebido</p>
              <p className="text-lg font-black text-teal-600 leading-none">R$ {metricas.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            
            <button 
              onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
              className="bg-teal-600 px-5 py-3 rounded-[25px] shadow-lg shadow-teal-600/20 text-center min-w-[140px] hover:bg-teal-700 transition-all flex flex-col items-center group"
            >
              <p className="text-[8px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                Total Geral
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-2.5 h-2.5 transition-transform duration-300 ${mostrarDetalhes ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
              </p>
              <p className="text-lg font-black text-white leading-none">R$ {metricas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </button>
          </div>
        </header>

        {/* PAINEL DE DETALHES EM CASCATA */}
        {mostrarDetalhes && (
          <div className="w-full bg-slate-50/50 border-b border-slate-100 p-6 animate-in slide-in-from-top duration-300 overflow-hidden">
            <div className="max-w-5xl mx-auto flex flex-wrap gap-4">
              {Object.keys(totaisPorTipo).length > 0 ? (
                Object.entries(totaisPorTipo).map(([tipo, valor]: [any, any]) => (
                  <div key={tipo} className="bg-white border border-slate-100 px-6 py-4 rounded-[22px] flex items-center gap-4 min-w-[180px] shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">{tipo.replace(/_/g, ' ')}</p>
                      <p className="text-sm font-black text-slate-700">R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mx-auto">Nenhum pagamento finalizado no período</p>
              )}
            </div>
          </div>
        )}

        <main className="flex-1 p-6 overflow-y-auto">
          {/* ... resto do seu código de agendamentos permanece idêntico ... */}
          <div className="max-w-5xl mx-auto space-y-4">
            {carregando ? (
              <div className="flex justify-center py-20 text-teal-600 animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando...</div>
            ) : agendamentos.map((item) => (
              <div key={item.id} className="bg-white/60 backdrop-blur-md border border-slate-100 p-5 rounded-[30px] shadow-sm hover:shadow-md transition-all duration-300">
                {editandoId === item.id ? (
                  <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Status</label>
                        <select aria-label="Status" className="w-full p-3 bg-white rounded-xl text-xs font-bold border border-slate-100 outline-none" value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)}>
                          <option value="agendado">Agendado</option>
                          <option value="finalizado">Finalizado</option>
                          <option value="faltou">Faltou</option>
                        </select>
                      </div>
                      {novoStatus !== 'faltou' && (
                        <>
                          <div className="space-y-1 animate-in slide-in-from-top-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Pagamento</label>
                            <select aria-label="Pagamento" className="w-full p-3 bg-white rounded-xl text-xs font-bold border border-slate-100 outline-none" value={novoPagamento} onChange={(e) => setNovoPagamento(e.target.value)}>
                              <option value="pix">Pix</option>
                              <option value="dinheiro">Dinheiro</option>
                              <option value="cartao_de_credito">Cartão de Crédito</option>
                              <option value="cartao_de_debito">Cartão de Débito</option>
                              <option value="gratis">Cortesia</option>
                            </select>
                          </div>
                          {novoPagamento !== 'gratis' && (
                            <div className="space-y-1 animate-in slide-in-from-top-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Valor</label>
                              <input type="number" aria-label="Valor" className="w-full p-3 bg-white rounded-xl text-xs font-bold border border-slate-100 outline-none" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditandoId(null)} className="px-6 py-2 text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                      <button onClick={() => salvarEdicao(item.id)} className="px-8 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Salvar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-6 w-full">
                      <div className="text-center min-w-[100px] border-r border-slate-100 pr-6">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-tighter">{new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                        <p className="text-2xl font-black text-slate-800 leading-none my-1 tracking-tighter">{new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{item.pacientes?.nome}</h2>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${item.status === 'finalizado' ? 'bg-teal-50/50 text-teal-600 border-teal-100' : item.status === 'faltou' ? 'bg-red-50/50 text-red-600 border-red-100' : 'bg-blue-50/50 text-blue-600 border-blue-100'}`}>{item.status}</span>
                          <span className="text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border bg-slate-50 text-slate-400 border-slate-100">
                            {item.forma_pagamento === 'faltou' || !item.forma_pagamento ? '---' : (item.forma_pagamento === 'gratis' ? 'Cortesia' : item.forma_pagamento)}
                          </span>
                        </div>                             
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-right pr-4 border-r border-slate-100 hidden sm:block">
                        <p className={`text-xl font-black tracking-tighter ${item.status === 'faltou' || item.forma_pagamento === 'gratis' ? 'text-slate-300 line-through opacity-60' : 'text-slate-800'}`}>
                          R$ {Number(item.valor_consulta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <button onClick={() => { setEditandoId(item.id); setNovoStatus(item.status); setNovoValor(item.valor_consulta); setNovoPagamento(item.forma_pagamento); }} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all active:scale-95">Ajustar</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
        
        <footer className="p-4 text-center opacity-30 mt-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">CS FISIOTERAPIA INTEGRAL</p>
        </footer>
      </div>
    </div>
  );
}