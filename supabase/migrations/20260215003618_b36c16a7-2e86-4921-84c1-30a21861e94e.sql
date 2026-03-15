
-- Channel governance configuration per channel per tenant
CREATE TABLE public.hyperworks_channel_governance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.hyperworks_channels(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  allowed_types TEXT[] DEFAULT ARRAY['normal', 'comunicado', 'pedido', 'comprovação'],
  suggested_template TEXT,
  auto_suggest_comprovacao BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, tenant_id)
);

ALTER TABLE public.hyperworks_channel_governance ENABLE ROW LEVEL SECURITY;

-- Members of the tenant can read governance config
CREATE POLICY "Tenant members can read channel governance"
  ON public.hyperworks_channel_governance FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Only admins can manage governance config
CREATE POLICY "Admins can insert channel governance"
  ON public.hyperworks_channel_governance FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update channel governance"
  ON public.hyperworks_channel_governance FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete channel governance"
  ON public.hyperworks_channel_governance FOR DELETE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE TRIGGER update_hyperworks_channel_governance_updated_at
  BEFORE UPDATE ON public.hyperworks_channel_governance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
