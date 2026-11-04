'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Página aberta pelo link de "Esqueci a senha". O link já deixa a pessoa logada;
// aqui ela só define a senha nova.
export default function NovaSenhaPage() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const enviar = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) return setErro(error.message);
    alert('Senha alterada!');
    router.push('/');
  };

  return (
    <form className="glass-box mx-auto" style={{ maxWidth: 380 }} onSubmit={enviar}>
      <h2 style={{ fontSize: '1.1rem' }}>Definir nova senha</h2>
      <label className="mt-2">Nova senha</label>
      <input
        className="form-control"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        autoFocus
      />
      {erro && <div className="alert alert-danger mt-3 mb-0 py-2">{erro}</div>}
      <button type="submit" className="btn btn-primary w-100 mt-3">Salvar senha</button>
    </form>
  );
}
