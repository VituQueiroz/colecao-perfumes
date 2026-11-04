'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import * as db from '@/lib/perfumes';
import Login from './Login';

const PerfumesContext = createContext(null);

// Controla a sessão (login) e guarda a lista de perfumes do usuário logado.
// As telas usam apenas as ações daqui; quem fala com o Supabase é lib/perfumes.js.
export function PerfumesProvider({ children }) {
  const [sessao, setSessao] = useState(undefined); // undefined = ainda verificando
  const [perfumes, setPerfumes] = useState([]);
  const [carregado, setCarregado] = useState(false);

  const usuario = sessao?.user ?? null;

  // ---------- Sessão ----------
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSessao(data.session));
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => setSessao(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // ---------- Carrega os perfumes quando alguém entra ----------
  useEffect(() => {
    if (!usuario) {
      setPerfumes([]);
      setCarregado(false);
      return;
    }
    let ativo = true;
    db.listar()
      .then((lista) => ativo && setPerfumes(lista))
      .catch((e) => alert('Erro ao carregar perfumes: ' + e.message))
      .finally(() => ativo && setCarregado(true));
    return () => {
      ativo = false;
    };
  }, [usuario?.id]);

  const trocar = (atualizado) =>
    setPerfumes((lista) => lista.map((p) => (p.id === atualizado.id ? atualizado : p)));

  // Mostra o erro ao usuário e repassa para quem chamou.
  const comAviso = (fn) => async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      alert('Não foi possível salvar: ' + e.message);
      throw e;
    }
  };

  const acoes = {
    salvar: comAviso(async (perfume) => {
      const salvo = await db.gravar(perfume, usuario.id);
      setPerfumes((lista) =>
        lista.some((p) => p.id === salvo.id) ? lista.map((p) => (p.id === salvo.id ? salvo : p)) : [...lista, salvo]
      );
      // Se a imagem foi trocada, apaga a antiga do Storage (quando ninguém mais usa)
      const anterior = perfumes.find((p) => p.id === salvo.id);
      if (anterior && anterior.imagem_url !== salvo.imagem_url) apagarSeNinguemUsa(anterior.imagem_url, salvo.id);
      return salvo;
    }),

    excluir: comAviso(async (id) => {
      const alvo = perfumes.find((p) => p.id === id);
      await db.remover(id);
      setPerfumes((lista) => lista.filter((p) => p.id !== id));
      apagarSeNinguemUsa(alvo?.imagem_url, id);
    }),

    duplicar: comAviso(async (id) => {
      const original = perfumes.find((p) => p.id === id);
      const copia = await db.gravar({ ...original, id: db.novoId(), favorito: false }, usuario.id);
      setPerfumes((lista) => [...lista, copia]);
      return copia;
    }),

    alternarFavorito: comAviso(async (id) => {
      const p = perfumes.find((x) => x.id === id);
      trocar({ ...p, favorito: !p.favorito }); // atualiza a tela na hora
      trocar(await db.atualizar(id, { favorito: !p.favorito }));
    }),

    definirNota: comAviso(async (id, nota) => {
      const p = perfumes.find((x) => x.id === id);
      trocar({ ...p, nota });
      trocar(await db.atualizar(id, { nota }));
    }),

    moverParaColecao: comAviso(async (id) => {
      trocar(await db.atualizar(id, { status: 'colecao' }));
    }),

    // Importa um backup JSON, ignorando perfumes já existentes (mesmo nome + marca + status).
    importar: comAviso(async (dados) => {
      const chave = (p) => `${p.status}|${p.nome.toLowerCase()}|${p.marca.toLowerCase()}`;
      const existentes = new Set(perfumes.map(chave));
      const novos = db.lerBackup(dados).filter((p) => !existentes.has(chave(p)));
      if (novos.length === 0) return 0;
      const gravados = await db.gravarVarios(novos, usuario.id);
      setPerfumes((lista) => [...lista, ...gravados]);
      return gravados.length;
    }),

    exportar() {
      return {
        colecao: perfumes.filter((p) => p.status === 'colecao'),
        wishlist: perfumes.filter((p) => p.status === 'desejo'),
      };
    },

    sair: () => supabase.auth.signOut(),
  };

  function apagarSeNinguemUsa(url, exceto) {
    if (url && !perfumes.some((p) => p.id !== exceto && p.imagem_url === url)) {
      db.apagarImagem(url).catch(() => {});
    }
  }

  const colecao = useMemo(() => perfumes.filter((p) => p.status === 'colecao'), [perfumes]);
  const desejos = useMemo(() => perfumes.filter((p) => p.status === 'desejo'), [perfumes]);

  if (!supabase) {
    return (
      <div className="container py-5">
        <div className="glass-box mx-auto" style={{ maxWidth: 520 }}>
          <h2 style={{ fontSize: '1.1rem' }}>Supabase não configurado</h2>
          <p className="mb-0">
            Crie o arquivo <code>.env.local</code> a partir do <code>.env.example</code> com a URL e a chave do seu
            projeto Supabase e reinicie o servidor.
          </p>
        </div>
      </div>
    );
  }

  if (sessao === undefined) return <p className="text-center py-5">Carregando...</p>;
  if (!usuario) return <Login />;

  const valor = { usuario, carregado, colecao, desejos, buscar: (id) => perfumes.find((p) => p.id === id), ...acoes };

  return <PerfumesContext.Provider value={valor}>{children}</PerfumesContext.Provider>;
}

export function usePerfumes() {
  return useContext(PerfumesContext);
}
