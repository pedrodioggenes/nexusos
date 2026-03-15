-- =============================================
-- TEAM MANAGEMENT TABLES FOR HIPERGESTÃO
-- =============================================

-- 1. TEAM TASKS - Sistema unificado de tarefas da equipe
CREATE TABLE public.team_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('social', 'traffic', 'design', 'copy')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'approved', 'done')),
  assigned_to UUID,
  deadline TIMESTAMPTZ,
  estimated_hours DECIMAL,
  actual_hours DECIMAL,
  platforms TEXT[] DEFAULT '{}',
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.team_tasks(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]',
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected', 'revision')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  revision_notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. TEAM CONTENT CALENDAR - Calendário de conteúdo
CREATE TABLE public.team_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'story', 'reel', 'video', 'email', 'ad', 'blog', 'newsletter')),
  platform TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')),
  task_id UUID REFERENCES public.team_tasks(id) ON DELETE SET NULL,
  copy_text TEXT,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. TEAM PLATFORM METRICS - Métricas de plataformas
CREATE TABLE public.team_platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  metric_date DATE NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'api', 'import')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, platform, metric_type, metric_date)
);

-- 4. TEAM BRAND ASSETS - Biblioteca de assets da marca
CREATE TABLE public.team_brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'font', 'color', 'template', 'image', 'video', 'document', 'guideline')),
  file_url TEXT,
  thumbnail_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  usage_guidelines TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_team_tasks_updated_at
  BEFORE UPDATE ON public.team_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_content_calendar_updated_at
  BEFORE UPDATE ON public.team_content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_brand_assets_updated_at
  BEFORE UPDATE ON public.team_brand_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ENABLE RLS
-- =============================================

ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_brand_assets ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - TEAM TASKS
-- =============================================

CREATE POLICY "Internal users can view team tasks"
  ON public.team_tasks FOR SELECT
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    OR is_sigma_admin(auth.uid())
  );

CREATE POLICY "Admins and operators can manage team tasks"
  ON public.team_tasks FOR ALL
  USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador')))
    OR is_sigma_admin(auth.uid())
  );

-- =============================================
-- RLS POLICIES - CONTENT CALENDAR
-- =============================================

CREATE POLICY "Internal users can view content calendar"
  ON public.team_content_calendar FOR SELECT
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    OR is_sigma_admin(auth.uid())
  );

CREATE POLICY "Admins and operators can manage content calendar"
  ON public.team_content_calendar FOR ALL
  USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador')))
    OR is_sigma_admin(auth.uid())
  );

-- =============================================
-- RLS POLICIES - PLATFORM METRICS
-- =============================================

CREATE POLICY "Internal users can view platform metrics"
  ON public.team_platform_metrics FOR SELECT
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    OR is_sigma_admin(auth.uid())
  );

CREATE POLICY "Admins can manage platform metrics"
  ON public.team_platform_metrics FOR ALL
  USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
    OR is_sigma_admin(auth.uid())
  );

-- =============================================
-- RLS POLICIES - BRAND ASSETS
-- =============================================

CREATE POLICY "Internal users can view brand assets"
  ON public.team_brand_assets FOR SELECT
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    OR is_sigma_admin(auth.uid())
  );

CREATE POLICY "Admins can manage brand assets"
  ON public.team_brand_assets FOR ALL
  USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
    OR is_sigma_admin(auth.uid())
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_team_tasks_tenant_type ON public.team_tasks(tenant_id, task_type);
CREATE INDEX idx_team_tasks_status ON public.team_tasks(status);
CREATE INDEX idx_team_tasks_assigned ON public.team_tasks(assigned_to);
CREATE INDEX idx_team_tasks_deadline ON public.team_tasks(deadline);

CREATE INDEX idx_team_content_calendar_tenant ON public.team_content_calendar(tenant_id);
CREATE INDEX idx_team_content_calendar_date ON public.team_content_calendar(scheduled_date);
CREATE INDEX idx_team_content_calendar_platform ON public.team_content_calendar(platform);

CREATE INDEX idx_team_platform_metrics_lookup ON public.team_platform_metrics(tenant_id, platform, metric_date);

CREATE INDEX idx_team_brand_assets_tenant ON public.team_brand_assets(tenant_id);
CREATE INDEX idx_team_brand_assets_type ON public.team_brand_assets(asset_type);