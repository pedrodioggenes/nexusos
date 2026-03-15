-- Allow internal users to view user_roles within the same tenant (for assignee dropdowns etc.)
CREATE POLICY "Internal users can view same-tenant roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = get_user_tenant_id(auth.uid())
    AND get_user_type(auth.uid()) = 'internal'::user_type
  );