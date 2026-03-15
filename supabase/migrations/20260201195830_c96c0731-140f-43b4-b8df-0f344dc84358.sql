
-- =========================================================
-- Security Fix: Remove public access to sensitive data
-- =========================================================

-- 1. Drop the dangerous public policy that exposes admin access code
DROP POLICY IF EXISTS "public_read_access_code" ON public.system_settings;

-- 2. Create a secure policy: only sigma admins can read system_settings
-- This replaces the public policy with one requiring authentication
CREATE POLICY "Only sigma admins can read system settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (is_sigma_admin(auth.uid()));

-- 3. Fix marketing_campaigns: drop overly permissive policies
DROP POLICY IF EXISTS "Internal users can view campaigns" ON public.marketing_campaigns;

-- 4. Create a stricter policy that requires actual authentication
-- Users must be authenticated AND belong to the tenant or be sigma admin
CREATE POLICY "Authenticated internal users can view campaigns"
ON public.marketing_campaigns
FOR SELECT
TO authenticated
USING (
  (get_user_type(auth.uid()) = 'internal'::user_type AND tenant_id = get_user_tenant_id(auth.uid()))
  OR is_sigma_admin(auth.uid())
);
