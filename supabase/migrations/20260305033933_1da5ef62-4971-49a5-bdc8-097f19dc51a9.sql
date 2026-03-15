
-- =============================================
-- HiperLoja — Fase 1: 11 tabelas com RLS
-- =============================================

-- 1. loja_area_secao — Área m2 por seção com versionamento
CREATE TABLE public.loja_area_secao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID NOT NULL,
  loja_nome TEXT NOT NULL,
  secao_nome TEXT NOT NULL,
  area_m2 NUMERIC NOT NULL CHECK (area_m2 > 0),
  vigencia_inicio DATE NOT NULL,
  vigencia_fim DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loja_area_secao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_area_secao FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 2. loja_rentabilidade_espaco_periodo
CREATE TABLE public.loja_rentabilidade_espaco_periodo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID NOT NULL,
  loja_nome TEXT NOT NULL,
  secao_nome TEXT NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  receita_secao NUMERIC NOT NULL DEFAULT 0,
  margem_secao NUMERIC NOT NULL DEFAULT 0,
  area_m2 NUMERIC NOT NULL DEFAULT 1,
  receita_por_m2 NUMERIC GENERATED ALWAYS AS (CASE WHEN area_m2 > 0 THEN receita_secao / area_m2 ELSE 0 END) STORED,
  margem_por_m2 NUMERIC GENERATED ALWAYS AS (CASE WHEN area_m2 > 0 THEN margem_secao / area_m2 ELSE 0 END) STORED,
  ipe NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loja_rentabilidade_espaco_periodo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_rentabilidade_espaco_periodo FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 3. loja_markup_meta
CREATE TABLE public.loja_markup_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID,
  secao_nome TEXT,
  categoria_nome TEXT,
  sku_id TEXT,
  markup_objetivo NUMERIC NOT NULL,
  tolerancia_pct NUMERIC NOT NULL DEFAULT 5,
  vigencia_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  vigencia_fim DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loja_markup_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_markup_meta FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 4. loja_historico_preco — Timeline imutável
CREATE TABLE public.loja_historico_preco (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID NOT NULL,
  loja_nome TEXT NOT NULL,
  sku_id TEXT NOT NULL,
  sku_nome TEXT NOT NULL,
  preco_venda NUMERIC NOT NULL,
  custo_unitario NUMERIC NOT NULL,
  markup_real NUMERIC GENERATED ALWAYS AS (CASE WHEN custo_unitario > 0 THEN ((preco_venda / custo_unitario) - 1) * 100 ELSE 0 END) STORED,
  margem_real NUMERIC GENERATED ALWAYS AS (CASE WHEN preco_venda > 0 THEN ((preco_venda - custo_unitario) / preco_venda) * 100 ELSE 0 END) STORED,
  vigencia_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  origem TEXT DEFAULT 'manual',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loja_historico_preco ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_historico_preco FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 5. loja_snapshot_precificacao
CREATE TABLE public.loja_snapshot_precificacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID NOT NULL,
  loja_nome TEXT NOT NULL,
  data_snapshot DATE NOT NULL DEFAULT CURRENT_DATE,
  total_skus INTEGER NOT NULL DEFAULT 0,
  skus_conformes INTEGER NOT NULL DEFAULT 0,
  skus_pac INTEGER NOT NULL DEFAULT 0,
  iap_percentual NUMERIC GENERATED ALWAYS AS (CASE WHEN total_skus > 0 THEN (skus_conformes::NUMERIC / total_skus) * 100 ELSE 0 END) STORED,
  impacto_financeiro_desvio NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loja_snapshot_precificacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_snapshot_precificacao FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 6. loja_registro_perda
CREATE TABLE public.loja_registro_perda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID NOT NULL,
  loja_nome TEXT NOT NULL,
  secao_nome TEXT NOT NULL,
  sku_id TEXT,
  sku_nome TEXT,
  tipo_perda TEXT NOT NULL CHECK (tipo_perda IN ('operacional', 'vencimento', 'furto_externo', 'furto_interno')),
  quantidade NUMERIC NOT NULL CHECK (quantidade > 0),
  custo_unitario NUMERIC NOT NULL,
  valor_perda NUMERIC GENERATED ALWAYS AS (quantidade * custo_unitario) STORED,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  reclassificavel_ate TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loja_registro_perda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_registro_perda FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 7. loja_consolidado_perda_periodo
CREATE TABLE public.loja_consolidado_perda_periodo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID NOT NULL,
  loja_nome TEXT NOT NULL,
  secao_nome TEXT,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  receita_liquida_periodo NUMERIC NOT NULL DEFAULT 0,
  total_perda NUMERIC NOT NULL DEFAULT 0,
  perda_operacional NUMERIC DEFAULT 0,
  perda_vencimento NUMERIC DEFAULT 0,
  perda_furto_externo NUMERIC DEFAULT 0,
  perda_furto_interno NUMERIC DEFAULT 0,
  ip_percentual NUMERIC GENERATED ALWAYS AS (CASE WHEN receita_liquida_periodo > 0 THEN (total_perda / receita_liquida_periodo) * 100 ELSE 0 END) STORED,
  desvio_padrao_diario NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loja_consolidado_perda_periodo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_consolidado_perda_periodo FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 8. loja_configuracao_ipc — Pesos do IPC (soma=1.0)
CREATE TABLE public.loja_configuracao_ipc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  kpi_nome TEXT NOT NULL,
  peso NUMERIC NOT NULL CHECK (peso >= 0 AND peso <= 1),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, kpi_nome)
);
ALTER TABLE public.loja_configuracao_ipc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_configuracao_ipc FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 9. loja_ipc_loja — IPC calculado por loja/período
CREATE TABLE public.loja_ipc_loja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID NOT NULL,
  loja_nome TEXT NOT NULL,
  periodo_referencia DATE NOT NULL,
  ipc_score NUMERIC NOT NULL DEFAULT 0,
  kpis_detalhados JSONB DEFAULT '{}',
  ranking_posicao INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loja_ipc_loja ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_ipc_loja FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 10. loja_alerta_loja
