-- =========================================================
-- PHASE 3 — Storage accounting + quota reset + campaigns quota
-- =========================================================

-- 1) Consumir storage de forma atômica (e bloquear se estourar)
CREATE OR REPLACE FUNCTION public.consume_storage_bytes(
  p_tenant_id UUID,
  p_bytes BIGINT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quota RECORD;
  v_new_used BIGINT;
BEGIN
  IF p_bytes IS NULL OR p_bytes <= 0 THEN
    RETURN TRUE;
  END IF;

  -- Segurança: só sigma admin ou o próprio tenant
  IF NOT is_sigma_admin(auth.uid()) AND get_user_tenant_id(auth.uid()) <> p_tenant_id THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  SELECT * INTO v_quota
  FROM public.tenant_quotas
  WHERE tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.tenant_quotas (tenant_id)
    VALUES (p_tenant_id);

    SELECT * INTO v_quota
    FROM public.tenant_quotas
    WHERE tenant_id = p_tenant_id
    FOR UPDATE;
  END IF;

  v_new_used := COALESCE(v_quota.storage_used_bytes, 0) + p_bytes;

  IF v_new_used > COALESCE(v_quota.storage_limit_bytes, 0) THEN
    RETURN FALSE;
  END IF;

  UPDATE public.tenant_quotas
  SET storage_used_bytes = v_new_used,
      updated_at = now()
  WHERE tenant_id = p_tenant_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_storage_bytes(UUID, BIGINT) TO authenticated;


-- 2) Reset de quota (AI / Campaigns) para console
CREATE OR REPLACE FUNCTION public.admin_reset_quota(
  p_tenant_id UUID,
  p_quota_type TEXT -- 'ai_queries' | 'campaigns'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_sigma_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;

  IF p_quota_type = 'ai_queries' THEN
    UPDATE public.tenant_quotas
    SET ai_queries_used = 0,
        ai_queries_reset_at = date_trunc('month', now()) + interval '1 month',
        updated_at = now()
    WHERE tenant_id = p_tenant_id;
    RETURN TRUE;
  END IF;

  IF p_quota_type = 'campaigns' THEN
    UPDATE public.tenant_quotas
    SET campaigns_used = 0,
        campaigns_reset_at = date_trunc('month', now()) + interval '1 month',
        updated_at = now()
    WHERE tenant_id = p_tenant_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_reset_quota(UUID, TEXT) TO authenticated;


-- 3) Trigger: impedir criação de campanha se quota estourou
CREATE OR REPLACE FUNCTION public.enforce_campaign_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ok BOOLEAN;
BEGIN
  -- NEW.tenant_id precisa existir na tabela
  v_ok := public.check_quota(NEW.tenant_id, 'campaigns');

  IF NOT v_ok THEN
    RAISE EXCEPTION 'quota_limit_reached_campaigns';
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger na tabela marketing_campaigns
DROP TRIGGER IF EXISTS trg_enforce_campaign_quota ON public.marketing_campaigns;
CREATE TRIGGER trg_enforce_campaign_quota
BEFORE INSERT ON public.marketing_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.enforce_campaign_quota();