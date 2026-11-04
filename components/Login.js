'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const TITULOS = {
  entrar: 'Entrar',
  criar: 'Criar conta',
  esqueci: 'Recuperar senha',
};

const ERROS = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).',
  'User already registered': 'Este e-mail já tem conta. Use "Entrar".',
};

export default function Login() {
  const [modo, setModo] = useState('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'success' | 'danger', texto }

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensagem(null);

    const origem = window.location.origin;
    let resultado;

    if (modo === 'entrar') {
      resultado = await supabase.auth.signInWithPassword({ email, password: senha });
    } else if (modo === 'criar') {
      resultado = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: origem },
      });
      if (!resultado.error && !resultado.data.session) {
        setMensagem({ tipo: 'success', texto: 'Conta criada! Abra o link enviado para o seu e-mail para ativá-la.' });
      }
    } else {
      resultado = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origem}/nova-senha` });
      if (!resultado.error) {
        setMensagem({ tipo: 'success', texto: 'Se o e-mail tiver conta, você vai receber um link para criar uma nova senha.' });
      }
    }

    if (resultado.error) {
      setMensagem({ tipo: 'danger', texto: ERROS[resultado.error.message] || resultado.error.message });
    }
    setEnviando(false);
  };

  const trocarModo = (m) => {
    setModo(m);
    setMensagem(null);
  };

  return (
    <div className="container py-5">
      <header className="text-center mb-3">
        <h1 style={{ fontSize: '1.6rem' }}>
          <i className="fa-solid fa-spray-can-sparkles"></i> Minha Coleção de Perfumes
        </h1>
      </header>

      <form className="glass-box mx-auto" style={{ maxWidth: 380 }} onSubmit={enviar}>
        <h2 style={{ fontSize: '1.1rem' }}>{TITULOS[modo]}</h2>

        <label className="mt-2">E-mail</label>
        <input
          className="form-control"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        {modo !== 'esqueci' && (
          <>
            <label className="mt-2">Senha</label>
            <input
              className="form-control"
              type="password"
              autoComplete={modo === 'criar' ? 'new-password' : 'current-password'}
              minLength={6}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </>
        )}

        {mensagem && (
          <div className={`alert alert-${mensagem.tipo} mt-3 mb-0 py-2`} style={{ fontSize: '0.85rem' }}>
            {mensagem.texto}
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100 mt-3" disabled={enviando}>
          {enviando ? 'Aguarde...' : TITULOS[modo]}
        </button>

        <div className="d-flex justify-content-between mt-3" style={{ fontSize: '0.8rem' }}>
          {modo === 'entrar' ? (
            <>
              <a href="#" onClick={(e) => { e.preventDefault(); trocarModo('criar'); }}>Criar conta</a>
              <a href="#" onClick={(e) => { e.preventDefault(); trocarModo('esqueci'); }}>Esqueci a senha</a>
            </>
          ) : (
            <a href="#" onClick={(e) => { e.preventDefault(); trocarModo('entrar'); }}>Já tenho conta</a>
          )}
        </div>
      </form>
    </div>
  );
}
