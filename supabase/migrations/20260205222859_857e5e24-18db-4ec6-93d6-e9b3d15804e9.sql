-- =====================================================
-- PORTAL DE GESTÃO DE AGÊNCIA PARCEIRA - ENTERPRISE
-- =====================================================

-- 1. Tabela: agency_partners (Dados da Agência)
CREATE TABLE public.agency_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnpj TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  monthly_fee NUMERIC DEFAULT 0,
  contract_start DATE,
  contract_end DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  notes TEXT,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela: agency_briefings (Briefings/Demandas)
CREATE TABLE public.agency_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agency_partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('campaign', 'social', 'trade', 'encarte', 'video', 'design', 'other')),
  objective TEXT,
  target_audience TEXT,
  deadline DATE,
  budget NUMERIC,
  assets JSONB DEFAULT '[]',
  references_urls JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'in_production', 'delivered', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_by UUID,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela: agency_deliveries (Entregas)
CREATE TABLE public.agency_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  briefing_id UUID REFERENCES agency_briefings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'in_production', 'internal_review', 'adjustments', 'approved', 'rejected')),
  deadline DATE,
  delivered_at TIMESTAMPTZ,
  revision_count INT DEFAULT 0,
  max_revisions INT DEFAULT 3,
  files JSONB DEFAULT '[]',
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela: agency_approvals (Aprovações de Criativos)
CREATE TABLE public.agency_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES agency_deliveries(id) ON DELETE CASCADE,
  version INT DEFAULT 1,
  file_url TEXT NOT NULL,
  file_type TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'adjustments', 'rejected')),
  feedback TEXT,
  markup_data JSONB,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela: agency_scores (Avaliações Mensais)
CREATE TABLE public.agency_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agency_partners(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  communication_score INT CHECK (communication_score BETWEEN 1 AND 10),
  quality_score INT CHECK (quality_score BETWEEN 1 AND 10),
  punctuality_score INT CHECK (punctuality_score BETWEEN 1 AND 10),
  strategy_score INT CHECK (strategy_score BETWEEN 1 AND 10),
  cost_benefit_score INT CHECK (cost_benefit_score BETWEEN 1 AND 10),
  overall_score NUMERIC GENERATED ALWAYS AS (
    (COALESCE(communication_score, 0) + COALESCE(quality_score, 0) + 
     COALESCE(punctuality_score, 0) + COALESCE(strategy_score, 0) + 
     COALESCE(cost_benefit_score, 0)) / 5.0
  ) STORED,
  notes TEXT,
  evaluated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agency_id, period)
);

-- 6. Tabela: agency_sla_metrics (Métricas de SLA)
CREATE TABLE public.agency_sla_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agency_partners(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  response_time_avg_hours NUMERIC,
  response_time_target_hours NUMERIC DEFAULT 24,
  on_time_delivery_rate NUMERIC,
  on_time_target_rate NUMERIC DEFAULT 90,
  avg_revision_rounds NUMERIC,
  max_revision_target INT DEFAULT 3,
  deliveries_count INT DEFAULT 0,
  deliveries_approved INT DEFAULT 0,
  deliveries_rejected INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agency_id, period)
);

-- 7. Tabela: agency_communications (Log de Comunicações)
CREATE TABLE public.agency_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agency_partners(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('meeting', 'call', 'email', 'decision', 'escalation', 'scope_change', 'note')),
  title TEXT NOT NULL,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  participants JSONB DEFAULT '[]',
  meeting_date TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Tabela: agency_invoices (Faturas/Financeiro)
CREATE TABLE public.agency_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agency_partners(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number TEXT,
  reference_month DATE NOT NULL,
  base_fee NUMERIC DEFAULT 0,
  extras JSONB DEFAULT '[]',
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_agency_partners_updated_at
  BEFORE UPDATE ON agency_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_briefings_updated_at
  BEFORE UPDATE ON agency_briefings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_deliveries_updated_at
  BEFORE UPDATE ON agency_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_sla_metrics_updated_at
  BEFORE UPDATE ON agency_sla_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_invoices_updated_at
  BEFORE UPDATE ON agency_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE agency_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_sla_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_invoices ENABLE ROW LEVEL SECURITY;

-- Agency Partners Policies
CREATE POLICY "Internal users can view agency partners"
  ON agency_partners FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins can manage agency partners"
  ON agency_partners FOR ALL
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()))
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()));

-- Agency Briefings Policies
CREATE POLICY "Internal users can view briefings"
  ON agency_briefings FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins and operators can manage briefings"
  ON agency_briefings FOR ALL
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))) OR is_sigma_admin(auth.uid()))
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))) OR is_sigma_admin(auth.uid()));

-- Agency Deliveries Policies
CREATE POLICY "Internal users can view deliveries"
  ON agency_deliveries FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins and operators can manage deliveries"
  ON agency_deliveries FOR ALL
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))) OR is_sigma_admin(auth.uid()))
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))) OR is_sigma_admin(auth.uid()));

-- Agency Approvals Policies
CREATE POLICY "Internal users can view approvals"
  ON agency_approvals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM agency_deliveries d 
    WHERE d.id = agency_approvals.delivery_id 
    AND (d.tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()))
  ));

CREATE POLICY "Admins and operators can manage approvals"
  ON agency_approvals FOR ALL
  USING (EXISTS (
    SELECT 1 FROM agency_deliveries d 
    WHERE d.id = agency_approvals.delivery_id 
    AND ((d.tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))) OR is_sigma_admin(auth.uid()))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM agency_deliveries d 
    WHERE d.id = agency_approvals.delivery_id 
    AND ((d.tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))) OR is_sigma_admin(auth.uid()))
  ));

-- Agency Scores Policies
CREATE POLICY "Internal users can view scores"
  ON agency_scores FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins can manage scores"
  ON agency_scores FOR ALL
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()))
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()));

-- Agency SLA Metrics Policies
CREATE POLICY "Internal users can view SLA metrics"
  ON agency_sla_metrics FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins can manage SLA metrics"
  ON agency_sla_metrics FOR ALL
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()))
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()));

-- Agency Communications Policies
CREATE POLICY "Internal users can view communications"
  ON agency_communications FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins and operators can manage communications"
  ON agency_communications FOR ALL
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))) OR is_sigma_admin(auth.uid()))
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador'))) OR is_sigma_admin(auth.uid()));

-- Agency Invoices Policies
CREATE POLICY "Internal users can view invoices"
  ON agency_invoices FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Admins can manage invoices"
  ON agency_invoices FOR ALL
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()))
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin')) OR is_sigma_admin(auth.uid()));

-- =====================================================
-- INDEXES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_agency_partners_tenant ON agency_partners(tenant_id);
CREATE INDEX idx_agency_briefings_tenant ON agency_briefings(tenant_id);
CREATE INDEX idx_agency_briefings_agency ON agency_briefings(agency_id);
CREATE INDEX idx_agency_briefings_status ON agency_briefings(status);
CREATE INDEX idx_agency_deliveries_tenant ON agency_deliveries(tenant_id);
CREATE INDEX idx_agency_deliveries_briefing ON agency_deliveries(briefing_id);
CREATE INDEX idx_agency_deliveries_status ON agency_deliveries(status);
CREATE INDEX idx_agency_approvals_delivery ON agency_approvals(delivery_id);
CREATE INDEX idx_agency_scores_agency ON agency_scores(agency_id);
CREATE INDEX idx_agency_sla_metrics_agency ON agency_sla_metrics(agency_id);
CREATE INDEX idx_agency_communications_agency ON agency_communications(agency_id);
CREATE INDEX idx_agency_invoices_agency ON agency_invoices(agency_id);