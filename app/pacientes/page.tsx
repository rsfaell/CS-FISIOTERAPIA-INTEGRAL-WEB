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

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  
  // Estados para o Modal de Novo Registro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoCpf, setNovoCpf] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');

  const carregarPacientes = useCallback(async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome, cpf, telefone')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      setPacientes((data as unknown as Paciente[]) || []);
    } catch (err) {
      const error = err as Error;
      console.error("Erro ao carregar lista:", error.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  async function handleSalvarPaciente(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('pacientes')
        .insert([{ 
          nome: novoNome, 
          cpf: novoCpf, 
          telefone: novoTelefone 
        }]);

      if (error) throw error;

      setNovoNome('');
      setNovoCpf('');
      setNovoTelefone('');
      setIsModalOpen(false);
      carregarPacientes(); 
    } catch (err) {
      const error = err as Error;
      alert("Erro ao cadastrar: " + error.message);
    }
  }

  useEffect(() => { carregarPacientes(); }, [carregarPacientes]);

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    p.cpf?.includes(busca)
  );

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col font-sans bg-white">
      
      {/* MARCA D'ÁGUA PADRONIZADA */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-10 select-none">
        <Image 
          src="/logocs.png" 
          alt="" 
          width={600}
          height={600}
          className="w-full max-w-2xl opacity-[0.08] grayscale object-contain"
        />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        
        {/* HEADER COM BUSCA E BOTÃO */}
        <header className="w-full p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50 bg-white/80 backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Pacientes</h1>
            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-[0.3em]">Gestão de Prontuários</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <label htmlFor="busca-paciente" className="sr-only">Buscar paciente</label>
              <input 
                id="busca-paciente"
                type="text"
                placeholder="BUSCAR NOME OU CPF..."
                title="Digite o nome ou CPF para filtrar"
                className="w-full p-3.5 pl-5 rounded-2xl bg-white border border-slate-200 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-600/20 hover:bg-teal-700 active:scale-95 transition-all"
            >
              + Novo
            </button>
          </div>
        </header>

        {/* ÁREA DE LISTAGEM */}
        <main className="flex-1 p-6 overflow-y-auto">
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-20 text-teal-600 animate-pulse">
              <p className="font-black uppercase text-xs tracking-[0.4em]">Sincronizando Pacientes...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
              {pacientesFiltrados.map((p) => (
                <Link 
                  key={p.id} 
                  href={`/pacientes/perfil?id=${p.id}`}
                  className="group relative bg-white/60 backdrop-blur-md p-6 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                      {p.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 truncate">
                      <h2 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight truncate">{p.nome}</h2>
                      <p className="text-[9px] text-teal-600 font-bold uppercase tracking-widest">Ativo</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 border-t border-slate-50 pt-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CPF: {p.cpf}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TEL: {p.telefone}</p>
                  </div>

                  {/* Detalhe visual de hover */}
                  <div className="absolute bottom-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-teal-600 text-xs">➔</span>
                  </div>
                </Link>
              ))}

              {pacientesFiltrados.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white/40 backdrop-blur-sm border-2 border-dashed border-slate-100 rounded-[40px]">
                  <p className="text-slate-300 font-black text-2xl uppercase tracking-tighter">Nenhum paciente encontrado</p>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="p-4 text-center opacity-30 mt-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">CS FISIOTERAPIA INTEGRAL</p>
        </footer>
      </div>

      {/* MODAL DE CADASTRO (DESIGN GLASS) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[45px] p-10 shadow-2xl border border-slate-100">
            <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Novo Registro</h2>
            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mb-8">Cadastro de Paciente</p>
            
            <form onSubmit={handleSalvarPaciente} className="space-y-5">
              <div>
                <label htmlFor="nome" className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Nome Completo</label>
                <input 
                  id="nome" required type="text" placeholder="EX: JOÃO DA SILVA"
                  title="Digite o nome completo"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  value={novoNome} onChange={e => setNovoNome(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cpf" className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">CPF</label>
                  <input 
                    id="cpf" required type="text" placeholder="000.000.000-00"
                    title="Digite o CPF"
                    className="w-full p-4 rounded-2xl bg-slate-50 border-none text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    value={novoCpf} onChange={e => setNovoCpf(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="telefone" className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-2 tracking-widest">Telefone</label>
                  <input 
                    id="telefone" required type="text" placeholder="(00) 00000-0000"
                    title="Digite o telefone"
                    className="w-full p-4 rounded-2xl bg-slate-50 border-none text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    value={novoTelefone} onChange={e => setNovoTelefone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
                >
                  Gravar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}