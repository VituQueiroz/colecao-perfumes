'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import PerfumeForm from '@/components/PerfumeForm';
import { usePerfumes } from '@/components/PerfumesProvider';

export default function EditarPage() {
  const { id } = useParams();
  const { carregado, buscar } = usePerfumes();

  if (!carregado) return <p className="text-center">Carregando...</p>;

  const perfume = buscar(id);
  if (!perfume) {
    return (
      <div className="glass-box text-center mx-auto" style={{ maxWidth: 400 }}>
        <p>Perfume não encontrado.</p>
        <Link href="/" className="btn btn-secondary btn-sm">Voltar para a lista</Link>
      </div>
    );
  }

  return <PerfumeForm key={id} inicial={perfume} />;
}
