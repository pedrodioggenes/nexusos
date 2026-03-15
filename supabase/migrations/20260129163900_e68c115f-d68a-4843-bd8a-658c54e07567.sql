-- Drop existing SELECT policies and recreate with null tenant_id support for demo data

-- Marketing KPIs
DROP POLICY IF EXISTS "Internal users can view KPIs" ON public.marketing_kpis;
CREATE POLICY "Internal users can view KPIs" 
ON public.marketing_kpis FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Marketing Budgets  
DROP POLICY IF EXISTS "Internal users can view budgets" ON public.marketing_budgets;
CREATE POLICY "Internal users can view budgets" 
ON public.marketing_budgets FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Marketing Plans
DROP POLICY IF EXISTS "Internal users can view plans" ON public.marketing_plans;
CREATE POLICY "Internal users can view plans" 
ON public.marketing_plans FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Marketing Alerts
DROP POLICY IF EXISTS "Internal users can view alerts" ON public.marketing_alerts;
CREATE POLICY "Internal users can view alerts" 
ON public.marketing_alerts FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Marketing Goals
DROP POLICY IF EXISTS "Internal users can view goals" ON public.marketing_goals;
CREATE POLICY "Internal users can view goals" 
ON public.marketing_goals FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Marketing Coop Funds
DROP POLICY IF EXISTS "Internal users can view coop funds" ON public.marketing_coop_funds;
CREATE POLICY "Internal users can view coop funds" 
ON public.marketing_coop_funds FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Marketing Campaigns
DROP POLICY IF EXISTS "Internal users can view campaigns" ON public.marketing_campaigns;
CREATE POLICY "Internal users can view campaigns" 
ON public.marketing_campaigns FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Marketing AI Insights
DROP POLICY IF EXISTS "Internal users can view insights" ON public.marketing_ai_insights;
CREATE POLICY "Internal users can view insights" 
ON public.marketing_ai_insights FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Marketing Store Performance
DROP POLICY IF EXISTS "Internal users can view store performance" ON public.marketing_store_performance;
CREATE POLICY "Internal users can view store performance" 
ON public.marketing_store_performance FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Suppliers (allow null tenant for demo)
DROP POLICY IF EXISTS "Internal users can view suppliers" ON public.suppliers;
CREATE POLICY "Internal users can view suppliers" 
ON public.suppliers FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Team Tasks
DROP POLICY IF EXISTS "Internal users can view tasks" ON public.team_tasks;
CREATE POLICY "Internal users can view tasks" 
ON public.team_tasks FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Team Content Calendar
DROP POLICY IF EXISTS "Internal users can view content calendar" ON public.team_content_calendar;
CREATE POLICY "Internal users can view content calendar" 
ON public.team_content_calendar FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Team Brand Assets
DROP POLICY IF EXISTS "Internal users can view brand assets" ON public.team_brand_assets;
CREATE POLICY "Internal users can view brand assets" 
ON public.team_brand_assets FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);