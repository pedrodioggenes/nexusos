-- Fix Function Search Path Mutable warnings
-- Set search_path for functions that were missing it

-- Fix prevent_audit_mutations
CREATE OR REPLACE FUNCTION public.prevent_audit_mutations()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RAISE EXCEPTION 'system_audit_log is immutable - % operations are not allowed', TG_OP;
  RETURN NULL;
END;
$$;

-- Fix calculate_next_run_at
CREATE OR REPLACE FUNCTION public.calculate_next_run_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
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
          IF NEW.next_run_at IS NULL THEN
            NEW.next_run_at := v_now;
          END IF;
        ELSE
          NULL;
      END CASE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;