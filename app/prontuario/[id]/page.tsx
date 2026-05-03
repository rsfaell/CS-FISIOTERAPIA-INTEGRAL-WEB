import ProntuarioDetalhesClient from '@/components/ProntuarioDetalhesClient'

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function ProntuarioDetalhes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProntuarioDetalhesClient id={id} />
}
