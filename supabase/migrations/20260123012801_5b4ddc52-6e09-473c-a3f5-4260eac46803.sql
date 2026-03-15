-- Create workspace_pages table for Notion-like documents
CREATE TABLE public.workspace_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  parent_page_id UUID REFERENCES public.workspace_pages(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Sem título',
  icon TEXT DEFAULT '📄',
  cover_image TEXT,
  content JSONB DEFAULT '[]'::jsonb,
  is_template BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add source_page_id to team_tasks for document-task linking
ALTER TABLE public.team_tasks 
ADD COLUMN source_page_id UUID REFERENCES public.workspace_pages(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.workspace_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_pages
CREATE POLICY "Internal users can view workspace pages"
ON public.workspace_pages
FOR SELECT
USING (
  (tenant_id = get_user_tenant_id(auth.uid())) 
  OR is_sigma_admin(auth.uid())
);

CREATE POLICY "Admins and operators can manage workspace pages"
ON public.workspace_pages
FOR ALL
USING (
  ((tenant_id = get_user_tenant_id(auth.uid())) 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role)))
  OR is_sigma_admin(auth.uid())
);

-- Trigger for updated_at
CREATE TRIGGER update_workspace_pages_updated_at
BEFORE UPDATE ON public.workspace_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for parent_page_id for efficient tree queries
CREATE INDEX idx_workspace_pages_parent ON public.workspace_pages(parent_page_id);
CREATE INDEX idx_workspace_pages_tenant ON public.workspace_pages(tenant_id);
CREATE INDEX idx_workspace_pages_favorite ON public.workspace_pages(tenant_id, is_favorite) WHERE is_favorite = true;