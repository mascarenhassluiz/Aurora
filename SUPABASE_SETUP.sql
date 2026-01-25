
-- ==============================================================================
-- CORREÇÃO DE PERMISSÕES (RLS) - AURORA APP
-- ==============================================================================
-- INSTRUÇÕES:
-- 1. Copie todo este conteúdo.
-- 2. No Supabase > SQL Editor > New Query.
-- 3. Cole e clique em RUN.
-- ==============================================================================

-- 1. Garante que RLS (Segurança) está ativado na tabela
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remove políticas antigas para evitar conflitos (limpeza)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- 3. CRIA A POLÍTICA DE INSERÇÃO (Isso resolve o erro do cadastro)
-- Permite que o usuário insira seus próprios dados ao se cadastrar
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );

-- 4. CRIA A POLÍTICA DE LEITURA
-- Permite que o usuário veja seus próprios dados
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ( auth.uid() = id );

-- 5. CRIA A POLÍTICA DE ATUALIZAÇÃO
-- Permite que o usuário atualize seus dados (ex: mudar plano para Pro)
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- FIM DO SCRIPT
