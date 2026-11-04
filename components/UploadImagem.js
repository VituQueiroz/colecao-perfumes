'use client';

import { useEffect, useRef } from 'react';
import { comprimirImagem } from '@/lib/imagem';

// Área de upload: clicar, arrastar e soltar, ou colar com CTRL+V em qualquer lugar da página.
export default function UploadImagem({ valor, onChange }) {
  const inputRef = useRef(null);

  const usarArquivo = async (arquivo) => {
    if (arquivo && arquivo.type.startsWith('image/')) {
      onChange(await comprimirImagem(arquivo));
    }
  };

  useEffect(() => {
    const aoColar = (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
      if (item) {
        e.preventDefault();
        usarArquivo(item.getAsFile());
      }
    };
    window.addEventListener('paste', aoColar);
    return () => window.removeEventListener('paste', aoColar);
  });

  return (
    <>
      <div
        className="upload-area mt-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          usarArquivo(e.dataTransfer.files[0]);
        }}
      >
        <p className="mb-1" style={{ fontSize: '0.8rem' }}>
          <span className="obrigatorio">*</span> Arraste a imagem aqui, clique para escolher ou use CTRL+V
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="d-none"
          onChange={(e) => usarArquivo(e.target.files[0])}
        />
        <div className="upload-box" onClick={() => inputRef.current.click()}>
          <i className="fa-solid fa-cloud-arrow-up fa-2x mb-2"></i>
          <p className="mb-0">Clique ou solte a imagem aqui</p>
        </div>
      </div>

      {valor && (
        <div className="mt-2">
          <div className="position-relative d-inline-block">
            <img src={valor} alt="Prévia" className="img-fluid rounded shadow" style={{ maxHeight: 120 }} />
            <span className="remover-imagem" onClick={() => onChange('')} title="Remover imagem">
              <i className="fa-solid fa-xmark"></i>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
