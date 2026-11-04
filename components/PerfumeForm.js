'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadImagem from './UploadImagem';
import { usePerfumes } from './PerfumesProvider';
import { NOTAS_OLFATIVAS, OCASIOES } from '@/lib/constantes';

const VAZIO = {
  nome: '', marca: '', site: '', imagem_url: '', volume_ml: '', ano: '', preco: '',
  ocasioes: [], periodo: '', estacao: '', notas: [], extras: '',
};

function Acordeao({ titulo, children }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="accordion-item bg-transparent mt-2">
      <h2 className="accordion-header">
        <button
          type="button"
          className={'accordion-button' + (aberto ? '' : ' collapsed')}
          onClick={() => setAberto(!aberto)}
        >
          {titulo}
        </button>
      </h2>
      {aberto && <div className="accordion-body">{children}</div>}
    </div>
  );
}

function Checkboxes({ prefixo, opcoes, marcados, onChange }) {
  const alternar = (op) =>
    onChange(marcados.includes(op) ? marcados.filter((x) => x !== op) : [...marcados, op]);

  return opcoes.map((op) => (
    <div key={op} className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        id={`${prefixo}-${op}`}
        checked={marcados.includes(op)}
        onChange={() => alternar(op)}
      />
      <label className="form-check-label" htmlFor={`${prefixo}-${op}`}>{op}</label>
    </div>
  ));
}

// Formulário de cadastro e edição. Sem `inicial` = novo perfume.
export default function PerfumeForm({ inicial }) {
  const router = useRouter();
  const { salvar } = usePerfumes();
  const [form, setForm] = useState(inicial ? { ...VAZIO, ...inicial } : VAZIO);
  const editando = !!inicial;

  const campo = (nome) => (e) => setForm({ ...form, [nome]: e.target.value });

  const podeSalvar =
    form.nome && form.marca && form.imagem_url && form.volume_ml && form.preco && form.site;

  const temAlgo = Object.keys(VAZIO).some((k) =>
    Array.isArray(form[k]) ? form[k].length : form[k]
  );

  // ESC → cancelar e voltar para a lista
  useEffect(() => {
    const aoTeclar = (e) => e.key === 'Escape' && router.push('/');
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [router]);

  // ENTER dentro do formulário dispara o submit automaticamente
  const enviar = async (e) => {
    e.preventDefault();
    if (!podeSalvar) return;
    await salvar({ ...inicial, ...form, status: inicial?.status || 'colecao' });
    router.push('/');
  };

  return (
    <div className="d-flex justify-content-center w-100">
      <div className="col-12 col-md-5 col-lg-4">
        <form className="glass-box" onSubmit={enviar}>
          <h2 style={{ fontSize: '1.1rem' }}>{editando ? 'Editar Perfume' : 'Cadastrar Perfume'}</h2>

          <label className="mt-2">Nome <span className="obrigatorio">*</span></label>
          <input className="form-control" placeholder="Nome" value={form.nome} onChange={campo('nome')} autoFocus />

          <label className="mt-2">Marca <span className="obrigatorio">*</span></label>
          <input className="form-control" placeholder="Marca" value={form.marca} onChange={campo('marca')} />

          <label className="mt-2">Site fabricante <span className="obrigatorio">*</span></label>
          <input className="form-control" placeholder="https://..." value={form.site} onChange={campo('site')} />

          <UploadImagem valor={form.imagem_url} onChange={(v) => setForm({ ...form, imagem_url: v })} />

          <label className="mt-2">Volume (ml) <span className="obrigatorio">*</span></label>
          <input className="form-control" type="number" placeholder="Volume (ml)" value={form.volume_ml} onChange={campo('volume_ml')} />

          <label className="mt-2">Ano de lançamento</label>
          <input className="form-control" type="number" placeholder="Ano" value={form.ano} onChange={campo('ano')} />

          <label className="mt-2">Preço (R$) <span className="obrigatorio">*</span></label>
          <input className="form-control" type="number" step="0.01" placeholder="Preço (R$)" value={form.preco} onChange={campo('preco')} />

          <div className="accordion mt-3">
            <Acordeao titulo="Ocasiões">
              <Checkboxes prefixo="oc" opcoes={OCASIOES} marcados={form.ocasioes}
                onChange={(v) => setForm({ ...form, ocasioes: v })} />
            </Acordeao>

            <Acordeao titulo="Preferências">
              <select className="form-control mt-1" value={form.periodo} onChange={campo('periodo')}>
                <option value="" disabled>Dia ou Noite?</option>
                <option>Dia</option>
                <option>Noite</option>
              </select>
              <select className="form-control mt-1" value={form.estacao} onChange={campo('estacao')}>
                <option value="" disabled>Frio ou Calor?</option>
                <option>Frio</option>
                <option>Calor</option>
              </select>
            </Acordeao>

            <Acordeao titulo="Notas Olfativas">
              <Checkboxes prefixo="nota" opcoes={NOTAS_OLFATIVAS} marcados={form.notas}
                onChange={(v) => setForm({ ...form, notas: v })} />
            </Acordeao>
          </div>

          <h5 className="mt-3">Extras</h5>
          <input className="form-control" value={form.extras} onChange={campo('extras')} />

          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={!podeSalvar}>
            {editando ? 'Salvar Alterações' : 'Cadastrar Perfume'}
          </button>

          {temAlgo && (
            <button type="button" className="btn btn-secondary w-100 mt-2" onClick={() => router.push('/')}>
              Cancelar
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
