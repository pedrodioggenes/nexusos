-- ============================================
-- PHASE 1: ENTERPRISE GOVERNANCE FOUNDATION
-- Strong RBAC, Audit, Quotas, and Job Scheduling
-- ============================================

-- 1. TENANT QUOTAS & USAGE TRACKING
-- Tracks limits and usage per tenant
CREATE TABLE IF NOT EXISTS public.tenant_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- AI Usage Limits
  ai_queries_monthly_limit INTEGER NOT NULL DEFAULT 1000,
  ai_queries_used INTEGER NOT NULL DEFAULT 0,
  ai_queries_reset_at TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + interval '1 month',
  
  -- Campaign Limits
  campaigns_monthly_limit INTEGER NOT NULL DEFAULT 100,
  campaigns_used INTEGER NOT NULL DEFAULT 0,
  campaigns_reset_at TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()) + interval '1 month',
  
  -- Storage Limits (in bytes)
  storage_limit_bytes BIGINT NOT NULL DEFAULT 5368709120, -- 5GB
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  
  -- Feature Flags
  features_enabled JSONB NOT NULL DEFAULT '{
    "hiperia": true,
    "hipergestao": true,
    "hipertrade": true,
    "hiperofertas": true,
    "advanced_analytics": false,
    "api_access": false,
    "whatsapp_integration": false,
    "erp_integration": false
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_tenant_quotas UNIQUE(tenant_id)
);

-- Enable RLS on tenant_quotas
ALTER TABLE public.tenant_quotas ENABLE ROW LEVEL SECURITY;

-- 2. SCHEDULED JOBS TABLE
-- For reliable job scheduling with retries and status tracking
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Job Definition
  job_type TEXT NOT NULL, -- 'insight_generation', 'report_export', 'data_sync', etc.
  job_name TEXT NOT NULL,
  job_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Scheduling
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('once', 'daily', 'weekly', 'monthly', 'cron')),
  cron_expression TEXT, -- For cron-type schedules
  scheduled_at TIMESTAMPTZ, -- For one-time jobs
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  
  -- Execution
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  
  -- Results
  last_result JSONB,
  last_error TEXT,
  
  -- Metadata
  created_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on scheduled_jobs
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- 3. ENHANCED AUDIT LOG (Append-Only)
-- Immutable audit trail for all critical actions
CREATE TABLE IF NOT EXISTS public.system_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who
  user_id UUID NOT NULL,
  user_email TEXT,
  user_type TEXT,
  tenant_id UUID,
  
  -- What
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject', 'login', 'logout', etc.
  resource_type TEXT NOT NULL, -- 'campaign', 'package', 'proof', 'user', etc.
  resource_id UUID,
  resource_name TEXT,
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  
  -- Severity
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  
  -- Timestamp (immutable)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_system_audit_log_user_id ON public.system_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_log_tenant_id ON public.system_audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_log_resource ON public.system_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_system_audit_log_created_at ON public.system_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_audit_log_action ON public.system_audit_log(action);

-- Enable RLS on system_audit_log
ALTER TABLE public.system_audit_log ENABLE ROW LEVEL SECURITY;

-- 4. INTEGRATION STUBS TABLE
-- For future WhatsApp and ERP integrations
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  
  -- Integration Type
  integration_type TEXT NOT NULL CHECK (integration_type IN ('whatsapp', 'erp_winthor', 'erp_totvs', 'webhook')),
  integration_name TEXT NOT NULL,
  
  -- Configuration (encrypted in production)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  credentials JSONB, -- Store encrypted references, not actual secrets
  
  -- Status
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  is_configured BOOLEAN NOT NULL DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  
  -- Metadata
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_tenant_integration UNIQUE(tenant_id, integration_type)
);

-- Enable RLS on integration_configs
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

-- 5. ENHANCED USER PREFERENCES FOR TABLE STATE
-- Persist user's table preferences (columns, sorting, filters)
CREATE TABLE IF NOT EXISTS public.user_table_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  table_id TEXT NOT NULL, -- Unique identifier for the table in the app
  
  -- Preferences
  visible_columns JSONB, -- Array of column ids
  column_order JSONB, -- Array of column ids in order
  sort_config JSONB, -- {column: string, direction: 'asc' | 'desc'}
  filter_config JSONB, -- Saved filters
  page_size INTEGER DEFAULT 25,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_table UNIQUE(user_id, table_id)
);

