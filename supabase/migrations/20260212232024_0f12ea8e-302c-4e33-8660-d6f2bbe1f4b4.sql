
-- Tabela de transacoes financeiras do marketing
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'custo')),
  category TEXT NOT NULL,
  subcategory TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'pendente', 'cancelado')),
  reference_type TEXT,
  reference_id UUID,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_financial_transactions_tenant_date ON public.financial_transactions(tenant_id, date);
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(tenant_id, type);
CREATE INDEX idx_financial_transactions_category ON public.financial_transactions(tenant_id, category);

-- RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- SELECT: admin e operador do mesmo tenant
CREATE POLICY "financial_transactions_select" ON public.financial_transactions
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('admin', 'operador')
  );

-- INSERT
CREATE POLICY "financial_transactions_insert" ON public.financial_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('admin', 'operador')
  );

-- UPDATE
CREATE POLICY "financial_transactions_update" ON public.financial_transactions
  FOR UPDATE TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('admin', 'operador')
  );

-- DELETE
CREATE POLICY "financial_transactions_delete" ON public.financial_transactions
  FOR DELETE TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('admin', 'operador')
  );

-- Trigger updated_at
CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