CREATE TABLE public.loja_alerta_loja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID,
  loja_nome TEXT,
  codigo_alerta TEXT NOT NULL,
  nivel TEXT NOT NULL CHECK (nivel IN ('critico', 'alerta', 'info')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  kpi_nome TEXT,
  valor_atual NUMERIC,
  valor_limite NUMERIC,
  sla_horas INTEGER DEFAULT 24,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'reconhecido', 'resolvido', 'ignorado')),
  reconhecido_por UUID,
  reconhecido_em TIMESTAMPTZ,
  resolvido_por UUID,
  resolvido_em TIMESTAMPTZ,
  modulo_origem TEXT DEFAULT 'hiperloja',
  link_acao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loja_alerta_loja ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_alerta_loja FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 11. loja_configuracao_loja — Limites de alerta configuráveis
CREATE TABLE public.loja_configuracao_loja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  loja_id UUID NOT NULL,
  loja_nome TEXT NOT NULL,
  ip_limite_verde NUMERIC DEFAULT 1.5,
  ip_limite_amarelo NUMERIC DEFAULT 2.5,
  iap_limite_verde NUMERIC DEFAULT 85,
  iap_limite_amarelo NUMERIC DEFAULT 75,
  ipe_variacao_alerta NUMERIC DEFAULT 10,
  markup_tolerancia_pct NUMERIC DEFAULT 5,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, loja_id)
);
ALTER TABLE public.loja_configuracao_loja ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.loja_configuracao_loja FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Update is_page_allowed to support hiperloja
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
  ELSIF p_page_path LIKE '%/hipercliente%' THEN v_module_key := 'hipercliente';
  ELSIF p_page_path LIKE '%/hipercompras%' THEN v_module_key := 'hipercompras';
  ELSIF p_page_path LIKE '%/hiperfinanceiro%' THEN v_module_key := 'hiperfinanceiro';
  ELSIF p_page_path LIKE '%/hiperloja%' THEN v_module_key := 'hiperloja';
  ELSE RETURN TRUE;
  END IF;

  IF NOT v_pages_allowed ? v_module_key THEN RETURN TRUE; END IF;
  v_module_pages := v_pages_allowed -> v_module_key;
  IF v_module_pages IS NULL OR v_module_pages = 'null'::JSONB THEN RETURN TRUE; END IF;
  IF jsonb_array_length(v_module_pages) = 0 THEN RETURN FALSE; END IF;
  RETURN v_module_pages ? p_page_path;
END;
$function$;
