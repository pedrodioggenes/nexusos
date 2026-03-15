
-- Alert rules engine table
CREATE TABLE public.alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  rule_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  evaluation_config JSONB NOT NULL DEFAULT '{}',
  action_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, rule_key)
);

ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alert rules for their tenant"
ON public.alert_rules FOR SELECT TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR tenant_id IS NULL);

CREATE POLICY "Admins can manage alert rules"
ON public.alert_rules FOR ALL TO authenticated
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- Add rule_key to marketing_alerts for linking
ALTER TABLE public.marketing_alerts ADD COLUMN IF NOT EXISTS rule_key TEXT;
ALTER TABLE public.marketing_alerts ADD COLUMN IF NOT EXISTS evidence TEXT;
ALTER TABLE public.marketing_alerts ADD COLUMN IF NOT EXISTS action_link TEXT;
ALTER TABLE public.marketing_alerts ADD COLUMN IF NOT EXISTS impact TEXT;

-- Trigger for updated_at
CREATE TRIGGER update_alert_rules_updated_at
BEFORE UPDATE ON public.alert_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
