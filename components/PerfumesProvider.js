'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { carregar, gravar, lerBackup, normalizar, novoId } from '@/lib/armazenamento';

const PerfumesContext = createContext(null);

// Guarda a lista de perfumes e oferece as ações (salvar, excluir, etc.).
// As ações são `async` de propósito: na Fase 2 elas passam a chamar o Supabase
// e as telas, que já usam `await`, continuam funcionando sem alteração.
export function PerfumesProvider({ children }) {
  const [perfumes, setPerfumes] = useState([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setPerfumes(carregar());
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) gravar(perfumes);
  }, [perfumes, carregado]);

  const alterar = (id, mudancas) =>
    setPerfumes((lista) => lista.map((p) => (p.id === id ? { ...p, ...mudancas } : p)));

  const acoes = {
    async salvar(perfume) {
      const final = normalizar(perfume);
      setPerfumes((lista) =>
        lista.some((p) => p.id === final.id)
          ? lista.map((p) => (p.id === final.id ? final : p))
          : [...lista, final]
      );
      return final;
    },

    async excluir(id) {
      setPerfumes((lista) => lista.filter((p) => p.id !== id));
    },

    async duplicar(id) {
      const original = perfumes.find((p) => p.id === id);
      const copia = { ...original, id: novoId(), favorito: false, created_at: new Date().toISOString() };
      setPerfumes((lista) => [...lista, copia]);
      return copia;
    },

    async alternarFavorito(id) {
      const p = perfumes.find((x) => x.id === id);
      alterar(id, { favorito: !p.favorito });
    },

    async definirNota(id, nota) {
      alterar(id, { nota });
    },

    async moverParaColecao(id) {
      alterar(id, { status: 'colecao' });
    },

    // Importa um backup JSON, ignorando perfumes já existentes (mesmo nome + marca + status).
    async importar(dados) {
      const chave = (p) => `${p.status}|${p.nome.toLowerCase()}|${p.marca.toLowerCase()}`;
      const existentes = new Set(perfumes.map(chave));
      const novos = lerBackup(dados).filter((p) => !existentes.has(chave(p)));
      setPerfumes((lista) => [...lista, ...novos]);
      return novos.length;
    },

    exportar() {
      return {
        colecao: perfumes.filter((p) => p.status === 'colecao'),
        wishlist: perfumes.filter((p) => p.status === 'desejo'),
      };
    },
  };

  const valor = {
    carregado,
    colecao: useMemo(() => perfumes.filter((p) => p.status === 'colecao'), [perfumes]),
    desejos: useMemo(() => perfumes.filter((p) => p.status === 'desejo'), [perfumes]),
    buscar: (id) => perfumes.find((p) => p.id === id),
    ...acoes,
  };

  return <PerfumesContext.Provider value={valor}>{children}</PerfumesContext.Provider>;
}

export function usePerfumes() {
  return useContext(PerfumesContext);
}
