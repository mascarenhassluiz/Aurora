
-- ==============================================================================
-- SETUP ROBUSTO DE AUTENTICAÇÃO E PERFIS - AURORA
-- ==============================================================================

-- 1. Garante que a tabela existe
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  subscription text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Ativa RLS
alter table public.profiles enable row level security;

-- 3. Limpa políticas antigas para evitar conflitos
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can view own profile" on profiles;

-- 4. Políticas de Segurança (Permite leitura pública básica, edição apenas pelo dono)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 5. TRIGGER AUTOMÁTICO (A MÁGICA ACONTECE AQUI)
-- Toda vez que um usuário é criado no Auth, essa função cria o perfil automaticamente.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, subscription)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'), 
    'free'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Remove a trigger se já existir para recriar
drop trigger if exists on_auth_user_created on auth.users;

-- Cria a trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. CORREÇÃO RETROATIVA
-- Se você já criou usuários que estão "travados" sem perfil, isso vai criar perfis para eles agora.
insert into public.profiles (id, email, name)
select id, email, coalesce(raw_user_meta_data->>'name', 'Usuário Recuperado')
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
