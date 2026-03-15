-- Drop existing restrictive policies
DROP POLICY IF EXISTS "financial_transactions_select" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_insert" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_update" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_delete" ON public.financial_transactions;

-- SELECT: any internal user of the tenant can view
CREATE POLICY "financial_transactions_select"
ON public.financial_transactions FOR SELECT
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- INSERT: any internal user of the tenant can create
CREATE POLICY "financial_transactions_insert"
ON public.financial_transactions FOR INSERT
WITH CHECK (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND created_by = auth.uid()
);

-- UPDATE: only own records OR admin/operador
CREATE POLICY "financial_transactions_update"
ON public.financial_transactions FOR UPDATE
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND (
    created_by = auth.uid()
    OR public.get_user_role(auth.uid()) IN ('admin', 'operador')
  )
);

-- DELETE: only own records OR admin/operador
CREATE POLICY "financial_transactions_delete"
ON public.financial_transactions FOR DELETE
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND (
    created_by = auth.uid()
    OR public.get_user_role(auth.uid()) IN ('admin', 'operador')
  )
);

-- Also fix financial_transaction_links table if it has restrictive policies
DROP POLICY IF EXISTS "financial_transaction_links_select" ON public.financial_transaction_links;
DROP POLICY IF EXISTS "financial_transaction_links_insert" ON public.financial_transaction_links;

CREATE POLICY "financial_transaction_links_select"
ON public.financial_transaction_links FOR SELECT
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "financial_transaction_links_insert"
ON public.financial_transaction_links FOR INSERT
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));