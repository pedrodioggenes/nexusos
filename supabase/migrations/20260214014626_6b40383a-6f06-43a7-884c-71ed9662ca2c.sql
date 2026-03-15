
-- Workflow steps per demand (optional production pipeline)
CREATE TABLE public.demand_workflow_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  demand_id UUID NOT NULL REFERENCES public.marketing_demands(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL DEFAULT 'draft',
  step_label TEXT NOT NULL DEFAULT 'Rascunho',
  step_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  owner_role TEXT,
  due_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_step_status CHECK (status IN ('pending','in_progress','blocked','done','skipped'))
);

-- Demand approvals (formal approval flow)
CREATE TABLE public.demand_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  demand_id UUID NOT NULL REFERENCES public.marketing_demands(id) ON DELETE CASCADE,
  required BOOLEAN NOT NULL DEFAULT true,
  approver_user_id UUID,
  approver_role TEXT DEFAULT 'admin',
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_approval_status CHECK (status IN ('pending','approved','changes_requested','rejected'))
);

-- Indexes
CREATE INDEX idx_workflow_steps_demand ON public.demand_workflow_steps(demand_id);
CREATE INDEX idx_workflow_steps_tenant ON public.demand_workflow_steps(tenant_id);
CREATE INDEX idx_demand_approvals_demand ON public.demand_approvals(demand_id);
CREATE INDEX idx_demand_approvals_tenant ON public.demand_approvals(tenant_id);
CREATE INDEX idx_demand_approvals_approver ON public.demand_approvals(approver_user_id);

-- Enable RLS
ALTER TABLE public.demand_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_approvals ENABLE ROW LEVEL SECURITY;

-- RLS: demand_workflow_steps
CREATE POLICY "Tenant users can view workflow steps"
  ON public.demand_workflow_steps FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Operators and admins can manage workflow steps"
  ON public.demand_workflow_steps FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) IN ('gestor', 'admin')
  );

CREATE POLICY "Operators and admins can update workflow steps"
  ON public.demand_workflow_steps FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) IN ('gestor', 'admin')
  );

CREATE POLICY "Admins can delete workflow steps"
  ON public.demand_workflow_steps FOR DELETE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) = 'admin'
  );

-- RLS: demand_approvals
CREATE POLICY "Tenant users can view approvals"
  ON public.demand_approvals FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Operators and admins can create approvals"
  ON public.demand_approvals FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) IN ('gestor', 'admin')
  );

CREATE POLICY "Approvers and admins can update approvals"
  ON public.demand_approvals FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (
      approver_user_id = auth.uid()
      OR public.get_user_department_role(auth.uid()) = 'admin'
    )
  );

CREATE POLICY "Admins can delete approvals"
  ON public.demand_approvals FOR DELETE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) = 'admin'
  );

-- Updated_at triggers
CREATE TRIGGER update_demand_workflow_steps_updated_at
  BEFORE UPDATE ON public.demand_workflow_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demand_approvals_updated_at
  BEFORE UPDATE ON public.demand_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
