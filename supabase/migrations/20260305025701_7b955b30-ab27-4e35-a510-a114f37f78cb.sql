
-- ============================================================
-- HiperFinanceiro Module — Core Tables
-- ============================================================

-- 1. fin_configuracao_financeira
CREATE TABLE public.fin_configuracao_financeira (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  aliquota_efetiva NUMERIC(5,2) DEFAULT 8.50,
  wacc NUMERIC(5,2) DEFAULT 12.00,
  limite_caixa_critico_dias INTEGER DEFAULT 15,
  moeda TEXT DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);
ALTER TABLE public.fin_configuracao_financeira ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_configuracao_financeira FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 2. fin_resultado_periodo (DRE)
CREATE TABLE public.fin_resultado_periodo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  loja_id UUID REFERENCES public.units(id),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  versao INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'rascunho',
  receita_bruta NUMERIC(14,2) DEFAULT 0,
  devolucoes NUMERIC(14,2) DEFAULT 0,
  descontos_abatimentos NUMERIC(14,2) DEFAULT 0,
  impostos_sobre_vendas NUMERIC(14,2) DEFAULT 0,
  receita_liquida NUMERIC(14,2) DEFAULT 0,
  cmv_bruto NUMERIC(14,2) DEFAULT 0,
  perdas_quebras NUMERIC(14,2) DEFAULT 0,
  bonificacoes_recebidas NUMERIC(14,2) DEFAULT 0,
  cmv_liquido NUMERIC(14,2) DEFAULT 0,
  lucro_bruto NUMERIC(14,2) DEFAULT 0,
  margem_bruta_pct NUMERIC(7,2) DEFAULT 0,
  verbas_comerciais NUMERIC(14,2) DEFAULT 0,
  lucro_bruto_ajustado NUMERIC(14,2) DEFAULT 0,
  despesas_operacionais NUMERIC(14,2) DEFAULT 0,
  ebit NUMERIC(14,2) DEFAULT 0,
  margem_operacional_pct NUMERIC(7,2) DEFAULT 0,
  depreciacao_amortizacao NUMERIC(14,2) DEFAULT 0,
  ebitda NUMERIC(14,2) DEFAULT 0,
  margem_ebitda_pct NUMERIC(7,2) DEFAULT 0,
  resultado_financeiro NUMERIC(14,2) DEFAULT 0,
  lair NUMERIC(14,2) DEFAULT 0,
  provisao_ir NUMERIC(14,2) DEFAULT 0,
  lucro_liquido NUMERIC(14,2) DEFAULT 0,
  margem_liquida_pct NUMERIC(7,2) DEFAULT 0,
  aprovado_por UUID,
  aprovado_em TIMESTAMPTZ,
  justificativa_versao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_resultado_tenant_periodo ON public.fin_resultado_periodo(tenant_id, periodo_inicio);
ALTER TABLE public.fin_resultado_periodo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_resultado_periodo FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 3. fin_despesa_operacional
CREATE TABLE public.fin_despesa_operacional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  loja_id UUID REFERENCES public.units(id),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  natureza TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC(14,2) NOT NULL DEFAULT 0,
  origem TEXT DEFAULT 'manual',
  periodicidade TEXT DEFAULT 'mensal',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_despesa_tenant_periodo ON public.fin_despesa_operacional(tenant_id, periodo_inicio);
