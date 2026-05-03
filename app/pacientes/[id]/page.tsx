import ProntuarioPacienteClient from '@/components/ProntuarioPacienteClient';

export async function generateStaticParams() {
  // In a real static export, you would fetch all existing patient IDs from Supabase here.
  return []; 
}

export default async function ProntuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  return <ProntuarioPacienteClient id={resolvedParams.id} />;
}