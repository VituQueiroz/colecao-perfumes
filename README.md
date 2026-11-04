# Coleção de Perfumes

Site para cadastrar sua coleção de perfumes e sua lista de desejos.
Feito com [Next.js](https://nextjs.org) (React), Bootstrap e Font Awesome.

## Configurar o Supabase (uma vez)

1. No painel do Supabase, abra **SQL Editor**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
   Isso cria a tabela `perfumes`, as regras de segurança (RLS) e o bucket de imagens.
2. Em **Authentication → URL Configuration**, defina:
   - **Site URL**: o endereço do site na Vercel (ex.: `https://colecao-perfumes.vercel.app`)
   - **Redirect URLs**: o mesmo endereço + `/**`, e também `http://localhost:3000/**`

## Rodar no computador

Requer [Node.js](https://nodejs.org) LTS.

1. Copie `.env.example` para `.env.local` e preencha com a URL e a chave anon/publishable do projeto
   (Supabase → Project Settings → API).
2. Rode:

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Publicar na Vercel

Cadastre `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em
**Settings → Environment Variables** do projeto na Vercel e faça um novo deploy.

## Estrutura

```
app/
  layout.js          menu + cabeçalho comuns a todas as páginas
  page.js            /            grade da coleção (busca, ordenação, favoritos, exportar/importar)
  cadastro/page.js   /cadastro    novo perfume
  editar/[id]/       /editar/:id  edição de um perfume
  desejos/page.js    /desejos     lista de desejos
  nova-senha/        /nova-senha  aberta pelo link de "Esqueci a senha"
  globals.css        estilos (o antigo style.css)
components/
  PerfumesProvider   sessão de login + dados e ações (salvar, excluir, mover...)
  Login              entrar, criar conta, recuperar senha
  PerfumeForm, PerfumeCard, UploadImagem, Estrelas, Navbar
lib/
  supabase.js        cliente do Supabase
  perfumes.js        leitura/gravação no banco e envio das imagens ao Storage
  imagem.js          reduz e converte as imagens para WebP antes de enviar
  constantes.js      ocasiões, notas olfativas, cores dos badges
supabase/
  schema.sql         tabela, regras de segurança (RLS) e bucket de imagens
```

## Roteiro

- [x] **Fase 1** – migração de Vue 2 para Next.js
- [x] **Fase 2** – Supabase: login, banco de dados e imagens no Storage (cada pessoa vê a própria coleção);
      o botão Importar aceita o backup JSON do site antigo
- [ ] **Fase 3** – extras: estatísticas, "qual perfume usar hoje", PWA, link público
