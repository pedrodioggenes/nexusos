-- Passo 2/2: atualiza registros e funções que usavam 'hiper_admin'

-- Migrar linhas existentes
UPDATE public.user_roles
SET user_type = 'nos_admin'
WHERE user_type = 'hiper_admin';

-- Atualizar is_araripe_admin para checar 'nos_admin'
CREATE OR REPLACE FUNCTION public.is_araripe_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND user_type = 'nos_admin'
  )
$$;

-- Manter is_sigma_admin como alias (backward compat com policies existentes)
CREATE OR REPLACE FUNCTION public.is_sigma_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_araripe_admin(_user_id)
$$;
