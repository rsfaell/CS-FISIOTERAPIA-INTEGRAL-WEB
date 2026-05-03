'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProntuarioDetalhesClient from '@/components/ProntuarioDetalhesClient'

function DetalhesContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  if (!id) {
    return <div className="p-10 text-center font-black uppercase text-red-500">ID não encontrado</div>
  }

  return <ProntuarioDetalhesClient id={id} />
}

export default function ProntuarioDetalhesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center font-black text-teal-600 animate-pulse text-xs uppercase tracking-widest">Carregando Detalhes...</div>}>
      <DetalhesContent />
    </Suspense>
  )
}
