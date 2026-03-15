-- =========================================================
-- Fase 2.1: Permissões por módulo por usuário
-- =========================================================

ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS modules_allowed TEXT[] NULL;

COMMENT ON COLUMN public.user_roles.modules_allowed IS 'Lista de módulos que o usuário pode acessar. NULL ou vazio = herda todos os módulos do tenant';

CREATE INDEX IF NOT EXISTS idx_user_roles_modules_allowed_gin
ON public.user_roles
USING GIN (modules_allowed);

-- =========================================================
-- Fase 2.2: is_module_enabled considera tenant + usuário
-- Regra:
-- - módulo precisa estar habilitado no tenant (tenants.modules_enabled)
-- - se modules_allowed for NULL ou vazio -> herda tudo do tenant (permitido)
-- - se modules_allowed tiver valores -> precisa conter o módulo
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_module_enabled(p_user_id UUID, p_module TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_modules_enabled TEXT[];
  v_modules_allowed TEXT[];
BEGIN
  -- Buscar tenant_id e modules_allowed do usuário
  SELECT tenant_id, modules_allowed
    INTO v_tenant_id, v_modules_allowed
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;

  -- Sem tenant = sem módulo
  IF v_tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar módulos habilitados do tenant
  SELECT modules_enabled
    INTO v_modules_enabled
  FROM public.tenants
  WHERE id = v_tenant_id;

  -- Módulo precisa estar habilitado no tenant primeiro
  IF v_modules_enabled IS NULL OR NOT (p_module = ANY(v_modules_enabled)) THEN
    RETURN FALSE;
  END IF;

  -- NULL ou [] => herda do tenant (permite todos os módulos do tenant)
  IF v_modules_allowed IS NULL OR array_length(v_modules_allowed, 1) IS NULL OR array_length(v_modules_allowed, 1) = 0 THEN
    RETURN TRUE;
  END IF;

  -- Verificar se o módulo está na lista de permitidos do usuário
  RETURN (p_module = ANY(v_modules_allowed));
END;
$$;

-- Garantir permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.is_module_enabled(UUID, TEXT) TO authenticated;