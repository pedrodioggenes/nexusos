
-- Metrics Catalog: standardized KPI dictionary
CREATE TABLE public.metrics_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  metric_key TEXT NOT NULL,
  display_name_pt TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'count' CHECK (unit IN ('currency', 'percent', 'count', 'ratio', 'score')),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  description TEXT,
  formula_hint TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, metric_key)
);

ALTER TABLE public.metrics_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view metrics catalog"
  ON public.metrics_catalog FOR SELECT
  USING (tenant_id IS NULL OR tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admin can manage metrics catalog"
  ON public.metrics_catalog FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- Metric Records: individual KPI values with dimensions
CREATE TABLE public.metric_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  catalog_id UUID NOT NULL REFERENCES public.metrics_catalog(id),
  value NUMERIC NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  -- Optional dimensions
  channel TEXT,
  campaign_id UUID REFERENCES public.campaigns(id),
  unit_id UUID REFERENCES public.units(id),
  -- Data quality
  quality_flag TEXT CHECK (quality_flag IN ('ok', 'missing', 'inconsistent', 'outlier')),
  quality_notes TEXT,
  -- Metadata
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.metric_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view metric records"
  ON public.metric_records FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant users can insert metric records"
  ON public.metric_records FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant users can update metric records"
  ON public.metric_records FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant users can delete metric records"
  ON public.metric_records FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Seed system metrics (tenant_id = NULL for global availability)
INSERT INTO public.metrics_catalog (tenant_id, metric_key, display_name_pt, unit, frequency, description, formula_hint, is_system) VALUES
  (NULL, 'roi', 'ROI', 'percent', 'monthly', 'Retorno sobre investimento em marketing', '(Receita - Investimento) / Investimento × 100', true),
  (NULL, 'cac', 'CAC', 'currency', 'monthly', 'Custo de aquisição de cliente', 'Investimento Total / Novos Clientes', true),
  (NULL, 'ltv', 'LTV', 'currency', 'monthly', 'Lifetime value do cliente', 'Ticket Médio × Frequência × Tempo de Retenção', true),
  (NULL, 'conversion_rate', 'Taxa de Conversão', 'percent', 'monthly', 'Percentual de visitantes que convertem', 'Conversões / Visitas × 100', true),
  (NULL, 'nps', 'NPS', 'score', 'monthly', 'Net Promoter Score', 'Promotores% - Detratores%', true),
  (NULL, 'impressions', 'Impressões', 'count', 'monthly', 'Total de impressões de anúncios', 'Soma de impressões por canal', true),
  (NULL, 'clicks', 'Cliques', 'count', 'monthly', 'Total de cliques em anúncios', 'Soma de cliques por canal', true),
  (NULL, 'leads', 'Leads', 'count', 'monthly', 'Leads gerados', 'Contatos qualificados gerados', true),
  (NULL, 'conversions', 'Conversões', 'count', 'monthly', 'Total de conversões', 'Ações de compra concluídas', true),
  (NULL, 'revenue', 'Receita', 'currency', 'monthly', 'Receita gerada por marketing', 'Soma de receitas atribuídas', true),
  (NULL, 'average_ticket', 'Ticket Médio', 'currency', 'monthly', 'Valor médio por transação', 'Receita / Número de Vendas', true),
  (NULL, 'reach', 'Alcance', 'count', 'weekly', 'Pessoas únicas alcançadas', 'Usuários únicos impactados', true),
  (NULL, 'ctr', 'CTR', 'percent', 'monthly', 'Click-through rate', 'Cliques / Impressões × 100', true),
  (NULL, 'cpc', 'CPC', 'currency', 'monthly', 'Custo por clique', 'Investimento / Cliques', true),
  (NULL, 'cpl', 'CPL', 'currency', 'monthly', 'Custo por lead', 'Investimento / Leads', true);

-- Indexes
CREATE INDEX idx_metric_records_catalog ON public.metric_records(catalog_id);
CREATE INDEX idx_metric_records_period ON public.metric_records(period_start, period_end);
CREATE INDEX idx_metric_records_tenant ON public.metric_records(tenant_id);
CREATE INDEX idx_metrics_catalog_key ON public.metrics_catalog(metric_key);

-- Trigger for updated_at
CREATE TRIGGER update_metrics_catalog_updated_at
  BEFORE UPDATE ON public.metrics_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metric_records_updated_at
  BEFORE UPDATE ON public.metric_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
