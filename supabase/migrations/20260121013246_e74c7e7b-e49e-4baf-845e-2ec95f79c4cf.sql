-- =====================================================
-- HIPERGESTÃO PREMIUM: Novas tabelas para funcionalidades avançadas
-- =====================================================

-- 1. ALERTAS INTELIGENTES
-- Armazena alertas automáticos sobre orçamento, ROI, execução e fornecedores
CREATE TABLE public.marketing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('budget', 'roi', 'execution', 'supplier', 'goal', 'anomaly')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}',
  related_entity_type TEXT, -- 'category', 'campaign', 'supplier', 'store', 'kpi'
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  ai_suggestion TEXT, -- Sugestão gerada pela IA
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_alerts ENABLE ROW LEVEL SECURITY;

-- Policies para alertas
CREATE POLICY "Internal users can view alerts"
ON public.marketing_alerts FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins can manage alerts"
ON public.marketing_alerts FOR ALL
USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()));

-- 2. METAS DE MARKETING
-- Sistema de metas dinâmicas por KPI e período
CREATE TABLE public.marketing_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kpi_type TEXT NOT NULL CHECK (kpi_type IN ('roi', 'cac', 'ltv', 'conversion_rate', 'nps', 'revenue', 'leads', 'impressions', 'clicks')),
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  baseline_value NUMERIC, -- Valor de referência (período anterior)
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'missed', 'cancelled')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_goals ENABLE ROW LEVEL SECURITY;

-- Policies para metas
CREATE POLICY "Internal users can view goals"
ON public.marketing_goals FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins can manage goals"
ON public.marketing_goals FOR ALL
USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_marketing_goals_updated_at
BEFORE UPDATE ON public.marketing_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. PERFORMANCE POR LOJA
-- Métricas de marketing por unidade/região
CREATE TABLE public.marketing_store_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  investment NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  roi NUMERIC GENERATED ALWAYS AS (
    CASE WHEN investment > 0 THEN ((revenue - investment) / investment) * 100 ELSE 0 END
  ) STORED,
  impressions BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC GENERATED ALWAYS AS (
    CASE WHEN clicks > 0 THEN (conversions::NUMERIC / clicks) * 100 ELSE 0 END
  ) STORED,
  foot_traffic INTEGER DEFAULT 0, -- Fluxo de clientes
  average_ticket NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(unit_id, period_type, period_start)
);

-- Enable RLS
ALTER TABLE public.marketing_store_performance ENABLE ROW LEVEL SECURITY;

-- Policies para performance por loja
CREATE POLICY "Internal users can view store performance"
ON public.marketing_store_performance FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins can manage store performance"
ON public.marketing_store_performance FOR ALL
USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_marketing_store_performance_updated_at
BEFORE UPDATE ON public.marketing_store_performance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. VERBAS COOPERADAS (Trade Marketing)
-- Gestão de verbas negociadas com fornecedores
CREATE TABLE public.marketing_coop_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  quarter INTEGER CHECK (quarter BETWEEN 1 AND 4), -- NULL significa anual
  negotiated_amount NUMERIC NOT NULL DEFAULT 0,
  executed_amount NUMERIC DEFAULT 0,
  proven_amount NUMERIC DEFAULT 0,
  pending_proof_amount NUMERIC GENERATED ALWAYS AS (executed_amount - proven_amount) STORED,
  utilization_rate NUMERIC GENERATED ALWAYS AS (
    CASE WHEN negotiated_amount > 0 THEN (executed_amount / negotiated_amount) * 100 ELSE 0 END
  ) STORED,
  status TEXT DEFAULT 'active' CHECK (status IN ('negotiating', 'active', 'closed', 'cancelled')),
  contract_reference TEXT,
  notes TEXT,
  negotiated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, year, quarter)
);

-- Enable RLS
ALTER TABLE public.marketing_coop_funds ENABLE ROW LEVEL SECURITY;