-- Enable RLS on user_table_preferences
ALTER TABLE public.user_table_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Tenant Quotas Policies
CREATE POLICY "Sigma admins can manage all quotas"
  ON public.tenant_quotas FOR ALL
  USING (is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant users can view their own quotas"
  ON public.tenant_quotas FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- Scheduled Jobs Policies
CREATE POLICY "Sigma admins can manage all jobs"
  ON public.scheduled_jobs FOR ALL
  USING (is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage their jobs"
  ON public.scheduled_jobs FOR ALL
  USING (
    tenant_id = get_user_tenant_id(auth.uid()) 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Tenant users can view their jobs"
  ON public.scheduled_jobs FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- System Audit Log Policies (Read-only for users, append-only via functions)
CREATE POLICY "Sigma admins can view all audit logs"
  ON public.system_audit_log FOR SELECT
  USING (is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant admins can view their audit logs"
  ON public.system_audit_log FOR SELECT
  USING (
    tenant_id = get_user_tenant_id(auth.uid())
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "System can insert audit logs"
  ON public.system_audit_log FOR INSERT
  WITH CHECK (user_id = auth.uid() OR (auth.jwt() ->> 'role')::text = 'service_role');

-- Integration Configs Policies
CREATE POLICY "Sigma admins can manage all integrations"
  ON public.integration_configs FOR ALL
  USING (is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage their integrations"
  ON public.integration_configs FOR ALL
  USING (
    tenant_id = get_user_tenant_id(auth.uid())
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Tenant users can view their integrations"
  ON public.integration_configs FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()));

-- User Table Preferences Policies
CREATE POLICY "Users can manage their own table preferences"
  ON public.user_table_preferences FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- SECURITY DEFINER FUNCTIONS
-- ============================================

-- Function to log audit entries (Security Definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_resource_name TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_type TEXT;
  v_tenant_id UUID;
  v_audit_id UUID;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();
  
  SELECT email INTO v_user_email 
  FROM auth.users 
  WHERE id = v_user_id;
  
  SELECT user_type::TEXT, tenant_id INTO v_user_type, v_tenant_id
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  -- Insert audit log
  INSERT INTO public.system_audit_log (
    user_id, user_email, user_type, tenant_id,
    action, resource_type, resource_id, resource_name,
    old_values, new_values, metadata, severity
  ) VALUES (
    v_user_id, v_user_email, v_user_type, v_tenant_id,
    p_action, p_resource_type, p_resource_id, p_resource_name,
    p_old_values, p_new_values, p_metadata, p_severity
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Function to check and increment quota usage
CREATE OR REPLACE FUNCTION public.check_quota(
  p_tenant_id UUID,
  p_quota_type TEXT -- 'ai_queries', 'campaigns', 'storage'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quota RECORD;
  v_can_use BOOLEAN := false;
BEGIN
  -- Get current quota
  SELECT * INTO v_quota
  FROM public.tenant_quotas
  WHERE tenant_id = p_tenant_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    -- Create default quota for tenant
    INSERT INTO public.tenant_quotas (tenant_id)
    VALUES (p_tenant_id);
    RETURN true;
  END IF;
  
  -- Check and reset if needed
  CASE p_quota_type
    WHEN 'ai_queries' THEN
      IF v_quota.ai_queries_reset_at <= now() THEN
        UPDATE public.tenant_quotas
        SET ai_queries_used = 0,
            ai_queries_reset_at = date_trunc('month', now()) + interval '1 month'
        WHERE tenant_id = p_tenant_id;
        v_can_use := true;
      ELSE
        v_can_use := v_quota.ai_queries_used < v_quota.ai_queries_monthly_limit;
      END IF;
      
      IF v_can_use THEN
        UPDATE public.tenant_quotas
        SET ai_queries_used = ai_queries_used + 1
        WHERE tenant_id = p_tenant_id;
      END IF;
      
    WHEN 'campaigns' THEN
      IF v_quota.campaigns_reset_at <= now() THEN
        UPDATE public.tenant_quotas
        SET campaigns_used = 0,
            campaigns_reset_at = date_trunc('month', now()) + interval '1 month'
        WHERE tenant_id = p_tenant_id;
        v_can_use := true;
      ELSE
        v_can_use := v_quota.campaigns_used < v_quota.campaigns_monthly_limit;
      END IF;
      
      IF v_can_use THEN
        UPDATE public.tenant_quotas
        SET campaigns_used = campaigns_used + 1
        WHERE tenant_id = p_tenant_id;
      END IF;
      
    WHEN 'storage' THEN
      v_can_use := v_quota.storage_used_bytes < v_quota.storage_limit_bytes;
  END CASE;
  
  RETURN v_can_use;
END;
$$;

-- Function to get usage metrics
CREATE OR REPLACE FUNCTION public.get_usage_metrics(p_tenant_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_quota RECORD;
  v_result JSONB;
BEGIN
  -- Use provided tenant_id or get from user
  v_tenant_id := COALESCE(p_tenant_id, get_user_tenant_id(auth.uid()));
  
  IF v_tenant_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT * INTO v_quota
  FROM public.tenant_quotas
  WHERE tenant_id = v_tenant_id;
  
  IF NOT FOUND THEN
    -- Create default quota
    INSERT INTO public.tenant_quotas (tenant_id)
    VALUES (v_tenant_id)
    RETURNING * INTO v_quota;
  END IF;
  
  v_result := jsonb_build_object(
    'ai_queries', jsonb_build_object(
      'used', v_quota.ai_queries_used,
      'limit', v_quota.ai_queries_monthly_limit,
      'percentage', ROUND((v_quota.ai_queries_used::NUMERIC / NULLIF(v_quota.ai_queries_monthly_limit, 0)) * 100, 1),
      'reset_at', v_quota.ai_queries_reset_at
    ),
    'campaigns', jsonb_build_object(
      'used', v_quota.campaigns_used,
      'limit', v_quota.campaigns_monthly_limit,
      'percentage', ROUND((v_quota.campaigns_used::NUMERIC / NULLIF(v_quota.campaigns_monthly_limit, 0)) * 100, 1),
      'reset_at', v_quota.campaigns_reset_at
    ),
    'storage', jsonb_build_object(
      'used_bytes', v_quota.storage_used_bytes,
      'limit_bytes', v_quota.storage_limit_bytes,
      'used_formatted', pg_size_pretty(v_quota.storage_used_bytes),
      'limit_formatted', pg_size_pretty(v_quota.storage_limit_bytes),
      'percentage', ROUND((v_quota.storage_used_bytes::NUMERIC / NULLIF(v_quota.storage_limit_bytes, 0)) * 100, 1)
    ),
    'features', v_quota.features_enabled
  );
  
  RETURN v_result;
END;
$$;

-- Function to check if module is enabled for tenant
CREATE OR REPLACE FUNCTION public.is_module_enabled(
  p_user_id UUID,
  p_module TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenants t
    JOIN public.user_roles ur ON ur.tenant_id = t.id
    WHERE ur.user_id = p_user_id
      AND p_module = ANY(t.modules_enabled)
  )
$$;

-- Function to check feature flag
CREATE OR REPLACE FUNCTION public.is_feature_enabled(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_enabled BOOLEAN;
BEGIN
  SELECT tenant_id INTO v_tenant_id
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  IF v_tenant_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT (features_enabled ->> p_feature)::BOOLEAN INTO v_enabled
  FROM public.tenant_quotas
  WHERE tenant_id = v_tenant_id;
  
  RETURN COALESCE(v_enabled, false);
END;
$$;

-- ============================================
-- TRIGGERS FOR AUTOMATIC AUDITING
-- ============================================

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.trigger_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action TEXT;
  v_old_values JSONB;
  v_new_values JSONB;
BEGIN
  v_action := TG_OP;
  
  IF TG_OP = 'DELETE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := NULL;
    
    PERFORM log_audit(
      'delete',
      TG_TABLE_NAME,
      OLD.id,
      NULL,
      v_old_values,
      NULL,
      jsonb_build_object('trigger', TG_NAME)
    );
    
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    
    PERFORM log_audit(
      'update',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      v_old_values,
      v_new_values,
      jsonb_build_object('trigger', TG_NAME)
    );
    
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_values := NULL;
    v_new_values := to_jsonb(NEW);
    
    PERFORM log_audit(
      'create',
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      NULL,
      v_new_values,
      jsonb_build_object('trigger', TG_NAME)
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_marketing_campaigns
  AFTER INSERT OR UPDATE OR DELETE ON public.marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_trade_packages
  AFTER INSERT OR UPDATE OR DELETE ON public.trade_packages
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_trade_proofs
  AFTER INSERT OR UPDATE OR DELETE ON public.trade_proofs
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_suppliers
  AFTER INSERT OR UPDATE OR DELETE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_tenants
  AFTER INSERT OR UPDATE OR DELETE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION trigger_audit_log();

-- ============================================
-- UPDATE TIMESTAMPS TRIGGERS
-- ============================================

CREATE TRIGGER update_tenant_quotas_updated_at
  BEFORE UPDATE ON public.tenant_quotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_table_preferences_updated_at
  BEFORE UPDATE ON public.user_table_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();