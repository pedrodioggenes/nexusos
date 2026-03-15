
-- Fix social_media_connections RLS policies (they reference profiles.id instead of user_roles for tenant)
DROP POLICY IF EXISTS "Usuários podem ver conexões do seu tenant" ON social_media_connections;
DROP POLICY IF EXISTS "Usuários podem criar conexões do seu tenant" ON social_media_connections;
DROP POLICY IF EXISTS "Usuários podem atualizar conexões do seu tenant" ON social_media_connections;
DROP POLICY IF EXISTS "Usuários podem deletar conexões do seu tenant" ON social_media_connections;

CREATE POLICY "Users can view own tenant connections" ON social_media_connections
  FOR SELECT USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Users can create own tenant connections" ON social_media_connections
  FOR INSERT WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Users can update own tenant connections" ON social_media_connections
  FOR UPDATE USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

CREATE POLICY "Users can delete own tenant connections" ON social_media_connections
  FOR DELETE USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()));

-- Fix social_media_metrics RLS policies
DROP POLICY IF EXISTS "Usuários podem ver métricas das suas conexões" ON social_media_metrics;
DROP POLICY IF EXISTS "Usuários podem inserir métricas das suas conexões" ON social_media_metrics;

CREATE POLICY "Users can view own tenant metrics" ON social_media_metrics
  FOR SELECT USING (
    connection_id IN (
      SELECT id FROM social_media_connections 
      WHERE tenant_id = get_user_tenant_id(auth.uid())
    ) OR is_sigma_admin(auth.uid())
  );

CREATE POLICY "Users can insert own tenant metrics" ON social_media_metrics
  FOR INSERT WITH CHECK (
    connection_id IN (
      SELECT id FROM social_media_connections 
      WHERE tenant_id = get_user_tenant_id(auth.uid())
    ) OR is_sigma_admin(auth.uid())
  );

CREATE POLICY "Users can update own tenant metrics" ON social_media_metrics
  FOR UPDATE USING (
    connection_id IN (
      SELECT id FROM social_media_connections 
      WHERE tenant_id = get_user_tenant_id(auth.uid())
    ) OR is_sigma_admin(auth.uid())
  );

-- Add operador role to marketing_campaigns ALL policy (currently only admin)
DROP POLICY IF EXISTS "Admins and operators can manage marketing campaigns" ON marketing_campaigns;
CREATE POLICY "Admins and operators can manage marketing campaigns" ON marketing_campaigns
  FOR ALL USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador')))
    OR is_sigma_admin(auth.uid())
  );

-- Add operador role to marketing_budgets ALL policy
DROP POLICY IF EXISTS "Admins can manage budgets" ON marketing_budgets;
CREATE POLICY "Admins and operators can manage budgets" ON marketing_budgets
  FOR ALL USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador')))
    OR is_sigma_admin(auth.uid())
  );

-- Add operador role to marketing_plans ALL policy
DROP POLICY IF EXISTS "Admins can manage plans" ON marketing_plans;
CREATE POLICY "Admins and operators can manage plans" ON marketing_plans
  FOR ALL USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operador')))
    OR is_sigma_admin(auth.uid())
  );
