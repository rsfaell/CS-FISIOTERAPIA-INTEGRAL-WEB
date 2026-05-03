import EvolucoesPacienteClient from '@/components/EvolucoesPacienteClient'

export const dynamicParams = false;

export async function generateStaticParams() {
  // Retornar um array vazio ou um ID fictício para satisfazer o build estático
  return [{ id: '1' }];
}

export default async function EvolucoesPaciente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EvolucoesPacienteClient id={id} />
}
