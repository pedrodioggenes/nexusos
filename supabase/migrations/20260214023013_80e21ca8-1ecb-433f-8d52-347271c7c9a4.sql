
-- Experiments table for A/B testing
CREATE TABLE public.experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  title TEXT NOT NULL,
  hypothesis TEXT,
  metric_key TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','running','completed','archived')),
  linked_campaign_id UUID REFERENCES public.marketing_campaigns(id),
  variants JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  decision TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for experiments"
  ON public.experiments FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE INDEX idx_experiments_tenant ON public.experiments(tenant_id);
CREATE INDEX idx_experiments_status ON public.experiments(status);

CREATE TRIGGER update_experiments_updated_at
  BEFORE UPDATE ON public.experiments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
