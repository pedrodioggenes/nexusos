
-- Table: retail_store_kits
CREATE TABLE public.retail_store_kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  retail_action_id UUID NOT NULL REFERENCES public.retail_actions(id) ON DELETE CASCADE,
  kit_document_page_id UUID REFERENCES public.workspace_pages(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, retail_action_id)
);

ALTER TABLE public.retail_store_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for retail_store_kits"
  ON public.retail_store_kits FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE TRIGGER update_retail_store_kits_updated_at
  BEFORE UPDATE ON public.retail_store_kits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
