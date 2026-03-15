
-- ============================================================
-- A) ÍNDICES — marketing_demands
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_md_tenant_created ON public.marketing_demands (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_md_tenant_status ON public.marketing_demands (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_md_tenant_due ON public.marketing_demands (tenant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_md_tenant_assigned ON public.marketing_demands (tenant_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_md_tenant_type ON public.marketing_demands (tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_md_tenant_priority ON public.marketing_demands (tenant_id, priority);

-- ÍNDICES — demand_responses
CREATE INDEX IF NOT EXISTS idx_dr_tenant_demand_user ON public.demand_responses (demand_id, user_id);
CREATE INDEX IF NOT EXISTS idx_dr_tenant_demand_status ON public.demand_responses (demand_id, status);

-- ÍNDICES — demand_workflow_steps
CREATE INDEX IF NOT EXISTS idx_dws_tenant_demand ON public.demand_workflow_steps (tenant_id, demand_id);

-- ÍNDICES — demand_approvals
CREATE INDEX IF NOT EXISTS idx_da_tenant_demand_status ON public.demand_approvals (tenant_id, demand_id, status);

-- ============================================================
-- B) TABELAS NOVAS
-- ============================================================

-- 1) demand_status_history
CREATE TABLE IF NOT EXISTS public.demand_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  demand_id uuid NOT NULL REFERENCES public.marketing_demands(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid NOT NULL,
  change_reason text,
  source text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dsh_tenant_demand ON public.demand_status_history (tenant_id, demand_id);
CREATE INDEX idx_dsh_demand_created ON public.demand_status_history (demand_id, created_at DESC);

ALTER TABLE public.demand_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_demand_status_history"
  ON public.demand_status_history FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "tenant_insert_demand_status_history"
  ON public.demand_status_history FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 2) demand_templates
CREATE TABLE IF NOT EXISTS public.demand_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL,
  description text,
  default_type text NOT NULL DEFAULT 'general',
  default_priority text NOT NULL DEFAULT 'medium',
  default_steps jsonb,
  default_approvals jsonb,
  default_fields jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dt_tenant ON public.demand_templates (tenant_id);

ALTER TABLE public.demand_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_demand_templates"
  ON public.demand_templates FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "tenant_insert_demand_templates"
  ON public.demand_templates FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "tenant_update_demand_templates"
  ON public.demand_templates FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "tenant_delete_demand_templates"
  ON public.demand_templates FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 3) demand_packages
CREATE TABLE IF NOT EXISTS public.demand_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL,
  context jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dp_tenant ON public.demand_packages (tenant_id);

ALTER TABLE public.demand_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_demand_packages"
  ON public.demand_packages FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "tenant_insert_demand_packages"
  ON public.demand_packages FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "tenant_update_demand_packages"
  ON public.demand_packages FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "tenant_delete_demand_packages"
  ON public.demand_packages FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 4) demand_package_items
CREATE TABLE IF NOT EXISTS public.demand_package_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  package_id uuid NOT NULL REFERENCES public.demand_packages(id) ON DELETE CASCADE,
  demand_id uuid NOT NULL REFERENCES public.marketing_demands(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, demand_id)
);

CREATE INDEX idx_dpi_tenant_package ON public.demand_package_items (tenant_id, package_id);
CREATE INDEX idx_dpi_demand ON public.demand_package_items (demand_id);

ALTER TABLE public.demand_package_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_demand_package_items"
  ON public.demand_package_items FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "tenant_insert_demand_package_items"
  ON public.demand_package_items FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "tenant_delete_demand_package_items"
  ON public.demand_package_items FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- ============================================================
-- C) COLUNAS NOVAS — marketing_demands
-- ============================================================
ALTER TABLE public.marketing_demands
  ADD COLUMN IF NOT EXISTS destination_scope jsonb,
  ADD COLUMN IF NOT EXISTS deliverable_kind text,
  ADD COLUMN IF NOT EXISTS channels jsonb,
  ADD COLUMN IF NOT EXISTS governance_mode text DEFAULT 'flex',
  ADD COLUMN IF NOT EXISTS completion_requirements jsonb,
  ADD COLUMN IF NOT EXISTS blocked_reason text,
  ADD COLUMN IF NOT EXISTS last_status_change_at timestamptz;

-- ============================================================
-- D) COLUNAS NOVAS — demand_responses
-- ============================================================
ALTER TABLE public.demand_responses
  ADD COLUMN IF NOT EXISTS deliverable_urls jsonb,
  ADD COLUMN IF NOT EXISTS is_final boolean DEFAULT false;
