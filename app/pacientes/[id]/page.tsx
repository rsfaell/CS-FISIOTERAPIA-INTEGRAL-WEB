'use client'
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClients';
import Link from 'next/link';

export default function ProntuarioPaciente({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;

  const [paciente, setPaciente] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estados de Interface
  const [isAgendando, setIsAgendando] = useState(false);
  const [isEditandoPaciente, setIsEditandoPaciente] = useState(false);

  // Novos Agendamentos
  const [novaData, setNovaData] = useState('');
  const [novoValor, setNovoValor] = useState('100');
  const [novaFormaPagamento, setNovaFormaPagamento] = useState('pix');

  // Edição do Paciente
  const [editNome, setEditNome] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editTelefone, setEditTelefone] = useState('');

  // Edição na Timeline
  const [editandoSessaoId, setEditandoSessaoId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editValor, setEditValor] = useState('');
  const [editPagamento, setEditPagamento] = useState('');
  const [editEvolucao, setEditEvolucao] = useState('');

  async function carregarDados() {
    try {
      setCarregando(true);
      if (!id) return;
      const { data: p } = await supabase.from('pacientes').select('*').eq('id', id).single();
      if (p) {
        setPaciente(p);
        setEditNome(p.nome);
        setEditCpf(p.cpf || '');
        setEditTelefone(p.telefone || '');
      }
      const { data: sessoes } = await supabase.from('agenda').select('*').eq('paciente_id', id).order('data', { ascending: false });
      if (sessoes) setHistorico(sessoes);
    } catch (err) { console.error(err); } finally { setCarregando(false); }
  }

  async function salvarDadosPaciente(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('pacientes').update({
      nome: editNome, cpf: editCpf, telefone: editTelefone
    }).eq('id', id);
    if (!error) { setIsEditandoPaciente(false); carregarDados(); }
  }

  async function marcarSessao(e: React.FormEvent) {
    e.preventDefault();
    const valorFinal = novaFormaPagamento === 'gratis' ? 0 : Number(novoValor);
    const { error } = await supabase.from('agenda').insert([{
      paciente_id: id, data: novaData, valor_consulta: valorFinal, forma_pagamento: novaFormaPagamento, status: 'agendado'
    }]);
    if (!error) { setIsAgendando(false); setNovaData(''); carregarDados(); }
  }

  async function salvarAjuste(sessaoId: string) {
    const valorAjustado = editPagamento === 'gratis' ? 0 : Number(editValor);
    const { error } = await supabase.from('agenda').update({
      status: editStatus, valor_consulta: valorAjustado, forma_pagamento: editPagamento, evolucao: editEvolucao
    }).eq('id', sessaoId);
    if (!error) { setEditandoSessaoId(null); carregarDados(); }
  }

  async function excluirSessao(sessaoId: string) {
    if (!confirm("Excluir este agendamento permanentemente?")) return;
    const { error } = await supabase.from('agenda').delete().eq('id', sessaoId);
    if (!error) carregarDados();
  }

  useEffect(() => { carregarDados(); }, [id]);

  if (carregando) return <div className="flex h-screen items-center justify-center bg-white font-black text-teal-600 animate-pulse text-xs uppercase tracking-widest">Sincronizando...</div>;

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-sans bg-white text-slate-800">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-10 opacity-[0.07] grayscale select-none">
        <img src="/logocs.png" alt="" className="w-full max-w-2xl object-contain" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        <header className="w-full p-6 flex justify-between items-center border-b border-slate-50 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link href="/pacientes" className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">{paciente?.nome}</h1>
              <p className="text-[9px] text-teal-600 font-bold uppercase tracking-[0.3em] mt-1">Prontuário Digital</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col md:flex-row p-6 gap-6">
          <aside className="w-full md:w-80 space-y-4">
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[35px] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                 <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Informações</h3>
                 <button onClick={() => setIsEditandoPaciente(!isEditandoPaciente)} className="text-[8px] font-black text-slate-400 uppercase hover:text-teal-600 transition-colors">
                    {isEditandoPaciente ? 'Cancelar' : 'Ajustar'}
                 </button>
              </div>
              
              {isEditandoPaciente ? (
                <form onSubmit={salvarDadosPaciente} className="space-y-3 animate-in fade-in duration-300">
                  <input type="text" placeholder="Nome" className="w-full p-2 bg-slate-50 rounded-lg text-[10px] font-bold outline-none" value={editNome} onChange={e => setEditNome(e.target.value)} />
                  <input type="text" placeholder="CPF" className="w-full p-2 bg-slate-50 rounded-lg text-[10px] font-bold outline-none" value={editCpf} onChange={e => setEditCpf(e.target.value)} />
                  <input type="text" placeholder="Telefone" className="w-full p-2 bg-slate-50 rounded-lg text-[10px] font-bold outline-none" value={editTelefone} onChange={e => setEditTelefone(e.target.value)} />
                  <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-lg text-[9px] font-black uppercase">Salvar Dados</button>
                </form>
              ) : (
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CPF: <span className="text-slate-700 ml-1">{paciente?.cpf || '---'}</span></p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TEL: <span className="text-slate-700 ml-1">{paciente?.telefone || '---'}</span></p>
                </div>
              )}
            </div>

            <div className={`rounded-[35px] border transition-all duration-500 overflow-hidden ${isAgendando ? 'bg-white p-6 shadow-xl border-teal-100' : 'bg-teal-600 shadow-lg shadow-teal-600/20'}`}>
              {!isAgendando ? (
                <button onClick={() => setIsAgendando(true)} className="w-full py-5 text-white font-black text-[10px] uppercase tracking-widest text-center hover:bg-teal-700 transition-colors">
                  + Marcar Atendimento
                </button>
              ) : (
                <form onSubmit={marcarSessao} className="space-y-4 animate-in fade-in zoom-in duration-300">
                  <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Novo Registro</h3>
                  <label htmlFor="data-sessao" className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Data e Hora</label>
                  <input id="data-sessao" type="datetime-local" required className="w-full p-3 rounded-xl bg-slate-50 border-none text-[10px] font-bold outline-none" value={novaData} onChange={e => setNovaData(e.target.value)} />
                  <select className="w-full p-3 rounded-xl bg-slate-50 border-none text-[10px] font-bold outline-none" value={novaFormaPagamento} onChange={e => setNovaFormaPagamento(e.target.value)} aria-label="Forma de Pagamento">
                    <option value="pix">PIX</option><option value="dinheiro">Dinheiro</option><option value="cartao_de_credito">Cartão de Crédito</option><option value="cartao_de_debito">Cartão de Débito</option><option value="gratis">Cortesia</option>
                  </select>
                  {novaFormaPagamento !== 'gratis' && (
                    <input type="number" placeholder="Valor R$" className="w-full p-3 rounded-xl bg-slate-50 border-none text-[10px] font-bold" value={novoValor} onChange={e => setNovoValor(e.target.value)} />
                  )}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setIsAgendando(false)} className="flex-1 py-3 text-[9px] font-black uppercase text-slate-400">Voltar</button>
                    <button type="submit" className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Agendar</button>
                  </div>
                </form>
              )}
            </div>
          </aside>

          <section className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4 mb-2">Linha do Tempo</h3>
            {historico.map((sessao) => (
              <article key={sessao.id} className="bg-white/60 backdrop-blur-md p-6 rounded-[30px] border border-slate-100 shadow-sm hover:border-teal-200 transition-all duration-300">
                {editandoSessaoId === sessao.id ? (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-3 gap-3">
                      <select className="p-2 bg-slate-50 rounded-lg text-[10px] font-bold" value={editStatus} onChange={e => setEditStatus(e.target.value)} aria-label="Status da Sessão">
                        <option value="agendado">Agendado</option><option value="finalizado">Finalizado</option><option value="faltou">Faltou</option>
                      </select>
                      <select className="p-2 bg-slate-50 rounded-lg text-[10px] font-bold" value={editPagamento} onChange={e => setEditPagamento(e.target.value)} aria-label="Forma de Pagamento">
                        <option value="pix">PIX</option><option value="dinheiro">Dinheiro</option><option value="cartao_de_credito">Crédito</option><option value="gratis">Cortesia</option>
                      </select>
                      {editPagamento !== 'gratis' && <input type="number" placeholder="Valor R$" className="p-2 bg-slate-50 rounded-lg text-[10px] font-bold" value={editValor} onChange={e => setEditValor(e.target.value)} />}
                    </div>
                    <textarea 
                      className="w-full p-3 h-32 bg-slate-50 rounded-xl text-[10px] font-bold outline-none resize-none" 
                      placeholder="Evolução..."
                      value={editEvolucao}
                      onChange={e => setEditEvolucao(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditandoSessaoId(null)} className="text-[9px] font-black uppercase text-slate-400 px-4">Cancelar</button>
                      <button onClick={() => salvarAjuste(sessao.id)} className="bg-teal-600 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Salvar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-white px-3 py-1 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-black text-teal-600">{new Date(sessao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</p>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(sessao.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setEditandoSessaoId(sessao.id); setEditStatus(sessao.status); setEditValor(sessao.valor_consulta); setEditPagamento(sessao.forma_pagamento); setEditEvolucao(sessao.evolucao || ''); }} className="p-2 text-slate-300 hover:text-teal-600 transition-colors" title="Editar sessão">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                        </button>
                        <button type="button" onClick={() => excluirSessao(sessao.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Excluir agendamento">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase border ${sessao.status === 'finalizado' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>{sessao.status}</span>
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase bg-slate-50 text-slate-400 border border-slate-100">
                        {sessao.forma_pagamento === 'gratis' ? 'CORTESIA' : `R$ ${sessao.valor_consulta?.toFixed(2)} • ${sessao.forma_pagamento?.replace(/_/g, ' ').toUpperCase()}`}
                      </span>
                    </div>
                    <div className="p-4 bg-white/40 rounded-2xl border border-slate-50 italic text-xs text-slate-500 whitespace-pre-wrap">{sessao.evolucao || "Sem anotações de evolução."}</div>
                  </>
                )}
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}