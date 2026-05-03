import ProntuarioPacienteClient from '@/components/ProntuarioPacienteClient';

export default async function ProntuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  return <ProntuarioPacienteClient id={resolvedParams.id} />;
}