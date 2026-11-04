'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadImagem from '@/components/UploadImagem';
import { usePerfumes } from '@/components/PerfumesProvider';
import { reais } from '@/lib/constantes';

const VAZIO = { nome: '', marca: '', preco: '', site: '', imagem_url: '' };

export default function DesejosPage() {
  const router = useRouter();
  const { carregado, desejos, buscar, salvar, excluir, moverParaColecao } = usePerfumes();
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);

  const campo = (nome) => (e) => setForm({ ...form, [nome]: e.target.value });

  const limpar = () => {
    setForm(VAZIO);
    setEditId(null);
  };

  // ESC → limpar e voltar para a lista
  useEffect(() => {
    const aoTeclar = (e) => e.key === 'Escape' && router.push('/');
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [router]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.marca || !form.preco || !form.imagem_url) {
      alert('Preencha todos os campos!');
      return;
    }
    const original = editId ? buscar(editId) : {};
    await salvar({ ...original, ...form, status: 'desejo' });
    limpar();
  };

  const editar = (p) => {
    setEditId(p.id);
    setForm({ nome: p.nome, marca: p.marca, preco: p.preco, site: p.site, imagem_url: p.imagem_url });
  };

  const mover = async (id) => {
    if (!confirm('Deseja mover este perfume para a sua coleção?')) return;
    await moverParaColecao(id);
    if (id === editId) limpar();
    alert('Movido para a coleção!');
  };

  const remover = async (id) => {
    if (!confirm('Tem certeza que deseja remover este perfume da lista de desejos?')) return;
    await excluir(id);
    if (id === editId) limpar();
  };

  return (
    <div className="row justify-content-center g-3">
      <div className="col-12 col-md-4 col-lg-3">
        <form className="glass-box" onSubmit={enviar}>
          <h2 style={{ fontSize: '1.1rem' }}>
            {editId ? 'Editar Desejo' : 'Adicionar à Lista de Desejos'}
          </h2>

          <label className="mt-2">Nome</label>
          <input className="form-control" value={form.nome} onChange={campo('nome')} />

          <label className="mt-2">Marca</label>
          <input className="form-control" value={form.marca} onChange={campo('marca')} />

          <label className="mt-2">Preço (R$)</label>
          <input className="form-control" type="number" step="0.01" value={form.preco} onChange={campo('preco')} />

          <label className="mt-2">Link de Compra</label>
          <input className="form-control" placeholder="https://..." value={form.site} onChange={campo('site')} />

          <UploadImagem valor={form.imagem_url} onChange={(v) => setForm({ ...form, imagem_url: v })} />

          <button type="submit" className="btn btn-primary w-100 mt-3">
            {editId ? 'Salvar Alterações' : 'Adicionar'}
          </button>
          {editId && (
            <button type="button" className="btn btn-secondary w-100 mt-2" onClick={limpar}>
              Cancelar edição
            </button>
          )}
        </form>
      </div>

      <div className="col-12 col-md-8 col-lg-6">
        <div className="glass-box">
          <h4>Itens na Lista de Desejos</h4>

          {!carregado && <p>Carregando...</p>}
          {carregado && desejos.length === 0 && <p>Nenhum perfume na lista de desejos ainda.</p>}

          <div className="row row-cols-2 row-cols-md-3 g-3 mt-1">
            {desejos.map((p) => (
              <div className="col" key={p.id}>
                <div className="perfume-card text-center h-100 d-flex flex-column">
                  <img src={p.imagem_url} alt={p.nome} className="perfume-img mb-2 mx-auto" />
                  <h5>{p.nome}</h5>
                  <p className="mb-1">{p.marca}</p>
                  <p><strong>{reais(p.preco)}</strong></p>
                  <div className="d-grid gap-1 mt-auto">
                    {p.site && (
                      <a href={p.site} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm">
                        <i className="fa-solid fa-cart-shopping"></i> Comprar
                      </a>
                    )}
                    <button className="btn btn-info btn-sm" onClick={() => editar(p)}>Editar</button>
                    <button className="btn btn-success btn-sm" onClick={() => mover(p.id)}>Mover para a Coleção</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remover(p.id)}>Remover</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
