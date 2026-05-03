'use client'
import { useEffect, useState, use, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClients';
import Link from 'next/link';
import Image from 'next/image';

interface Pagamento {
  valor_consulta: number;
  data: string;
  forma_pagamento: string;
  status: string;
}

export default function FinanceiroDetalhado({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;

  const [paciente, setPaciente] = useState<{ nome: string } | null>(null);
  const [metricas, setMetricas] = useState({ dia: 0, semana: 0, mes: 0, ano: 0 });
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [carregando, setCarregando] = useState(true);

  const calcularPeriodos = useCallback((dados: Pagamento[]) => {
    const hoje = new Date();
    const totais = { dia: 0, semana: 0, mes: 0, ano: 0 };

    dados.forEach(s => {
      const dataSessao = new Date(s.data);
      const valor = Number(s.valor_consulta) || 0;

      // Por Dia
      if (dataSessao.toDateString() === hoje.toDateString()) totais.dia += valor;
      
      // Por Mês
      if (dataSessao.getMonth() === hoje.getMonth() && dataSessao.getFullYear() === hoje.getFullYear()) totais.mes += valor;

      // Por Ano
      if (dataSessao.getFullYear() === hoje.getFullYear()) totais.ano += valor;

      // Por Semana (últimos 7 dias)
      const diffTime = Math.abs(hoje.getTime() - dataSessao.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) totais.semana += valor;
    });

    setMetricas(totais);
  }, []);

  const carregarFinanceiro = useCallback(async () => {
    try {
      setCarregando(true);
      if (!id) return;
      // Dados do Paciente
      const { data: p } = await supabase.from('pacientes').select('nome').eq('id', id).single();
      if (p) setPaciente(p);

      // Dados da Agenda (Financeiro)
      const { data: sessoes } = await supabase
        .from('agenda')
        .select('valor_consulta, data, forma_pagamento, status')
        .eq('paciente_id', id)
        .eq('status', 'finalizado');

      if (sessoes) {
        const pagamentosData = sessoes as Pagamento[];
        setPagamentos(pagamentosData);
        calcularPeriodos(pagamentosData);
      }
    } finally { setCarregando(false); }
  }, [id, calcularPeriodos]);

  useEffect(() => { carregarFinanceiro(); }, [carregarFinanceiro]);

  if (carregando) return <div className="flex h-screen items-center justify-center bg-white font-black text-teal-600 animate-pulse text-xs uppercase tracking-widest">Calculando Rendimentos...</div>;

  return (
    <div className="relative min-h-screen bg-slate-50/30 overflow-hidden flex flex-col font-sans">
      {/* LOGO BACKGROUND */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-10 opacity-[0.05] grayscale">
        <Image src="/logocs.png" alt="" width={600} height={600} className="w-full max-w-2xl object-contain" />
      </div>

      <div className="relative z-10">
        <header className="p-8 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 shadow-sm">
          <div className="flex items-center gap-6">
            <Link href={`/paciente/${id}`} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-800 leading-none">{paciente?.nome}</h1>
              <p className="text-[9px] text-teal-600 font-bold uppercase tracking-[0.3em] mt-2">Relatório Financeiro</p>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-8 w-full">
          {/* CARDS DE PERÍODO */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Hoje', valor: metricas.dia },
              { label: 'Esta Semana', valor: metricas.semana },
              { label: 'Este Mês', valor: metricas.mes },
              { label: 'Este Ano', valor: metricas.ano },
            ].map((item, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-md p-6 rounded-[30px] border border-slate-100 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">R$ {item.valor.toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* LISTAGEM POR TIPO DE PAGAMENTO */}
          <section className="bg-white/80 backdrop-blur-md rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Histórico de Recebimentos</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Data</th>
                  <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest">Método</th>
                  <th className="p-6 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((pag, index) => (
                  <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <td className="p-6 text-[11px] font-bold text-slate-600">
                      {new Date(pag.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-6">
                      <span className="text-[9px] font-black px-3 py-1 bg-slate-100 rounded-lg uppercase text-slate-500">
                        {pag.forma_pagamento?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-6 text-[11px] font-black text-slate-800 text-right">
                      R$ {pag.valor_consulta?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}