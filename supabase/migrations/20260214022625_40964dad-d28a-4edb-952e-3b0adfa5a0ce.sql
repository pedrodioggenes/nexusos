
-- Campaign Tracking Links (UTM builder)
CREATE TABLE public.campaign_tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  base_url TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  utm_content TEXT,
  utm_term TEXT,
  final_url TEXT NOT NULL,
  short_url TEXT,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_tracking_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view tracking links"
  ON public.campaign_tracking_links FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant users can manage tracking links"
  ON public.campaign_tracking_links FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Campaign Results (period snapshots)
CREATE TABLE public.campaign_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  kpi_snapshot JSONB NOT NULL DEFAULT '{}',
  total_investment NUMERIC DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  calculated_roi NUMERIC,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view campaign results"
  ON public.campaign_results FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant users can manage campaign results"
  ON public.campaign_results FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Indexes
CREATE INDEX idx_tracking_links_campaign ON public.campaign_tracking_links(campaign_id);
CREATE INDEX idx_campaign_results_campaign ON public.campaign_results(campaign_id);
CREATE INDEX idx_campaign_results_period ON public.campaign_results(period_start, period_end);

-- Trigger
CREATE TRIGGER update_campaign_results_updated_at
  BEFORE UPDATE ON public.campaign_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
