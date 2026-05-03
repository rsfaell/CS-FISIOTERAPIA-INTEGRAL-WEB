'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProntuarioPacienteClient from '@/components/ProntuarioPacienteClient'

function PerfilContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return <div className="p-10 text-center font-black uppercase text-red-500">ID do paciente não encontrado</div>
  }

  return <ProntuarioPacienteClient id={id} />
}

export default function PacientePerfilPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-black text-teal-600 animate-pulse text-xs uppercase tracking-widest">Carregando Perfil...</div>}>
      <PerfilContent />
    </Suspense>
  )
}
