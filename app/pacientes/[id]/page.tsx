import ProntuarioPacienteClient from '@/components/ProntuarioPacienteClient'

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function ProntuarioPaciente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProntuarioPacienteClient id={id} />
}
