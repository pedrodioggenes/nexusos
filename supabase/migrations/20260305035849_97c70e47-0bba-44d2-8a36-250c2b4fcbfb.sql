
-- =====================================================
-- HiperLoja — Fase 4: Business Rules (RPCs & Triggers)
-- Fixed column names based on actual schema
-- =====================================================

-- 1. R-06: Imutabilidade do HistoricoPreco
CREATE OR REPLACE FUNCTION public.loja_protect_historico_preco()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Registros de histórico de preço são imutáveis e não podem ser excluídos.';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Registros de histórico de preço são imutáveis e não podem ser alterados.';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_loja_protect_historico_preco
  BEFORE UPDATE OR DELETE ON public.loja_historico_preco
  FOR EACH ROW EXECUTE FUNCTION public.loja_protect_historico_preco();

-- 2. R-09: Custo imutável no registro de perda
CREATE OR REPLACE FUNCTION public.loja_protect_perda_custo()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.custo_unitario IS DISTINCT FROM OLD.custo_unitario THEN
      RAISE EXCEPTION 'O custo unitário de um registro de perda é imutável após criação.';
    END IF;
    IF NEW.valor_perda IS DISTINCT FROM OLD.valor_perda THEN
      RAISE EXCEPTION 'O valor da perda é imutável após criação.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_loja_protect_perda_custo
  BEFORE UPDATE ON public.loja_registro_perda
  FOR EACH ROW EXECUTE FUNCTION public.loja_protect_perda_custo();

-- 3. R-01: Buscar área vigente de uma seção em uma data
CREATE OR REPLACE FUNCTION public.loja_get_area_vigente(
  p_tenant_id uuid, p_loja_id uuid, p_secao_nome text, p_data date DEFAULT CURRENT_DATE
)
 RETURNS numeric
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT area_m2
  FROM public.loja_area_secao
  WHERE tenant_id = p_tenant_id
    AND loja_id = p_loja_id
    AND secao_nome = p_secao_nome
    AND vigencia_inicio <= p_data
    AND (vigencia_fim IS NULL OR vigencia_fim >= p_data)
  ORDER BY vigencia_inicio DESC
  LIMIT 1;
$function$;

