
-- 1) retail_actions
CREATE TABLE public.retail_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'outro' CHECK (type IN ('encarte','degustacao','sazonal','ofertas','institucional','trade','evento_loja','outro')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','planned','in_production','ready','running','completed','cancelled')),
  period_start DATE,
  period_end DATE,
  stores_scope JSONB DEFAULT '[]'::jsonb,
  categories_scope JSONB DEFAULT '[]'::jsonb,
  products_scope JSONB DEFAULT '[]'::jsonb,
  mechanics TEXT,
  channels JSONB DEFAULT '[]'::jsonb,
  owner_user_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view retail_actions in their tenant"
  ON public.retail_actions FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert retail_actions in their tenant"
  ON public.retail_actions FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update retail_actions in their tenant"
  ON public.retail_actions FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete retail_actions in their tenant"
  ON public.retail_actions FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE TRIGGER update_retail_actions_updated_at
  BEFORE UPDATE ON public.retail_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) retail_action_links
CREATE TABLE public.retail_action_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  retail_action_id UUID NOT NULL REFERENCES public.retail_actions(id) ON DELETE CASCADE,
  linked_type TEXT NOT NULL CHECK (linked_type IN ('campaign','demand','plan','document','execution','kpi','alert','trade')),
  linked_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_action_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view retail_action_links in their tenant"
  ON public.retail_action_links FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert retail_action_links in their tenant"
  ON public.retail_action_links FOR INSERT
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update retail_action_links in their tenant"
  ON public.retail_action_links FOR UPDATE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can delete retail_action_links in their tenant"
  ON public.retail_action_links FOR DELETE
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE INDEX idx_retail_actions_tenant ON public.retail_actions(tenant_id);
CREATE INDEX idx_retail_actions_status ON public.retail_actions(status);
CREATE INDEX idx_retail_action_links_action ON public.retail_action_links(retail_action_id);
CREATE INDEX idx_retail_action_links_linked ON public.retail_action_links(linked_type, linked_id);
