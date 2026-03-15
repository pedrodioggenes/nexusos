
-- Execution/publication records
CREATE TABLE public.marketing_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  entity_type TEXT NOT NULL DEFAULT 'demand',
  entity_id UUID NOT NULL,
  channel TEXT NOT NULL DEFAULT 'outro',
  execution_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  link_url TEXT,
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_entity_type CHECK (entity_type IN ('demand','campaign','plan')),
  CONSTRAINT valid_channel CHECK (channel IN ('instagram','facebook','whatsapp','offline','tv','encarte','outro'))
);

CREATE INDEX idx_executions_tenant ON public.marketing_executions(tenant_id);
CREATE INDEX idx_executions_entity ON public.marketing_executions(entity_type, entity_id);
CREATE INDEX idx_executions_date ON public.marketing_executions(execution_date DESC);

ALTER TABLE public.marketing_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view executions"
  ON public.marketing_executions FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Operators and admins can create executions"
  ON public.marketing_executions FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) IN ('gestor', 'admin')
  );

CREATE POLICY "Operators and admins can update executions"
  ON public.marketing_executions FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) IN ('gestor', 'admin')
  );

CREATE POLICY "Admins can delete executions"
  ON public.marketing_executions FOR DELETE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) = 'admin'
  );
