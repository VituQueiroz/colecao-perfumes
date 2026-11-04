'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PerfumeCard from '@/components/PerfumeCard';
import { usePerfumes } from '@/components/PerfumesProvider';
import { reais } from '@/lib/constantes';

const ORDENACOES = {
  nome_az: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
  nome_za: (a, b) => b.nome.localeCompare(a.nome, 'pt-BR'),
  preco_cresc: (a, b) => a.preco - b.preco,
  preco_desc: (a, b) => b.preco - a.preco,
  nota_cresc: (a, b) => a.nota - b.nota,
  nota_desc: (a, b) => b.nota - a.nota,
};

// Busca inteligente: todas as palavras digitadas precisam aparecer em algum campo.
function combina(p, termos) {
  const texto = [
    p.nome, p.marca, p.preco, p.volume_ml, p.ano, p.periodo, p.estacao, p.extras,
    ...p.ocasioes, ...p.notas,
  ].join(' ').toLowerCase();
  return termos.every((t) => texto.includes(t));
}

export default function ColecaoPage() {
  const router = useRouter();
  const perfumes = usePerfumes();
  const { carregado, colecao } = perfumes;

  const [filtro, setFiltro] = useState('');
  const [ordem, setOrdem] = useState('none');
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);
  const [expandidoId, setExpandidoId] = useState(null);
  const importarRef = useRef(null);

  const filtrados = useMemo(() => {
    const termos = filtro.toLowerCase().split(' ').filter(Boolean);
    return colecao.filter((p) => (!somenteFavoritos || p.favorito) && combina(p, termos));
  }, [colecao, filtro, somenteFavoritos]);

  const ordenados = useMemo(
    () => (ORDENACOES[ordem] ? [...filtrados].sort(ORDENACOES[ordem]) : filtrados),
    [filtrados, ordem]
  );

  const valorTotal = filtrados.reduce((t, p) => t + (parseFloat(p.preco) || 0), 0);

  const exportar = () => {
    if (!confirm('Deseja realmente exportar toda a coleção e lista de desejos?')) return;
    const blob = new Blob([JSON.stringify(perfumes.exportar(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colecao_completa.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importar = async (e) => {
    const arquivo = e.target.files[0];
    e.target.value = '';
    if (!arquivo) return;
    try {
      const qtd = await perfumes.importar(JSON.parse(await arquivo.text()));
      alert(`Importação concluída: ${qtd} perfume(s) adicionado(s).`);
    } catch {
      alert('Erro ao importar arquivo.');
    }
  };

  const duplicar = async (id) => {
    const copia = await perfumes.duplicar(id);
    router.push(`/editar/${copia.id}`);
  };

  const excluir = (id) => {
    if (confirm('Tem certeza que deseja excluir este perfume?')) perfumes.excluir(id);
  };

  return (
    <div className="d-flex justify-content-center w-100">
      <div className="col-12 col-md-10 col-xl-9">
        <div className="glass-box">
          <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
            <input
              className="form-control flex-grow-1"
              style={{ minWidth: 160, width: 'auto' }}
              placeholder="Buscar..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            <select className="form-control w-auto" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
              <option value="none">Ordenar</option>
              <option value="nome_az">Nome (A → Z)</option>
              <option value="nome_za">Nome (Z → A)</option>
              <option value="preco_cresc">Menor Preço</option>
              <option value="preco_desc">Maior Preço</option>
              <option value="nota_cresc">Menor Nota</option>
              <option value="nota_desc">Maior Nota</option>
            </select>
            <label className="form-check-label ms-1">
              <input
                className="form-check-input me-1"
                type="checkbox"
                checked={somenteFavoritos}
                onChange={(e) => setSomenteFavoritos(e.target.checked)}
              />
              Favoritos
            </label>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
            <div style={{ fontSize: '0.8rem' }}>
              <strong>Total:</strong> {filtrados.length} | <strong>Valor:</strong> {reais(valorTotal)}
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-light btn-sm" onClick={exportar}>
                <i className="fa-solid fa-download"></i> Exportar
              </button>
              <button className="btn btn-outline-light btn-sm" onClick={() => importarRef.current.click()}>
                <i className="fa-solid fa-upload"></i> Importar
              </button>
              <input ref={importarRef} type="file" accept=".json,application/json" className="d-none" onChange={importar} />
            </div>
          </div>

          {!carregado && <p className="text-center my-4">Carregando...</p>}

          {carregado && colecao.length === 0 && (
            <p className="text-center my-4">
              Sua coleção está vazia. Cadastre um perfume ou importe um backup JSON.
            </p>
          )}

          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 justify-content-center">
            {ordenados.map((p) => (
              <div className="col" key={p.id}>
                <PerfumeCard
                  perfume={p}
                  expandido={expandidoId === p.id}
                  onExpandir={() => setExpandidoId(expandidoId === p.id ? null : p.id)}
                  onFavorito={() => perfumes.alternarFavorito(p.id)}
                  onNota={(n) => perfumes.definirNota(p.id, n)}
                  onDuplicar={() => duplicar(p.id)}
                  onExcluir={() => excluir(p.id)}
                  onEditar={() => router.push(`/editar/${p.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
