import FinanceiroPacienteClient from '@/components/FinanceiroPacienteClient'

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ id: '1' }];
}

export default async function FinanceiroPaciente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FinanceiroPacienteClient id={id} />
}
