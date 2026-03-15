
-- ============================================================
-- MARKETING BRIEFINGS & TEMPLATES HUB
-- ============================================================

-- 1) marketing_briefings - Structured marketing requests
CREATE TABLE public.marketing_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  title TEXT NOT NULL,
  objective TEXT,
  target_audience TEXT,
  channels JSONB DEFAULT '[]'::jsonb,
  stores JSONB DEFAULT '[]'::jsonb,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'draft',
  context TEXT,
  constraints TEXT,
  reference_urls JSONB DEFAULT '[]'::jsonb,
  kpi_target JSONB DEFAULT '{}'::jsonb,
  kpi_baseline TEXT,
  assigned_to UUID,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) marketing_templates - Reusable template definitions
CREATE TABLE public.marketing_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'brief',
  category TEXT,
  icon TEXT DEFAULT '📋',
  definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) marketing_briefing_links - Links briefings to generated entities
CREATE TABLE public.marketing_briefing_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  briefing_id UUID NOT NULL REFERENCES public.marketing_briefings(id) ON DELETE CASCADE,
  linked_type TEXT NOT NULL,
  linked_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_marketing_briefings_tenant ON public.marketing_briefings(tenant_id);
CREATE INDEX idx_marketing_briefings_status ON public.marketing_briefings(status);
CREATE INDEX idx_marketing_templates_tenant ON public.marketing_templates(tenant_id);
CREATE INDEX idx_marketing_briefing_links_briefing ON public.marketing_briefing_links(briefing_id);
CREATE INDEX idx_marketing_briefing_links_linked ON public.marketing_briefing_links(linked_type, linked_id);

-- Updated_at triggers
CREATE TRIGGER update_marketing_briefings_updated_at
  BEFORE UPDATE ON public.marketing_briefings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_templates_updated_at
  BEFORE UPDATE ON public.marketing_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.marketing_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_briefing_links ENABLE ROW LEVEL SECURITY;

-- marketing_briefings: tenant-isolated, role-based
CREATE POLICY "briefings_select" ON public.marketing_briefings
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "briefings_insert" ON public.marketing_briefings
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('admin', 'operador')
  );

CREATE POLICY "briefings_update" ON public.marketing_briefings
  FOR UPDATE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('admin', 'operador')
  );

CREATE POLICY "briefings_delete" ON public.marketing_briefings
  FOR DELETE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'admin'
  );

-- marketing_templates: tenant-isolated, admin manages, all read
CREATE POLICY "templates_select" ON public.marketing_templates
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "templates_insert" ON public.marketing_templates
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "templates_update" ON public.marketing_templates
  FOR UPDATE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "templates_delete" ON public.marketing_templates
  FOR DELETE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'admin'
  );

-- marketing_briefing_links: tenant-isolated
CREATE POLICY "briefing_links_select" ON public.marketing_briefing_links
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "briefing_links_insert" ON public.marketing_briefing_links
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('admin', 'operador')
  );

CREATE POLICY "briefing_links_delete" ON public.marketing_briefing_links
  FOR DELETE USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('admin', 'operador')
  );
