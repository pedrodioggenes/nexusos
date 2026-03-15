
-- 1) retail_execution_runs
CREATE TABLE public.retail_execution_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  retail_action_id UUID NOT NULL REFERENCES public.retail_actions(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.units(id),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','blocked')),
  compliance_score INTEGER DEFAULT 0,
  issues_count INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retail_action_id, store_id)
);

ALTER TABLE public.retail_execution_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_execution_runs" ON public.retail_execution_runs FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "tenant_insert_execution_runs" ON public.retail_execution_runs FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "tenant_update_execution_runs" ON public.retail_execution_runs FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "tenant_delete_execution_runs" ON public.retail_execution_runs FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE TRIGGER update_execution_runs_updated_at
  BEFORE UPDATE ON public.retail_execution_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_execution_runs_tenant ON public.retail_execution_runs(tenant_id);
CREATE INDEX idx_execution_runs_action ON public.retail_execution_runs(retail_action_id);
CREATE INDEX idx_execution_runs_store ON public.retail_execution_runs(store_id);

-- 2) retail_execution_items
CREATE TABLE public.retail_execution_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  execution_run_id UUID NOT NULL REFERENCES public.retail_execution_runs(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'outro' CHECK (category IN ('precificacao','gondola','ponta','degustacao','tv','whatsapp','encarte','promotor','outro')),
  required BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ok','not_ok','na')),
  notes TEXT,
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_execution_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_execution_items" ON public.retail_execution_items FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "tenant_insert_execution_items" ON public.retail_execution_items FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "tenant_update_execution_items" ON public.retail_execution_items FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "tenant_delete_execution_items" ON public.retail_execution_items FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE TRIGGER update_execution_items_updated_at
  BEFORE UPDATE ON public.retail_execution_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_execution_items_run ON public.retail_execution_items(execution_run_id);

-- 3) retail_execution_issues
CREATE TABLE public.retail_execution_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  execution_run_id UUID NOT NULL REFERENCES public.retail_execution_runs(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  issue_type TEXT NOT NULL DEFAULT 'outro' CHECK (issue_type IN ('falta_material','preco_errado','exposicao_errada','sem_produto','sem_promotor','outro')),
  description TEXT NOT NULL DEFAULT '',
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_execution_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_execution_issues" ON public.retail_execution_issues FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "tenant_insert_execution_issues" ON public.retail_execution_issues FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "tenant_update_execution_issues" ON public.retail_execution_issues FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE POLICY "tenant_delete_execution_issues" ON public.retail_execution_issues FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE INDEX idx_execution_issues_run ON public.retail_execution_issues(execution_run_id);
