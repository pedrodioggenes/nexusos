-- Create marketing_demands table
CREATE TABLE public.marketing_demands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'social_media', 'design', 'copywriting', 'video', 'general'
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'urgent', 'high', 'medium', 'low'
  status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'review', 'approved', 'completed', 'cancelled'
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Dates
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date DATE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Integrations with other pages
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.workspace_pages(id) ON DELETE SET NULL,
  budget_id UUID REFERENCES public.marketing_budgets(id) ON DELETE SET NULL,
  
  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  
  -- Activity tracking
  comments_count INTEGER DEFAULT 0,
  activity_log JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.marketing_demands ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_demands
-- Internal users can view demands from their tenant
CREATE POLICY "Internal users can view demands from their tenant"
ON public.marketing_demands
FOR SELECT
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
);

-- Internal users can create demands for their tenant
CREATE POLICY "Internal users can create demands for their tenant"
ON public.marketing_demands
FOR INSERT
WITH CHECK (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND created_by = auth.uid()
);

-- Internal users can update demands from their tenant
CREATE POLICY "Internal users can update demands from their tenant"
ON public.marketing_demands
FOR UPDATE
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
);

-- Internal users can delete demands from their tenant (admin only)
CREATE POLICY "Admins can delete demands from their tenant"
ON public.marketing_demands
FOR DELETE
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.has_role(auth.uid(), 'admin')
);

-- Create trigger for updated_at
CREATE TRIGGER update_marketing_demands_updated_at
BEFORE UPDATE ON public.marketing_demands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_marketing_demands_tenant_id ON public.marketing_demands(tenant_id);
CREATE INDEX idx_marketing_demands_status ON public.marketing_demands(status);
CREATE INDEX idx_marketing_demands_priority ON public.marketing_demands(priority);
CREATE INDEX idx_marketing_demands_assigned_to ON public.marketing_demands(assigned_to);
CREATE INDEX idx_marketing_demands_due_date ON public.marketing_demands(due_date);
CREATE INDEX idx_marketing_demands_campaign_id ON public.marketing_demands(campaign_id);
CREATE INDEX idx_marketing_demands_created_at ON public.marketing_demands(created_at DESC);