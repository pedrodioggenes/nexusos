-- =============================================
-- SIGMA SISTEMAS - Enterprise Multi-Tenant Architecture - STEP 2B
-- Enable RLS and create policies
-- =============================================

-- 1) Enable RLS on tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2) Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3) Drop existing policies if any (from partial migrations)
DROP POLICY IF EXISTS "Sigma admins can manage all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Sigma admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Sigma admins can manage all roles" ON public.user_roles;

-- 4) RLS Policies for tenants - Sigma admins can manage all
CREATE POLICY "Sigma admins can manage all tenants" 
ON public.tenants 
FOR ALL 
USING (public.is_sigma_admin(auth.uid()));

-- Internal users can view their own tenant
CREATE POLICY "Users can view own tenant"
ON public.tenants
FOR SELECT
USING (
    id = public.get_user_tenant_id(auth.uid())
);

-- 5) RLS Policies for audit_logs
CREATE POLICY "Sigma admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (public.is_sigma_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 6) Update RLS policies for user_roles
CREATE POLICY "Sigma admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_sigma_admin(auth.uid()));