-- Fix overly-permissive RLS policy flagged by linter (WITH CHECK true)
DROP POLICY IF EXISTS "Users can create insights" ON public.marketing_ai_insights;

CREATE POLICY "Users can create insights"
  ON public.marketing_ai_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      tenant_id = public.get_user_tenant_id(auth.uid())
      OR public.is_sigma_admin(auth.uid())
    )
  );