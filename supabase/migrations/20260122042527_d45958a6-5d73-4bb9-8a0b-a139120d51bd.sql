-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admins can manage insights" ON public.marketing_ai_insights;

-- Create separate policies for different operations

-- Anyone authenticated can create insights (for AI-generated insights)
CREATE POLICY "Users can create insights" 
ON public.marketing_ai_insights 
FOR INSERT 
WITH CHECK (true);

-- Users can view their tenant's insights or public insights (tenant_id is null)
CREATE POLICY "Users can view insights" 
ON public.marketing_ai_insights 
FOR SELECT 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Users can update (dismiss) insights they can see
CREATE POLICY "Users can update insights" 
ON public.marketing_ai_insights 
FOR UPDATE 
USING (
  tenant_id IS NULL 
  OR tenant_id = get_user_tenant_id(auth.uid()) 
  OR is_sigma_admin(auth.uid())
);

-- Admins can delete insights
CREATE POLICY "Admins can delete insights" 
ON public.marketing_ai_insights 
FOR DELETE 
USING (
  (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
  OR is_sigma_admin(auth.uid())
);

-- Also drop the old select policy since we're creating a new one
DROP POLICY IF EXISTS "Internal users can view insights" ON public.marketing_ai_insights;