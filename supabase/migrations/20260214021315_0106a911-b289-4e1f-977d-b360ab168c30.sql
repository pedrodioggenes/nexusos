
-- Budget allocations: planned amounts per category + optional campaign
CREATE TABLE public.marketing_budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  category_id UUID REFERENCES public.marketing_budget_categories(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  planned_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.marketing_budget_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant allocations"
ON public.marketing_budget_allocations FOR SELECT TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can manage own tenant allocations"
ON public.marketing_budget_allocations FOR ALL TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Transaction links: link transactions to campaigns/demands/plans
CREATE TABLE public.financial_transaction_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE CASCADE NOT NULL,
  linked_type TEXT NOT NULL CHECK (linked_type IN ('campaign', 'demand', 'plan')),
  linked_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_transaction_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant links"
ON public.financial_transaction_links FOR SELECT TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can manage own tenant links"
ON public.financial_transaction_links FOR ALL TO authenticated
USING (tenant_id = public.get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Index for performance
CREATE INDEX idx_budget_allocations_period ON public.marketing_budget_allocations(period_start, period_end);
CREATE INDEX idx_budget_allocations_category ON public.marketing_budget_allocations(category_id);
CREATE INDEX idx_budget_allocations_campaign ON public.marketing_budget_allocations(campaign_id);
CREATE INDEX idx_tx_links_transaction ON public.financial_transaction_links(transaction_id);
CREATE INDEX idx_tx_links_linked ON public.financial_transaction_links(linked_type, linked_id);
