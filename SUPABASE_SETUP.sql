
-- ==============================================================================
-- CORREÇÃO DEFINITIVA DE PERMISSÕES (RLS) - AURORA APP
-- ==============================================================================
-- INSTRUÇÕES:
-- 1. Copie todo este conteúdo.
-- 2. No Supabase > SQL Editor > New Query.
-- 3. Cole e clique em RUN.
-- ==============================================================================

-- 1. Cria a tabela de perfis (se não existir)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  subscription text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ativa a segurança (RLS)
alter table public.profiles enable row level security;

-- 3. LIMPEZA: Remove políticas antigas para evitar o erro 42710 (Policy already exists)
-- Isso garante que o script funcione mesmo se você já tiver tentado antes.
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can view own profile" on profiles;

-- 4. CRIAÇÃO: Cria as políticas corretas
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 5. Permissões finais
grant all on table public.profiles to postgres;
grant all on table public.profiles to anon;
grant all on table public.profiles to authenticated;
grant all on table public.profiles to service_role;
