// Camada de dados da Fase 1: tudo fica no localStorage do navegador.
// Na Fase 2 este arquivo é trocado por chamadas ao Supabase; as telas não mudam.
//
// O formato de cada perfume já espelha a futura tabela `perfumes` do Supabase:
// coleção e lista de desejos ficam na mesma lista, separadas pelo campo `status`.

const CHAVE = 'perfumes_v2';

export function novoId() {
  return crypto.randomUUID();
}

// Converte um perfume no formato antigo (site Vue) ou novo para o formato atual.
export function normalizar(p, statusPadrao = 'colecao') {
  return {
    id: p.id || novoId(),
    status: p.status || statusPadrao,
    nome: p.nome || '',
    marca: p.marca || '',
    imagem_url: p.imagem_url ?? p.imagem ?? '',
    volume_ml: p.volume_ml ?? p.volume ?? '',
    ano: p.ano ?? '',
    preco: p.preco ?? '',
    ocasioes: p.ocasioes ?? p['ocasiões'] ?? [],
    periodo: p.periodo ?? p.tempo ?? '',
    estacao: p.estacao ?? '',
    notas: p.notas ?? p.notasSelecionadas ?? [],
    extras: p.extras ?? '',
    site: p.site ?? '',
    nota: Number(p.nota) || 0,
    favorito: !!p.favorito,
    created_at: p.created_at || new Date().toISOString(),
  };
}

export function carregar() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo) return JSON.parse(salvo);

    // Primeira vez: aproveita dados do site antigo, se existirem neste navegador.
    const antigos = JSON.parse(localStorage.getItem('perfumes') || '[]');
    const desejos = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return [
      ...antigos.map((p) => normalizar(p, 'colecao')),
      ...desejos.map((p) => normalizar(p, 'desejo')),
    ];
  } catch {
    return [];
  }
}

export function gravar(perfumes) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(perfumes));
  } catch (erro) {
    if (erro?.name === 'QuotaExceededError') {
      alert('O armazenamento do navegador está cheio. Exporte sua coleção como backup.');
    }
  }
}

// Lê um backup JSON (do site antigo ou do novo) e devolve a lista normalizada.
export function lerBackup(dados) {
  return [
    ...(dados.colecao || []).map((p) => normalizar({ ...p, id: undefined }, 'colecao')),
    ...(dados.wishlist || []).map((p) => normalizar({ ...p, id: undefined }, 'desejo')),
  ];
}
