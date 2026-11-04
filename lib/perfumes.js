// Acesso aos dados no Supabase. As telas não usam este arquivo diretamente:
// elas chamam as ações do PerfumesProvider, que usa estas funções.
//
// Não é preciso filtrar por usuário em nenhuma consulta: as regras de RLS do banco
// (supabase/schema.sql) já garantem que cada pessoa só enxerga os próprios perfumes.

import { supabase, BUCKET } from './supabase';
import { comprimirImagem, dataUrlParaBlob, ehDataUrl } from './imagem';

export const novoId = () => crypto.randomUUID();

// Converte um perfume no formato antigo (site Vue / backup JSON) ou novo para o formato atual.
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
  };
}

// Do banco para a tela: campos nulos viram '' para os inputs controlados do React.
function daLinha(linha) {
  const p = normalizar(linha);
  for (const k of ['imagem_url', 'volume_ml', 'ano', 'preco', 'periodo', 'estacao', 'extras', 'site']) {
    if (p[k] === null) p[k] = '';
  }
  return { ...p, created_at: linha.created_at };
}

// Da tela para o banco: textos vazios viram null e números são convertidos.
function paraLinha(p) {
  const n = normalizar(p);
  const numero = (v, inteiro) => {
    const x = inteiro ? parseInt(v, 10) : parseFloat(v);
    return isNaN(x) ? null : x;
  };
  const texto = (v) => (String(v ?? '').trim() === '' ? null : String(v).trim());

  return {
    id: n.id,
    status: n.status,
    nome: n.nome.trim(),
    marca: n.marca.trim(),
    imagem_url: texto(n.imagem_url),
    volume_ml: numero(n.volume_ml, true),
    ano: numero(n.ano, true),
    preco: numero(n.preco, false),
    ocasioes: n.ocasioes,
    periodo: texto(n.periodo),
    estacao: texto(n.estacao),
    notas: n.notas,
    extras: texto(n.extras),
    site: texto(n.site),
    nota: n.nota,
    favorito: n.favorito,
  };
}

// ---------- Imagens ----------

// Se a imagem ainda é um data URL (acabou de ser escolhida/colada ou veio de um backup),
// comprime, envia ao Storage e devolve a URL pública. Se já é uma URL, devolve como está.
async function garantirImagemNoStorage(imagem, userId) {
  if (!ehDataUrl(imagem)) return imagem;

  let blob = await dataUrlParaBlob(imagem);
  if (blob.type !== 'image/webp') blob = await dataUrlParaBlob(await comprimirImagem(blob));

  const caminho = `${userId}/${novoId()}.webp`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, blob, { contentType: 'image/webp', cacheControl: '31536000' });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
}

// Caminho do arquivo dentro do bucket, a partir da URL pública (ou null se não for nosso).
function caminhoNoStorage(url) {
  const marcador = `/storage/v1/object/public/${BUCKET}/`;
  const i = (url || '').indexOf(marcador);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marcador.length));
}

export async function apagarImagem(url) {
  const caminho = caminhoNoStorage(url);
  if (caminho) await supabase.storage.from(BUCKET).remove([caminho]);
}

// ---------- Perfumes ----------

export async function listar() {
  const { data, error } = await supabase
    .from('perfumes')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(daLinha);
}

// Insere ou atualiza (pelo id).
export async function gravar(perfume, userId) {
  const linha = paraLinha(perfume);
  linha.imagem_url = await garantirImagemNoStorage(linha.imagem_url, userId);

  const { data, error } = await supabase.from('perfumes').upsert(linha).select().single();
  if (error) throw error;
  return daLinha(data);
}

export async function gravarVarios(perfumes, userId) {
  const linhas = [];
  for (const p of perfumes) {
    const linha = paraLinha(p);
    linha.imagem_url = await garantirImagemNoStorage(linha.imagem_url, userId);
    linhas.push(linha);
  }
  const { data, error } = await supabase.from('perfumes').insert(linhas).select();
  if (error) throw error;
  return data.map(daLinha);
}

export async function atualizar(id, mudancas) {
  const { data, error } = await supabase.from('perfumes').update(mudancas).eq('id', id).select().single();
  if (error) throw error;
  return daLinha(data);
}

export async function remover(id) {
  const { error } = await supabase.from('perfumes').delete().eq('id', id);
  if (error) throw error;
}

// Lê um backup JSON (do site antigo ou do novo) e devolve a lista normalizada, com ids novos.
export function lerBackup(dados) {
  return [
    ...(dados.colecao || []).map((p) => normalizar({ ...p, id: undefined }, 'colecao')),
    ...(dados.wishlist || []).map((p) => normalizar({ ...p, id: undefined }, 'desejo')),
  ];
}
