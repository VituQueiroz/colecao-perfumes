'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePerfumes } from './PerfumesProvider';

const LINKS = [
  { href: '/', icone: 'fa-table-cells', texto: 'Lista' },
  { href: '/cadastro', icone: 'fa-plus', texto: 'Cadastro' },
  { href: '/desejos', icone: 'fa-star', texto: 'Lista de Desejos' },
];

export default function Navbar() {
  const caminho = usePathname();
  const { usuario, sair } = usePerfumes();

  return (
    <nav className="navbar navbar-dark bg-dark mb-3 rounded shadow p-2">
      <div className="container-fluid">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={'navbar-brand' + (caminho === l.href ? ' ativo' : '')}
          >
            <i className={`fa-solid ${l.icone}`}></i> {l.texto}
          </Link>
        ))}

        <div className="d-flex align-items-center gap-2 ms-auto">
          <span className="text-secondary d-none d-md-inline" style={{ fontSize: '0.8rem' }}>
            {usuario.email}
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={sair} title="Sair">
            <i className="fa-solid fa-right-from-bracket"></i> Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
