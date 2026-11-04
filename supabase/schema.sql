-- =====================================================================
-- Coleção de Perfumes: estrutura do banco no Supabase
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em "Run".
-- Pode ser executado mais de uma vez sem problema.
-- =====================================================================

-- ---------- Tabela ----------
-- Coleção e lista de desejos ficam na mesma tabela, separadas por `status`.
create table if not exists public.perfumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  status      text not null default 'colecao' check (status in ('colecao', 'desejo')),
  nome        text not null,
  marca       text not null,
  imagem_url  text,
  volume_ml   int,
  ano         int,
  preco       numeric(10, 2),
  ocasioes    text[] not null default '{}',
  periodo     text check (periodo in ('Dia', 'Noite')),
  estacao     text check (estacao in ('Frio', 'Calor')),
  notas       text[] not null default '{}',
  extras      text,
  site        text,
  nota        smallint not null default 0 check (nota between 0 and 5),
  favorito    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists perfumes_user_id_idx on public.perfumes (user_id);

-- ---------- Segurança: cada pessoa só vê e altera os próprios perfumes ----------
alter table public.perfumes enable row level security;

drop policy if exists "ver os meus"     on public.perfumes;
drop policy if exists "inserir os meus" on public.perfumes;
drop policy if exists "editar os meus"  on public.perfumes;
drop policy if exists "apagar os meus"  on public.perfumes;

create policy "ver os meus" on public.perfumes
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "inserir os meus" on public.perfumes
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "editar os meus" on public.perfumes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "apagar os meus" on public.perfumes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- Imagens (Storage) ----------
-- Bucket público para leitura; cada pessoa só grava na pasta com o próprio id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('perfumes', 'perfumes', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

drop policy if exists "perfumes: ver a propria pasta"     on storage.objects;
drop policy if exists "perfumes: enviar na propria pasta" on storage.objects;
drop policy if exists "perfumes: apagar da propria pasta" on storage.objects;

-- Necessária para apagar: o Storage só remove arquivos que o usuário consegue "ver".
-- (A exibição das imagens no site não depende disso, pois o bucket é público.)
create policy "perfumes: ver a propria pasta" on storage.objects
  for select to authenticated
  using (bucket_id = 'perfumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "perfumes: enviar na propria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'perfumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "perfumes: apagar da propria pasta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'perfumes' and (storage.foldername(name))[1] = (select auth.uid())::text);