-- 4. R-05: Detectar SKUs PAC (preço abaixo do custo)
CREATE OR REPLACE FUNCTION public.loja_detectar_pac(
  p_tenant_id uuid, p_loja_id uuid DEFAULT NULL
)
 RETURNS TABLE(
   sku_id text, sku_nome text, loja_id uuid, loja_nome text,
   preco_venda numeric, custo_unitario numeric, markup_real numeric, impacto numeric
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (hp.sku_id, hp.loja_id)
    hp.sku_id, hp.sku_nome, hp.loja_id, hp.loja_nome,
    hp.preco_venda, hp.custo_unitario, hp.markup_real,
    ROUND(hp.preco_venda - hp.custo_unitario, 2) AS impacto
  FROM public.loja_historico_preco hp
  WHERE hp.tenant_id = p_tenant_id
    AND (p_loja_id IS NULL OR hp.loja_id = p_loja_id)
    AND hp.preco_venda < hp.custo_unitario
  ORDER BY hp.sku_id, hp.loja_id, hp.vigencia_inicio DESC;
END;
$function$;

-- 5. R-07: Hierarquia de MarkupMeta
CREATE OR REPLACE FUNCTION public.loja_get_markup_meta(
  p_tenant_id uuid, p_loja_id uuid, p_categoria text, p_sku_id text DEFAULT NULL
)
 RETURNS TABLE(markup_objetivo numeric, tolerancia_pct numeric, fonte text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- P1: SKU + loja
  IF p_sku_id IS NOT NULL THEN
    RETURN QUERY
    SELECT mm.markup_objetivo, mm.tolerancia_pct, 'sku_loja'::text
    FROM public.loja_markup_meta mm
    WHERE mm.tenant_id = p_tenant_id AND mm.loja_id = p_loja_id
      AND mm.sku_id = p_sku_id
      AND (mm.vigencia_fim IS NULL OR mm.vigencia_fim >= CURRENT_DATE)
    ORDER BY mm.vigencia_inicio DESC LIMIT 1;
    IF FOUND THEN RETURN; END IF;
  END IF;
  -- P2: SKU any loja
  IF p_sku_id IS NOT NULL THEN
    RETURN QUERY
    SELECT mm.markup_objetivo, mm.tolerancia_pct, 'sku'::text
    FROM public.loja_markup_meta mm
    WHERE mm.tenant_id = p_tenant_id AND mm.loja_id IS NULL
      AND mm.sku_id = p_sku_id
      AND (mm.vigencia_fim IS NULL OR mm.vigencia_fim >= CURRENT_DATE)
    ORDER BY mm.vigencia_inicio DESC LIMIT 1;
    IF FOUND THEN RETURN; END IF;
  END IF;
  -- P3: categoria + loja
  RETURN QUERY
  SELECT mm.markup_objetivo, mm.tolerancia_pct, 'categoria_loja'::text
  FROM public.loja_markup_meta mm
  WHERE mm.tenant_id = p_tenant_id AND mm.loja_id = p_loja_id
    AND mm.categoria_nome = p_categoria AND mm.sku_id IS NULL
    AND (mm.vigencia_fim IS NULL OR mm.vigencia_fim >= CURRENT_DATE)
  ORDER BY mm.vigencia_inicio DESC LIMIT 1;
  IF FOUND THEN RETURN; END IF;
  -- P4: categoria only
  RETURN QUERY
  SELECT mm.markup_objetivo, mm.tolerancia_pct, 'categoria'::text
  FROM public.loja_markup_meta mm
  WHERE mm.tenant_id = p_tenant_id AND mm.loja_id IS NULL
    AND mm.categoria_nome = p_categoria AND mm.sku_id IS NULL
    AND (mm.vigencia_fim IS NULL OR mm.vigencia_fim >= CURRENT_DATE)
  ORDER BY mm.vigencia_inicio DESC LIMIT 1;
END;
$function$;

-- 6. R-15/R-16: Criar alerta sem duplicar
CREATE OR REPLACE FUNCTION public.loja_criar_alerta(
  p_tenant_id uuid, p_loja_id uuid, p_codigo text, p_nivel text,
  p_titulo text, p_descricao text, p_kpi_nome text,
  p_valor_atual numeric DEFAULT NULL, p_valor_limite numeric DEFAULT NULL,
  p_sla_horas integer DEFAULT 24
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  SELECT id INTO v_existing_id
  FROM public.loja_alerta_loja
  WHERE tenant_id = p_tenant_id AND loja_id = p_loja_id
    AND codigo_alerta = p_codigo AND status IN ('aberto', 'reconhecido')
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.loja_alerta_loja
    SET valor_atual = COALESCE(p_valor_atual, valor_atual), updated_at = now()
    WHERE id = v_existing_id;
    RETURN v_existing_id;
  END IF;

  INSERT INTO public.loja_alerta_loja (
    tenant_id, loja_id, codigo_alerta, nivel, titulo, descricao,
    kpi_nome, valor_atual, valor_limite, sla_horas, status, modulo_origem, link_acao
  ) VALUES (
    p_tenant_id, p_loja_id, p_codigo, p_nivel, p_titulo, p_descricao,
    p_kpi_nome, p_valor_atual, p_valor_limite, p_sla_horas, 'aberto',
    'hiperloja', '/hipersenna/hiperloja/alertas'
  ) RETURNING id INTO v_new_id;
  RETURN v_new_id;
END;
$function$;

-- 7. R-17: Escalonamento por SLA vencido
CREATE OR REPLACE FUNCTION public.loja_escalonar_alertas_vencidos(p_tenant_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_count INTEGER := 0;
BEGIN
  UPDATE public.loja_alerta_loja
  SET nivel = CASE WHEN nivel = 'aviso' THEN 'alerta' WHEN nivel = 'alerta' THEN 'critico' ELSE nivel END,
      updated_at = now()
  WHERE tenant_id = p_tenant_id
    AND status IN ('aberto', 'reconhecido')
    AND nivel != 'critico'
    AND created_at + (sla_horas * interval '1 hour') < now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$;

-- 8. Auto-set tenant_id on loja tables
CREATE OR REPLACE FUNCTION public.loja_set_tenant()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := get_user_tenant_id(auth.uid());
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_loja_area_secao_tenant BEFORE INSERT ON public.loja_area_secao FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_markup_meta_tenant BEFORE INSERT ON public.loja_markup_meta FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_historico_preco_tenant BEFORE INSERT ON public.loja_historico_preco FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_registro_perda_tenant BEFORE INSERT ON public.loja_registro_perda FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_alerta_loja_tenant BEFORE INSERT ON public.loja_alerta_loja FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_configuracao_loja_tenant BEFORE INSERT ON public.loja_configuracao_loja FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_configuracao_ipc_tenant BEFORE INSERT ON public.loja_configuracao_ipc FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_rentabilidade_tenant BEFORE INSERT ON public.loja_rentabilidade_espaco_periodo FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_snapshot_tenant BEFORE INSERT ON public.loja_snapshot_precificacao FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_consolidado_perda_tenant BEFORE INSERT ON public.loja_consolidado_perda_periodo FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();
CREATE TRIGGER trg_loja_ipc_loja_tenant BEFORE INSERT ON public.loja_ipc_loja FOR EACH ROW EXECUTE FUNCTION public.loja_set_tenant();

-- 9. R-10: Auto-classificar perda por divergência de inventário como furto_externo
CREATE OR REPLACE FUNCTION public.loja_classificar_perda_inventario()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.tipo_perda = 'inventario' AND (NEW.tipo_perda IS NULL OR NEW.tipo_perda = '') THEN
    NEW.tipo_perda := 'furto_externo';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_loja_classificar_perda
  BEFORE INSERT ON public.loja_registro_perda
  FOR EACH ROW EXECUTE FUNCTION public.loja_classificar_perda_inventario();

-- 10. Update is_page_allowed to include hiperloja
CREATE OR REPLACE FUNCTION public.is_page_allowed(p_user_id uuid, p_page_path text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_pages_allowed JSONB;
  v_module_key TEXT;
  v_module_pages JSONB;
BEGIN
  SELECT pages_allowed INTO v_pages_allowed
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_pages_allowed IS NULL THEN
    RETURN TRUE;
  END IF;

  IF p_page_path LIKE '%/hipergestao%' THEN v_module_key := 'hipergestao';
  ELSIF p_page_path LIKE '%/hipertrade%' THEN v_module_key := 'hipertrade';
  ELSIF p_page_path LIKE '%/hiperofertas%' THEN v_module_key := 'hiperofertas';
  ELSIF p_page_path LIKE '%/hiperia%' THEN v_module_key := 'hiperia';
  ELSIF p_page_path LIKE '%/hiperpmo%' THEN v_module_key := 'hiperpmo';
  ELSIF p_page_path LIKE '%/hipercd%' THEN v_module_key := 'hipercd';
  ELSIF p_page_path LIKE '%/hipercompras%' THEN v_module_key := 'hipercompras';
  ELSIF p_page_path LIKE '%/hipercliente%' THEN v_module_key := 'hipercliente';
  ELSIF p_page_path LIKE '%/hipertech%' THEN v_module_key := 'hipertech';
  ELSIF p_page_path LIKE '%/hiperacademy%' THEN v_module_key := 'hiperacademy';
  ELSIF p_page_path LIKE '%/hiperworks%' THEN v_module_key := 'hiperworks';
  ELSIF p_page_path LIKE '%/hiperrh%' THEN v_module_key := 'hiperrh';
  ELSIF p_page_path LIKE '%/hiperfinanceiro%' THEN v_module_key := 'hiperfinanceiro';
  ELSIF p_page_path LIKE '%/hiperloja%' THEN v_module_key := 'hiperloja';
  ELSE
    RETURN TRUE;
  END IF;

  v_module_pages := v_pages_allowed -> v_module_key;

  IF v_module_pages IS NULL THEN
    RETURN TRUE;
  END IF;

  IF v_module_pages = '"all"'::JSONB THEN
    RETURN TRUE;
  END IF;

  IF jsonb_typeof(v_module_pages) = 'array' THEN
    RETURN EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(v_module_pages) AS page
      WHERE p_page_path LIKE '%' || page || '%'
    );
  END IF;

  RETURN TRUE;
END;
$function$;
