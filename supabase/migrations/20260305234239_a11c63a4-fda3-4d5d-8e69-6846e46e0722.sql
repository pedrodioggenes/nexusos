
-- =====================================================
-- HiperWorks v2 — Core Tables
-- =====================================================

-- hw_departments
CREATE TABLE public.hw_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hw_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_departments_tenant_read" ON public.hw_departments
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "hw_departments_tenant_insert" ON public.hw_departments
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- hw_teams
CREATE TABLE public.hw_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.hw_departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hw_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_teams_tenant_read" ON public.hw_teams
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "hw_teams_tenant_insert" ON public.hw_teams
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "hw_teams_tenant_update" ON public.hw_teams
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- hw_team_members
CREATE TABLE public.hw_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.hw_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);
ALTER TABLE public.hw_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_team_members_read" ON public.hw_team_members
  FOR SELECT TO authenticated
  USING (
    team_id IN (SELECT id FROM public.hw_teams WHERE tenant_id = public.get_user_tenant_id(auth.uid()))
  );

CREATE POLICY "hw_team_members_insert" ON public.hw_team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (SELECT id FROM public.hw_teams WHERE tenant_id = public.get_user_tenant_id(auth.uid()))
  );

CREATE POLICY "hw_team_members_delete" ON public.hw_team_members
  FOR DELETE TO authenticated
  USING (
    team_id IN (SELECT id FROM public.hw_teams WHERE tenant_id = public.get_user_tenant_id(auth.uid()))
  );

-- hw_posts
CREATE TABLE public.hw_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.hw_teams(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post', 'broadcast')),
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  file_url TEXT,
  pinned_until TIMESTAMPTZ,
  read_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hw_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_posts_tenant_read" ON public.hw_posts
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "hw_posts_tenant_insert" ON public.hw_posts
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "hw_posts_author_update" ON public.hw_posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "hw_posts_author_delete" ON public.hw_posts
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- hw_post_reactions
CREATE TABLE public.hw_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.hw_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL DEFAULT '👍',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);
ALTER TABLE public.hw_post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_post_reactions_read" ON public.hw_post_reactions
  FOR SELECT TO authenticated
  USING (
    post_id IN (SELECT id FROM public.hw_posts WHERE tenant_id = public.get_user_tenant_id(auth.uid()))
  );

CREATE POLICY "hw_post_reactions_insert" ON public.hw_post_reactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "hw_post_reactions_delete" ON public.hw_post_reactions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- hw_post_comments
CREATE TABLE public.hw_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.hw_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hw_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_post_comments_read" ON public.hw_post_comments
  FOR SELECT TO authenticated
  USING (
    post_id IN (SELECT id FROM public.hw_posts WHERE tenant_id = public.get_user_tenant_id(auth.uid()))
  );

CREATE POLICY "hw_post_comments_insert" ON public.hw_post_comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- hw_post_reads
CREATE TABLE public.hw_post_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.hw_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.hw_post_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_post_reads_read" ON public.hw_post_reads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "hw_post_reads_insert" ON public.hw_post_reads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- hw_documents
CREATE TABLE public.hw_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  context_type TEXT NOT NULL DEFAULT 'personal' CHECK (context_type IN ('personal', 'team', 'department', 'task', 'rh')),
  context_id UUID,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hw_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_documents_tenant_read" ON public.hw_documents
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "hw_documents_tenant_insert" ON public.hw_documents
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) AND uploaded_by = auth.uid());

CREATE POLICY "hw_documents_owner_delete" ON public.hw_documents
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid());

-- hw_training_assignments
CREATE TABLE public.hw_training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.hw_teams(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  training_title TEXT NOT NULL,
  training_description TEXT,
  mandatory BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.hw_training_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_training_tenant_read" ON public.hw_training_assignments
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "hw_training_tenant_insert" ON public.hw_training_assignments
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) AND assigned_by = auth.uid());

CREATE POLICY "hw_training_user_update" ON public.hw_training_assignments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR assigned_by = auth.uid());

-- hw_candidates
CREATE TABLE public.hw_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT NOT NULL,
  resume_path TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_analise', 'aprovado', 'reprovado')),
  notes TEXT,
  ai_recommended BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hw_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_candidates_tenant_read" ON public.hw_candidates
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "hw_candidates_tenant_insert" ON public.hw_candidates
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "hw_candidates_tenant_update" ON public.hw_candidates
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- hw_notifications (internal to HiperWorks)
CREATE TABLE public.hw_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hw_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hw_notifications_user_read" ON public.hw_notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "hw_notifications_tenant_insert" ON public.hw_notifications
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "hw_notifications_user_update" ON public.hw_notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