-- Policies para verbas cooperadas
CREATE POLICY "Internal users can view coop funds"
ON public.marketing_coop_funds FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins can manage coop funds"
ON public.marketing_coop_funds FOR ALL
USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_marketing_coop_funds_updated_at
BEFORE UPDATE ON public.marketing_coop_funds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. CAMPANHAS DE MARKETING (Gestão 360)
-- Workflow completo de campanhas
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('seasonal', 'promotional', 'institutional', 'trade', 'digital', 'event')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'in_production', 'active', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Datas
  start_date DATE,
  end_date DATE,
  approval_deadline DATE,
  
  -- Orçamento
  planned_budget NUMERIC DEFAULT 0,
  approved_budget NUMERIC DEFAULT 0,
  spent_amount NUMERIC DEFAULT 0,
  
  -- Fornecedor/Trade (se aplicável)
  supplier_id UUID REFERENCES public.suppliers(id),
  coop_fund_id UUID REFERENCES public.marketing_coop_funds(id),
  
  -- Métricas esperadas/reais
  expected_reach INTEGER,
  actual_reach INTEGER,
  expected_conversions INTEGER,
  actual_conversions INTEGER,
  expected_roi NUMERIC,
  actual_roi NUMERIC,
  
  -- Workflow
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Notas e anexos
  briefing TEXT,
  learnings TEXT, -- Post-mortem
  assets JSONB DEFAULT '[]', -- URLs de assets
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies para campanhas
CREATE POLICY "Internal users can view marketing campaigns"
ON public.marketing_campaigns FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins and operators can manage marketing campaigns"
ON public.marketing_campaigns FOR ALL
USING ((tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))) OR is_sigma_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_marketing_campaigns_updated_at
BEFORE UPDATE ON public.marketing_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. LOJAS DA CAMPANHA
-- Relação N:N entre campanhas e lojas
CREATE TABLE public.marketing_campaign_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'issues')),
  execution_date DATE,
  proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, unit_id)
);

-- Enable RLS
ALTER TABLE public.marketing_campaign_stores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Internal users can view campaign stores"
ON public.marketing_campaign_stores FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.marketing_campaigns mc 
  WHERE mc.id = marketing_campaign_stores.campaign_id 
  AND (mc.tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()))
));

CREATE POLICY "Admins can manage campaign stores"
ON public.marketing_campaign_stores FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.marketing_campaigns mc 
  WHERE mc.id = marketing_campaign_stores.campaign_id 
  AND ((mc.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()))
));

-- 7. INSIGHTS GERADOS PELA IA
-- Cache de insights para evitar chamadas repetidas
CREATE TABLE public.marketing_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('dashboard', 'budget', 'kpi', 'campaign', 'store', 'trade')),
  context_data JSONB NOT NULL, -- Dados usados para gerar o insight
  insight_text TEXT NOT NULL,
  suggestions JSONB DEFAULT '[]', -- Array de sugestões acionáveis
  confidence_score NUMERIC, -- 0-100
  is_dismissed BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_ai_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Internal users can view insights"
ON public.marketing_ai_insights FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins can manage insights"
ON public.marketing_ai_insights FOR ALL
USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()));

-- Índices para performance
CREATE INDEX idx_marketing_alerts_tenant_read ON public.marketing_alerts(tenant_id, is_read, created_at DESC);
CREATE INDEX idx_marketing_goals_tenant_period ON public.marketing_goals(tenant_id, period_type, period_start);
CREATE INDEX idx_marketing_store_performance_unit ON public.marketing_store_performance(unit_id, period_start);
CREATE INDEX idx_marketing_coop_funds_supplier ON public.marketing_coop_funds(supplier_id, year);
CREATE INDEX idx_marketing_campaigns_tenant_status ON public.marketing_campaigns(tenant_id, status, start_date);
CREATE INDEX idx_marketing_ai_insights_tenant_type ON public.marketing_ai_insights(tenant_id, insight_type, created_at DESC);