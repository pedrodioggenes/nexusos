-- Fix DELETE policy to allow gestor too
DROP POLICY "Admins can delete executions" ON public.marketing_executions;
CREATE POLICY "Operators and admins can delete executions"
ON public.marketing_executions
FOR DELETE
USING (
  tenant_id = get_user_tenant_id(auth.uid())
  AND get_user_department_role(auth.uid()) = ANY (ARRAY['gestor', 'admin'])
);