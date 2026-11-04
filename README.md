# Coleção de Perfumes

Site para cadastrar sua coleção de perfumes e sua lista de desejos.
Feito com [Next.js](https://nextjs.org) (React), Bootstrap e Font Awesome.

## Rodar no computador

Requer [Node.js](https://nodejs.org) LTS.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Estrutura

```
app/
  layout.js          menu + cabeçalho comuns a todas as páginas
  page.js            /            grade da coleção (busca, ordenação, favoritos, exportar/importar)
  cadastro/page.js   /cadastro    novo perfume
  editar/[id]/       /editar/:id  edição de um perfume
  desejos/page.js    /desejos     lista de desejos
  globals.css        estilos (o antigo style.css)
components/
  PerfumesProvider   guarda os dados e as ações (salvar, excluir, mover...)
  PerfumeForm, PerfumeCard, UploadImagem, Estrelas, Navbar
lib/
  armazenamento.js   onde os dados são lidos/gravados (hoje: localStorage)
  imagem.js          reduz e converte as imagens para WebP antes de salvar
  constantes.js      ocasiões, notas olfativas, cores dos badges
```

## Roteiro

- [x] **Fase 1** – migração de Vue 2 para Next.js, dados ainda no navegador
- [ ] **Fase 2** – Supabase: login e banco de dados (cada pessoa vê a própria coleção)
- [ ] **Fase 3** – imagens no Supabase Storage + importação do backup JSON antigo
- [ ] **Fase 4** – extras: estatísticas, "qual perfume usar hoje", PWA, link público
