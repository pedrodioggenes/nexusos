
-- HyperWorks Entity Links table
CREATE TABLE public.hyperworks_entity_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  workspace_id uuid NULL,
  channel_id uuid NULL,
  message_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  relation_type text NOT NULL DEFAULT 'evidence',
  label text NULL,
  excerpt text NULL,
  media_urls text[] NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_hyperworks_entity_links_entity ON public.hyperworks_entity_links(entity_type, entity_id);
CREATE INDEX idx_hyperworks_entity_links_message ON public.hyperworks_entity_links(message_id);
CREATE INDEX idx_hyperworks_entity_links_tenant ON public.hyperworks_entity_links(tenant_id);

-- RLS
ALTER TABLE public.hyperworks_entity_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view links in their tenant"
  ON public.hyperworks_entity_links FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can create links in their tenant"
  ON public.hyperworks_entity_links FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can delete their own links"
  ON public.hyperworks_entity_links FOR DELETE
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND created_by = auth.uid()
  );

-- Admins can delete any link in their tenant
CREATE POLICY "Admins can delete any link in tenant"
  ON public.hyperworks_entity_links FOR DELETE
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );
