
-- Create junction table for demand-document linking
CREATE TABLE public.demand_document_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id UUID NOT NULL REFERENCES marketing_demands(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES workspace_pages(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  UNIQUE(demand_id, page_id)
);

-- Enable RLS
ALTER TABLE public.demand_document_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view links for their demands"
  ON public.demand_document_links
  FOR SELECT
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Users can create links in their tenant"
  ON public.demand_document_links
  FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Users can delete links they created"
  ON public.demand_document_links
  FOR DELETE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- Create index for faster lookups
CREATE INDEX idx_demand_document_links_demand_id ON public.demand_document_links(demand_id);
CREATE INDEX idx_demand_document_links_page_id ON public.demand_document_links(page_id);
CREATE INDEX idx_demand_document_links_tenant_id ON public.demand_document_links(tenant_id);
