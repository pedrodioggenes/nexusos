
-- Step 1: Create is_araripe_admin as the canonical function
CREATE OR REPLACE FUNCTION public.is_araripe_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND user_type = 'hiper_admin'
  )
$$;

-- Step 2: Make is_sigma_admin a thin wrapper (keeps all policy dependencies working)
CREATE OR REPLACE FUNCTION public.is_sigma_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_araripe_admin(_user_id)
$$;

-- Step 3: Rename all policies with "Sigma" or "sigma" in their names
ALTER POLICY "Sigma admins can manage all tenants" ON public.tenants RENAME TO "Araripe admins can manage all tenants";
ALTER POLICY "Sigma admins can view all audit logs" ON public.audit_logs RENAME TO "Araripe admins can view all audit logs";
ALTER POLICY "Sigma admins can manage all roles" ON public.user_roles RENAME TO "Araripe admins can manage all roles";
ALTER POLICY "Sigma admins can view all campaigns" ON public.campaigns RENAME TO "Araripe admins can view all campaigns";
ALTER POLICY "Sigma admins can view all campaign_units" ON public.campaign_units RENAME TO "Araripe admins can view all campaign_units";
ALTER POLICY "Sigma admins can view all contacts" ON public.contacts RENAME TO "Araripe admins can view all contacts";
ALTER POLICY "Sigma admins can view all message_logs" ON public.message_logs RENAME TO "Araripe admins can view all message_logs";
ALTER POLICY "Sigma admins can view all subscriptions" ON public.subscriptions RENAME TO "Araripe admins can view all subscriptions";
ALTER POLICY "Sigma admins can view all units" ON public.units RENAME TO "Araripe admins can view all units";
ALTER POLICY "sigma_admin_read" ON public.system_settings RENAME TO "araripe_admin_read";
ALTER POLICY "sigma_admin_update" ON public.system_settings RENAME TO "araripe_admin_update";
ALTER POLICY "Only sigma admins can read system settings" ON public.system_settings RENAME TO "Only araripe admins can read system settings";
ALTER POLICY "Sigma admins can manage all quotas" ON public.tenant_quotas RENAME TO "Araripe admins can manage all quotas";
ALTER POLICY "Sigma admins can manage all jobs" ON public.scheduled_jobs RENAME TO "Araripe admins can manage all jobs";
ALTER POLICY "Sigma admins can view all audit logs" ON public.system_audit_log RENAME TO "Araripe admins can view all audit logs";
ALTER POLICY "Sigma admins can manage all integrations" ON public.integration_configs RENAME TO "Araripe admins can manage all integrations";
