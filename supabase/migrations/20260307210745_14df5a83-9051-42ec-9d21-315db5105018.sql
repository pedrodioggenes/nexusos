
-- =============================================
-- Goals System Enhancement: scopes, campaigns, badges, checkins
-- =============================================

-- 1. Add new columns to hw_goals
ALTER TABLE public.hw_goals
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS scope_target_id uuid NULL,
  ADD COLUMN IF NOT EXISTS assigned_to uuid NULL,
  ADD COLUMN IF NOT EXISTS deadline date NULL,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS campaign_id uuid NULL;

-- Add unit column to hw_key_results
ALTER TABLE public.hw_key_results
  ADD COLUMN IF NOT EXISTS unit text NOT NULL DEFAULT '%';

-- 2. Goal Checkins
CREATE TABLE IF NOT EXISTS public.hw_goal_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.hw_goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  note text,
  progress_snapshot numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hw_goal_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant checkins"
  ON public.hw_goal_checkins FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can insert own checkins"
  ON public.hw_goal_checkins FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND tenant_id = public.get_user_tenant_id(auth.uid()));

-- 3. Goal Campaigns
CREATE TABLE IF NOT EXISTS public.hw_goal_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  scope_required text NOT NULL DEFAULT 'personal',
  min_goals_required integer NOT NULL DEFAULT 1,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  reward_description text,
  reward_badge_name text,
  created_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hw_goal_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant campaigns"
  ON public.hw_goal_campaigns FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Leaders can create campaigns"
  ON public.hw_goal_campaigns FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) IN ('diretor', 'secretaria')
  );

CREATE POLICY "Leaders can update campaigns"
  ON public.hw_goal_campaigns FOR UPDATE TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_department_role(auth.uid()) IN ('diretor', 'secretaria')
  );

-- 4. Campaign Participants
CREATE TABLE IF NOT EXISTS public.hw_goal_campaign_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.hw_goal_campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  goals_created_count integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

ALTER TABLE public.hw_goal_campaign_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant participants"
  ON public.hw_goal_campaign_participants FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can join campaigns"
  ON public.hw_goal_campaign_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update own participation"
  ON public.hw_goal_campaign_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 5. Goal Badges
CREATE TABLE IF NOT EXISTS public.hw_goal_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  badge_key text NOT NULL,
  badge_label text NOT NULL,
  badge_icon text NOT NULL DEFAULT 'Trophy',
  badge_color text NOT NULL DEFAULT '#EA580C',
  earned_at timestamptz NOT NULL DEFAULT now(),
  goal_id uuid REFERENCES public.hw_goals(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES public.hw_goal_campaigns(id) ON DELETE SET NULL,
  UNIQUE(user_id, badge_key)
);

ALTER TABLE public.hw_goal_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant badges"
  ON public.hw_goal_badges FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "System can insert badges"
  ON public.hw_goal_badges FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 6. Add FK for campaign_id on hw_goals
ALTER TABLE public.hw_goals
  ADD CONSTRAINT hw_goals_campaign_id_fkey
  FOREIGN KEY (campaign_id) REFERENCES public.hw_goal_campaigns(id) ON DELETE SET NULL;

-- 7. Update RLS on hw_goals to support scope visibility
DROP POLICY IF EXISTS "Users can view own tenant goals" ON public.hw_goals;
CREATE POLICY "Users can view own tenant goals"
  ON public.hw_goals FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

DROP POLICY IF EXISTS "Users can insert goals" ON public.hw_goals;
CREATE POLICY "Users can insert goals"
  ON public.hw_goals FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update own goals" ON public.hw_goals;
CREATE POLICY "Users can update own goals"
  ON public.hw_goals FOR UPDATE TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (user_id = auth.uid() OR public.get_user_department_role(auth.uid()) IN ('diretor', 'secretaria', 'gestor', 'gestor_marketing', 'supervisor'))
  );

DROP POLICY IF EXISTS "Users can delete own goals" ON public.hw_goals;
CREATE POLICY "Users can delete own goals"
  ON public.hw_goals FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND tenant_id = public.get_user_tenant_id(auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hw_goals_scope ON public.hw_goals(scope);
CREATE INDEX IF NOT EXISTS idx_hw_goals_user ON public.hw_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_hw_goals_tenant ON public.hw_goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hw_goal_checkins_goal ON public.hw_goal_checkins(goal_id);
CREATE INDEX IF NOT EXISTS idx_hw_goal_campaigns_tenant ON public.hw_goal_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hw_goal_badges_user ON public.hw_goal_badges(user_id);
