
-- Fix: require authentication for viewing content calendar (including demo data)
DROP POLICY IF EXISTS "Internal users can view content calendar" ON public.team_content_calendar;

CREATE POLICY "Authenticated users can view content calendar"
  ON public.team_content_calendar
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IS NULL
    OR tenant_id = get_user_tenant_id(auth.uid())
    OR is_sigma_admin(auth.uid())
  );
