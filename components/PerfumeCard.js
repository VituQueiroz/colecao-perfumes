'use client';

import Estrelas from './Estrelas';
import { corNota, corOcasiao, reais } from '@/lib/constantes';

export default function PerfumeCard({
  perfume: p, expandido, onExpandir, onFavorito, onNota, onDuplicar, onExcluir, onEditar,
}) {
  const parar = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className="card-wrap">
      <div className="perfume-card" onClick={onExpandir}>
        {!expandido && (
          <>
            <div className="favorite" onClick={parar(onFavorito)}>
              <i className={`${p.favorito ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
            </div>
            <div className="text-center">
              <img src={p.imagem_url} alt={p.nome} className="perfume-img mb-2" />
              <h5>{p.nome}</h5>
              <p className="mb-1"><strong>{reais(p.preco)}</strong></p>
              <Estrelas nota={p.nota} onChange={onNota} />
            </div>
          </>
        )}

        {expandido && (
          <div className="collapse-content show">
            {p.site && (
              <a
                href={p.site}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm position-absolute top-0 end-0 mt-1 me-1"
                title="Comprar"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fa-solid fa-cart-shopping"></i>
              </a>
            )}
            <p><strong>Marca:</strong> {p.marca}</p>
            <p><strong>Volume:</strong> {p.volume_ml} ml</p>
            <p><strong>Ano:</strong> {p.ano}</p>
            <p><strong>Dia/Noite:</strong> {p.periodo}</p>
            <p><strong>Estação:</strong> {p.estacao}</p>
            <p>
              <strong>Ocasiões:</strong><br />
              {p.ocasioes.map((o) => (
                <span key={o} className={`badge badge-oc bg-${corOcasiao(o)}`}>{o}</span>
              ))}
            </p>
            <p>
              <strong>Notas:</strong><br />
              {p.notas.map((n) => (
                <span key={n} className={`badge badge-nota bg-${corNota(n)}`}>{n}</span>
              ))}
            </p>
            {p.extras && (
              <p>
                <strong>Extras:</strong><br />
                <span className="badge badge-cat">{p.extras}</span>
              </p>
            )}
          </div>
        )}

        <div className="button-row">
          <button className="btn btn-info btn-sm" onClick={parar(onDuplicar)}>Duplicar</button>
          <button className="btn btn-danger btn-sm" onClick={parar(onExcluir)}>Excluir</button>
          <button className="btn btn-success btn-sm" onClick={parar(onEditar)}>Editar</button>
        </div>
      </div>
    </div>
  );
}
