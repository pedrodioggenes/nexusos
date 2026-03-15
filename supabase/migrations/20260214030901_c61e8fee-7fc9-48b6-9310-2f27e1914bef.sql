
-- retail_action_metrics: before/during/after per action per store
CREATE TABLE public.retail_action_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  retail_action_id UUID NOT NULL REFERENCES public.retail_actions(id) ON DELETE CASCADE,
  store_id UUID REFERENCES public.units(id),
  metric_key TEXT NOT NULL DEFAULT 'receita',
  baseline_value NUMERIC,
  during_value NUMERIC,
  post_value NUMERIC,
  source TEXT NOT NULL DEFAULT 'manual',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_action_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for retail_action_metrics"
  ON public.retail_action_metrics FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE TRIGGER update_retail_action_metrics_updated_at
  BEFORE UPDATE ON public.retail_action_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_retail_action_metrics_action ON public.retail_action_metrics(retail_action_id);
CREATE INDEX idx_retail_action_metrics_store ON public.retail_action_metrics(store_id);
