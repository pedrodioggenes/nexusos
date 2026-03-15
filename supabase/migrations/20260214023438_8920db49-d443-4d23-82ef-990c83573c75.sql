
-- Report definitions for the builder
CREATE TABLE public.report_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.report_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for report_definitions"
  ON public.report_definitions FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE INDEX idx_report_definitions_tenant ON public.report_definitions(tenant_id);

CREATE TRIGGER update_report_definitions_updated_at
  BEFORE UPDATE ON public.report_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Report runs (generated snapshots)
CREATE TABLE public.report_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  definition_id UUID NOT NULL REFERENCES public.report_definitions(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID,
  output_meta JSONB DEFAULT '{}'::jsonb,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.report_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for report_runs"
  ON public.report_runs FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE INDEX idx_report_runs_definition ON public.report_runs(definition_id);
CREATE INDEX idx_report_runs_tenant ON public.report_runs(tenant_id);
