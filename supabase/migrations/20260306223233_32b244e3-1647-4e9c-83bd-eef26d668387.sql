
-- OKRs / Goals
CREATE TABLE public.hw_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC DEFAULT 100,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '%',
  period TEXT NOT NULL DEFAULT 'Q1-2026',
  status TEXT NOT NULL DEFAULT 'active',
  parent_goal_id UUID REFERENCES public.hw_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hw_key_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.hw_goals(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 100,
  current NUMERIC NOT NULL DEFAULT 0,
  weight NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gamification
CREATE TABLE public.hw_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  criteria_type TEXT NOT NULL DEFAULT 'manual',
  criteria_value JSONB DEFAULT '{}',
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hw_user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.hw_achievements(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Digital Signatures
CREATE TABLE public.hw_document_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  document_id UUID NOT NULL,
  document_title TEXT NOT NULL DEFAULT 'Documento',
  signer_id UUID NOT NULL,
  requested_by UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  signed_at TIMESTAMPTZ,
  ip_address TEXT,
  signature_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.hw_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hw_key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hw_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hw_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hw_document_signatures ENABLE ROW LEVEL SECURITY;

-- Goals RLS
CREATE POLICY "Users can view goals in their tenant" ON public.hw_goals
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can manage their own goals" ON public.hw_goals
  FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Key Results RLS
CREATE POLICY "Users can view key results in their tenant" ON public.hw_key_results
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can manage key results in their tenant" ON public.hw_key_results
  FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Achievements RLS
CREATE POLICY "Users can view achievements in their tenant" ON public.hw_achievements
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can manage achievements in their tenant" ON public.hw_achievements
  FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- User Badges RLS
CREATE POLICY "Users can view badges in their tenant" ON public.hw_user_badges
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can manage badges in their tenant" ON public.hw_user_badges
  FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Document Signatures RLS
CREATE POLICY "Users can view signatures in their tenant" ON public.hw_document_signatures
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can manage signatures in their tenant" ON public.hw_document_signatures
  FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
