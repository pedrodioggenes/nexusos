
-- Trade references: links a retail_action to a HiperTrade deal (read-only reference)
CREATE TABLE public.trade_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  retail_action_id UUID NOT NULL REFERENCES public.retail_actions(id) ON DELETE CASCADE,
  hypertrade_deal_id TEXT,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  status_snapshot JSONB DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for trade_references"
  ON public.trade_references FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE TRIGGER update_trade_references_updated_at
  BEFORE UPDATE ON public.trade_references
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trade requests: internal brief requesting trade support
CREATE TABLE public.trade_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  retail_action_id UUID REFERENCES public.retail_actions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  period TEXT,
  stores JSONB DEFAULT '[]'::jsonb,
  mechanics TEXT,
  requested_support JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for trade_requests"
  ON public.trade_requests FOR ALL
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE TRIGGER update_trade_requests_updated_at
  BEFORE UPDATE ON public.trade_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
