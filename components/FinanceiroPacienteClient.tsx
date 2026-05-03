'use client'
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClients';
import Image from 'next/image';

interface Agendamento {
  id: string;
  data: string;
  status: string;
  status_sessao: string;
  valor_consulta: number | null;
  forma_pagamento: string | null;
  pacientes: { nome: string } | { nome: string }[] | null;
}

export default function FinanceiroPacienteClient({ id }: { id: string }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pacienteNome, setPacienteNome] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [itemParaEditar, setItemParaEditar] = useState<Agendamento | null>(null);
  const [formEdicao, setFormEdicao] = useState({ valor: '', status: '', forma_pagamento: '' });

  const carregarDados = useCallback(async () => {
    try {
      if (!id) return;
      setCarregando(true);

      const { data, error } = await supabase
        .from('agenda')
        .select(`
          id,
          data,
          status,
          status_sessao,
          valor_consulta,
          forma_pagamento,
          pacientes (nome)
        `)
        .eq('paciente_id', id)
        .order('data', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const sessoes = data as unknown as Agendamento[];
        setAgendamentos(sessoes);
        const nome = Array.isArray(sessoes[0].pacientes) ? sessoes[0].pacientes[0]?.nome : sessoes[0].pacientes?.nome;
        setPacienteNome(nome || 'Paciente');
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const abrirEdicao = (item: Agendamento) => {
    setItemParaEditar(item);
    setFormEdicao({
      valor: item.valor_consulta?.toString() || '0',
      status: item.status || 'agendado',
      forma_pagamento: item.forma_pagamento || ''
    });
  };

  async function salvarEdicao() {
    try {
      const eFalta = formEdicao.status === 'faltou';

      const { error } = await supabase
        .from('agenda')
        .update({
          status: formEdicao.status,
          status_sessao: eFalta ? 'faltou' : (formEdicao.status === 'finalizado' ? 'atendido' : 'agendado'),
          valor_consulta: eFalta ? 0 : parseFloat(formEdicao.valor.replace(',', '.')),
          forma_pagamento: eFalta ? null : (formEdicao.forma_pagamento || null)
        })
        .eq('id', itemParaEditar?.id);

      if (!error) {
        setItemParaEditar(null);
        carregarDados();
      } else {
        alert("Erro ao salvar: " + error.message);
      }
    } catch {
      alert("Erro ao processar valores.");
    }
  }

  const recebido = agendamentos.filter(a => a.status === 'finalizado').reduce((acc, curr) => acc + (Number(curr.valor_consulta) || 0), 0);
  const pendente = agendamentos.filter(a => a.status === 'agendado').reduce((acc, curr) => acc + (Number(curr.valor_consulta) || 0), 0);

  if (carregando) return <div className="flex h-screen items-center justify-center bg-white font-black text-teal-600 animate-pulse text-xs uppercase tracking-widest">Sincronizando...</div>;

  return (
    <div className="relative min-h-screen w-full bg-white text-slate-800 font-sans overflow-hidden p-6 md:p-12">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none grayscale">
        <Image src="/logocs.png" alt="" width={600} height={600} className="w-full max-w-3xl object-contain" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 leading-none">
              Histórico Financeiro
            </h1>
            <p className="text-teal-600 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">
              Paciente: {pacienteNome}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl text-center min-w-[140px] shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Recebido</p>
              <p className="text-xl font-black text-teal-600">R$ {recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl text-center min-w-[140px] shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pendente</p>
              <p className="text-xl font-black text-orange-500">R$ {pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </header>
        <main className="bg-white/80 backdrop-blur-md rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest pl-10">Data</th>
                <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Status / Pagamento</th>
                <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Valor</th>
                <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center pr-10">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {agendamentos.map((sessao) => (
                <tr key={sessao.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="p-6 pl-10">
                    <p className="text-sm font-black text-slate-700">{new Date(sessao.data).toLocaleDateString('pt-BR')}</p>
                    <p className="text-[10px] font-bold text-slate-400">
                      {new Date(sessao.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <span className={`w-fit text-[8px] font-black px-2 py-0.5 rounded-md uppercase border ${
                        sessao.status === 'finalizado' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                        sessao.status === 'faltou' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {sessao.status === 'finalizado' ? 'PAGO' : sessao.status === 'faltou' ? 'FALTOU' : 'PENDENTE'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {sessao.forma_pagamento || (sessao.status === 'faltou' ? 'SEM COBRANÇA' : 'NÃO DEFINIDO')}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <p className="text-sm font-black text-slate-800">
                      R$ {sessao.valor_consulta?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="p-6 text-center pr-10">
                    <button
                      onClick={() => abrirEdicao(sessao)}
                      className="bg-slate-100 text-slate-400 group-hover:bg-slate-800 group-hover:text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95"
                    >
                      Ajustar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
      {itemParaEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-slate-100 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-800 mb-6 italic">Ajustar Lançamento</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="modal-status" className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block tracking-widest">Status Financeiro</label>
                <select id="modal-status" title="Selecione o status do pagamento" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 outline-none uppercase text-xs focus:ring-2 focus:ring-teal-500/20" value={formEdicao.status} onChange={(e) => setFormEdicao({...formEdicao, status: e.target.value})}>
                  <option value="agendado">Pendente</option>
                  <option value="finalizado">Pago</option>
                  <option value="faltou">Faltou (Zerar Valor)</option>
                </select>
              </div>
              {formEdicao.status !== 'faltou' && (
                <>
                  <div>
                    <label htmlFor="modal-valor" className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block tracking-widest">Valor</label>
                    <input id="modal-valor" type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20" value={formEdicao.valor} onChange={(e) => setFormEdicao({...formEdicao, valor: e.target.value})} />
                  </div>
                  <div>
                    <label htmlFor="modal-pagamento" className="text-[9px] font-black uppercase text-slate-400 ml-2 mb-1 block tracking-widest">Método de Pagamento</label>
                    <select id="modal-pagamento" title="Selecione o método de pagamento" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 outline-none uppercase text-xs focus:ring-2 focus:ring-teal-500/20" value={formEdicao.forma_pagamento} onChange={(e) => setFormEdicao({...formEdicao, forma_pagamento: e.target.value})}>
                      <option value="">Selecione...</option>
                      <option value="pix">PIX</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_de_credito">Cartão de Crédito</option>
                      <option value="cartao_de_debito">Cartão de Débito</option>
                      <option value="gratis">Cortesia</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-10">
              <button onClick={() => setItemParaEditar(null)} className="p-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
              <button onClick={salvarEdicao} className="p-4 bg-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-teal-600/20 active:scale-95 transition-all">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