ALTER TABLE public.fin_despesa_operacional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_despesa_operacional FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 4. fin_meta_financeira
CREATE TABLE public.fin_meta_financeira (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  kpi TEXT NOT NULL,
  dimensao TEXT NOT NULL DEFAULT 'rede',
  loja_id UUID REFERENCES public.units(id),
  categoria TEXT,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  valor_meta NUMERIC(14,2) NOT NULL,
  limite_amarelo NUMERIC(14,2),
  limite_vermelho NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_meta_tenant_kpi ON public.fin_meta_financeira(tenant_id, kpi);
ALTER TABLE public.fin_meta_financeira ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_meta_financeira FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 5. fin_snapshot_capital_giro
CREATE TABLE public.fin_snapshot_capital_giro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  loja_id UUID REFERENCES public.units(id),
  snapshot_date DATE NOT NULL,
  estoque_medio NUMERIC(14,2) DEFAULT 0,
  contas_receber NUMERIC(14,2) DEFAULT 0,
  contas_pagar NUMERIC(14,2) DEFAULT 0,
  cmv_periodo NUMERIC(14,2) DEFAULT 0,
  receita_periodo NUMERIC(14,2) DEFAULT 0,
  compras_periodo NUMERIC(14,2) DEFAULT 0,
  dio NUMERIC(7,1),
  dso NUMERIC(7,1),
  dpo NUMERIC(7,1),
  ccc NUMERIC(7,1),
  ncg NUMERIC(14,2),
  disponibilidades NUMERIC(14,2) DEFAULT 0,
  icdf NUMERIC(7,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_cg_tenant_date ON public.fin_snapshot_capital_giro(tenant_id, snapshot_date);
ALTER TABLE public.fin_snapshot_capital_giro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_snapshot_capital_giro FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 6. fin_margem_contribuicao_categoria
CREATE TABLE public.fin_margem_contribuicao_categoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  loja_id UUID REFERENCES public.units(id),
  categoria TEXT NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  receita_categoria NUMERIC(14,2) DEFAULT 0,
  custo_variavel NUMERIC(14,2) DEFAULT 0,
  margem_contribuicao NUMERIC(14,2) DEFAULT 0,
  imc NUMERIC(7,2) DEFAULT 0,
  participacao_receita_pct NUMERIC(7,2) DEFAULT 0,
  tendencia TEXT DEFAULT 'estavel',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_mc_tenant_periodo ON public.fin_margem_contribuicao_categoria(tenant_id, periodo_inicio);
ALTER TABLE public.fin_margem_contribuicao_categoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_margem_contribuicao_categoria FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 7. fin_alocacao_verba
CREATE TABLE public.fin_alocacao_verba (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  categoria TEXT NOT NULL,
  percentual_alocado NUMERIC(7,2) NOT NULL DEFAULT 0,
  valor_alocado NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_alocacao_verba ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_alocacao_verba FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 8. fin_projecao_financeira
CREATE TABLE public.fin_projecao_financeira (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  loja_id UUID REFERENCES public.units(id),
  data_base DATE NOT NULL,
  horizonte_dias INTEGER NOT NULL DEFAULT 30,
  receita_projetada NUMERIC(14,2) DEFAULT 0,
  cmv_projetado NUMERIC(14,2) DEFAULT 0,
  despesas_projetadas NUMERIC(14,2) DEFAULT 0,
  lucro_projetado NUMERIC(14,2) DEFAULT 0,
  margem_projetada_pct NUMERIC(7,2) DEFAULT 0,
  premissas JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_proj_tenant ON public.fin_projecao_financeira(tenant_id, data_base);
ALTER TABLE public.fin_projecao_financeira ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_projecao_financeira FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 9. fin_capital_investido
CREATE TABLE public.fin_capital_investido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  loja_id UUID REFERENCES public.units(id),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  ativo_operacional NUMERIC(14,2) DEFAULT 0,
  passivo_operacional NUMERIC(14,2) DEFAULT 0,
  capital_investido NUMERIC(14,2) DEFAULT 0,
  nopat NUMERIC(14,2) DEFAULT 0,
  roic NUMERIC(7,2) DEFAULT 0,
  roce NUMERIC(7,2) DEFAULT 0,
  spread_valor NUMERIC(7,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_ci_tenant ON public.fin_capital_investido(tenant_id, periodo_inicio);
ALTER TABLE public.fin_capital_investido ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_capital_investido FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 10. fin_alerta_financeiro
CREATE TABLE public.fin_alerta_financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  severidade TEXT NOT NULL DEFAULT 'info',
  titulo TEXT NOT NULL,
  descricao TEXT,
  kpi_referencia TEXT,
  valor_atual NUMERIC(14,2),
  valor_meta NUMERIC(14,2),
  loja_id UUID REFERENCES public.units(id),
  categoria TEXT,
  modulo_origem TEXT,
  action_url TEXT,
  resolvido_em TIMESTAMPTZ,
  resolvido_por UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fin_alerta_tenant ON public.fin_alerta_financeiro(tenant_id, created_at DESC);
ALTER TABLE public.fin_alerta_financeiro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON public.fin_alerta_financeiro FOR ALL TO authenticated USING (tenant_id = public.get_user_tenant_id(auth.uid())) WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Update is_page_allowed to support hiperfinanceiro
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

  IF p_page_path LIKE '%/hipergestao%' THEN
    v_module_key := 'hipergestao';
  ELSIF p_page_path LIKE '%/hipertrade%' THEN
    v_module_key := 'hipertrade';
  ELSIF p_page_path LIKE '%/hiperofertas%' THEN
    v_module_key := 'hiperofertas';
  ELSIF p_page_path LIKE '%/hiperia%' THEN
    v_module_key := 'hiperia';
  ELSIF p_page_path LIKE '%/hiperpmo%' THEN
    v_module_key := 'hiperpmo';
  ELSIF p_page_path LIKE '%/hipercd%' THEN
    v_module_key := 'hipercd';
  ELSIF p_page_path LIKE '%/hipercliente%' THEN
    v_module_key := 'hipercliente';
  ELSIF p_page_path LIKE '%/hipercompras%' THEN
    v_module_key := 'hipercompras';
  ELSIF p_page_path LIKE '%/hiperfinanceiro%' THEN
    v_module_key := 'hiperfinanceiro';
  ELSE
    RETURN TRUE;
  END IF;

  IF NOT v_pages_allowed ? v_module_key THEN
    RETURN TRUE;
  END IF;

  v_module_pages := v_pages_allowed -> v_module_key;

  IF v_module_pages IS NULL OR v_module_pages = 'null'::JSONB THEN
    RETURN TRUE;
  END IF;

  IF jsonb_array_length(v_module_pages) = 0 THEN
    RETURN FALSE;
  END IF;

  RETURN v_module_pages ? p_page_path;
END;
$function$;
