-- =============================================
-- ENTERPRISE EVOLUTION MIGRATION
-- Fixes for Phases 1-2: Governance & Job Engine
-- =============================================

-- =============================================
-- PHASE 1.1: Audit Log Immutability
-- =============================================

-- Make user_id nullable for system/service_role operations
ALTER TABLE public.system_audit_log 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add default NULL handling for system operations
COMMENT ON COLUMN public.system_audit_log.user_id IS 'User ID performing the action. NULL for system/service_role operations.';

-- Create trigger to prevent UPDATE/DELETE on audit logs (true immutability)
CREATE OR REPLACE FUNCTION public.prevent_audit_mutations()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'system_audit_log is immutable - % operations are not allowed', TG_OP;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply immutability trigger
DROP TRIGGER IF EXISTS enforce_audit_immutability ON public.system_audit_log;
CREATE TRIGGER enforce_audit_immutability
  BEFORE UPDATE OR DELETE ON public.system_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_mutations();

-- Add performance indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_system_audit_log_tenant_created 
  ON public.system_audit_log (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_audit_log_resource 
  ON public.system_audit_log (resource_type, resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_audit_log_user 
  ON public.system_audit_log (user_id, created_at DESC) 
  WHERE user_id IS NOT NULL;

-- Update log_audit function to handle NULL user_id gracefully
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT, 
  p_resource_type TEXT, 
  p_resource_id UUID DEFAULT NULL, 
  p_resource_name TEXT DEFAULT NULL, 
  p_old_values JSONB DEFAULT NULL, 
  p_new_values JSONB DEFAULT NULL, 
  p_metadata JSONB DEFAULT '{}'::JSONB, 
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_type TEXT;
  v_tenant_id UUID;
  v_audit_id UUID;
  v_final_metadata JSONB;
BEGIN
  -- Get current user info (may be NULL for service_role)
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email 
    FROM auth.users 
    WHERE id = v_user_id;
    
    SELECT user_type::TEXT, tenant_id INTO v_user_type, v_tenant_id
    FROM public.user_roles
    WHERE user_id = v_user_id
    LIMIT 1;
  ELSE
    -- Mark as system operation
    v_user_email := 'system';
    v_user_type := 'system';
    v_tenant_id := NULL;
  END IF;
  
  -- Add actor info to metadata for traceability
  v_final_metadata := COALESCE(p_metadata, '{}'::JSONB) || jsonb_build_object(
    'actor_type', CASE WHEN v_user_id IS NULL THEN 'system' ELSE 'user' END
  );
  
  -- Insert audit log
  INSERT INTO public.system_audit_log (
    user_id, user_email, user_type, tenant_id,
    action, resource_type, resource_id, resource_name,
    old_values, new_values, metadata, severity
  ) VALUES (
    v_user_id, v_user_email, v_user_type, v_tenant_id,
    p_action, p_resource_type, p_resource_id, p_resource_name,
    p_old_values, p_new_values, v_final_metadata, p_severity
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- =============================================
-- PHASE 1.2: Atomic Quota Check with First Use Fix
-- =============================================

CREATE OR REPLACE FUNCTION public.check_quota(p_tenant_id UUID, p_quota_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_quota RECORD;
  v_can_use BOOLEAN := false;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- Atomic upsert to ensure row exists
  INSERT INTO public.tenant_quotas (tenant_id)
  VALUES (p_tenant_id)
  ON CONFLICT (tenant_id) DO NOTHING;
  
  -- Lock row for atomic update
  SELECT * INTO v_quota
  FROM public.tenant_quotas
  WHERE tenant_id = p_tenant_id
  FOR UPDATE;
  
  -- Check and update based on quota type
  CASE p_quota_type
    WHEN 'ai_queries' THEN
      -- Check if period needs reset
      IF v_quota.ai_queries_reset_at <= v_now THEN
        -- Reset and consume 1
        UPDATE public.tenant_quotas
        SET ai_queries_used = 1,
            ai_queries_reset_at = date_trunc('month', v_now) + interval '1 month'
        WHERE tenant_id = p_tenant_id;
        v_can_use := true;
      ELSIF v_quota.ai_queries_used < v_quota.ai_queries_monthly_limit THEN
        -- Within limits, consume 1
        UPDATE public.tenant_quotas
        SET ai_queries_used = ai_queries_used + 1
        WHERE tenant_id = p_tenant_id;
        v_can_use := true;
      ELSE
        v_can_use := false;
      END IF;
      
    WHEN 'campaigns' THEN
      IF v_quota.campaigns_reset_at <= v_now THEN
        UPDATE public.tenant_quotas
        SET campaigns_used = 1,
            campaigns_reset_at = date_trunc('month', v_now) + interval '1 month'
        WHERE tenant_id = p_tenant_id;
        v_can_use := true;
      ELSIF v_quota.campaigns_used < v_quota.campaigns_monthly_limit THEN
        UPDATE public.tenant_quotas
        SET campaigns_used = campaigns_used + 1
        WHERE tenant_id = p_tenant_id;
        v_can_use := true;
      ELSE
        v_can_use := false;
      END IF;
      
    WHEN 'storage' THEN
      -- Storage doesn't auto-increment, just checks limit
      v_can_use := v_quota.storage_used_bytes < v_quota.storage_limit_bytes;
      
    ELSE
      RAISE EXCEPTION 'Unknown quota type: %', p_quota_type;
  END CASE;
  
  RETURN v_can_use;
END;
$$;

-- =============================================
-- PHASE 2.1: Job Engine - Atomic Claim Function
-- =============================================

-- Function to atomically claim due jobs (prevents duplicate execution)
CREATE OR REPLACE FUNCTION public.claim_due_jobs(p_limit INT DEFAULT 10)
RETURNS SETOF scheduled_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  UPDATE scheduled_jobs
  SET status = 'running',
      updated_at = now()
  WHERE id IN (
    SELECT id FROM scheduled_jobs
    WHERE is_active = true
      AND status IN ('pending', 'failed')
      AND next_run_at IS NOT NULL
      AND next_run_at <= now()
    ORDER BY next_run_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT p_limit
  )
  RETURNING *;
END;
$$;

-- =============================================
-- PHASE 2.2: Auto-calculate next_run_at Trigger
-- =============================================

CREATE OR REPLACE FUNCTION public.calculate_next_run_at()
RETURNS TRIGGER AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
BEGIN
  -- Only calculate for active pending/failed jobs without a next_run_at
  IF NEW.is_active = true AND NEW.status IN ('pending', 'failed') THEN
    IF NEW.next_run_at IS NULL OR 
       (TG_OP = 'INSERT') OR 
       (TG_OP = 'UPDATE' AND OLD.schedule_type IS DISTINCT FROM NEW.schedule_type) THEN
      
      CASE NEW.schedule_type
        WHEN 'once' THEN
          NEW.next_run_at := COALESCE(NEW.scheduled_at, v_now);
        WHEN 'daily' THEN
          NEW.next_run_at := v_now + interval '1 day';
        WHEN 'weekly' THEN
          NEW.next_run_at := v_now + interval '1 week';
        WHEN 'monthly' THEN
          NEW.next_run_at := v_now + interval '1 month';
        WHEN 'cron' THEN
          -- For cron, default to now() if not set (Edge Function will calculate precise next)
          IF NEW.next_run_at IS NULL THEN
            NEW.next_run_at := v_now;
          END IF;
        ELSE
          -- Unknown schedule type, don't modify
          NULL;
      END CASE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_next_run_at ON public.scheduled_jobs;
CREATE TRIGGER set_next_run_at
  BEFORE INSERT OR UPDATE ON public.scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION public.calculate_next_run_at();

-- Add index for efficient job queries
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_due 
  ON public.scheduled_jobs (is_active, status, next_run_at)
  WHERE is_active = true AND status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_tenant 
  ON public.scheduled_jobs (tenant_id, next_run_at);

-- =============================================
-- PHASE 3: User Table Preferences Table (if not exists)
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_table_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  table_id TEXT NOT NULL,
  visible_columns JSONB DEFAULT '[]'::JSONB,
  page_size INT DEFAULT 25,
  sort_config JSONB DEFAULT NULL,
  filters JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, table_id)
);

-- RLS for user_table_preferences
ALTER TABLE public.user_table_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON public.user_table_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Grant execution permissions
-- =============================================

GRANT EXECUTE ON FUNCTION public.claim_due_jobs(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_due_jobs(INT) TO service_role;