
-- ==============================
-- HiperCompras Module - Full Schema
-- ==============================

-- 1. compras_suppliers
CREATE TABLE public.compras_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnpj TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  payment_terms TEXT DEFAULT '30 DDL',
  lead_time_days INTEGER DEFAULT 7,
  min_order_value NUMERIC(12,2) DEFAULT 0,
  composite_score NUMERIC(5,2) DEFAULT 0,
  classification TEXT DEFAULT 'padrao', -- estrategico, padrao, observacao, em_risco
  status TEXT DEFAULT 'active', -- active, inactive, blocked
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_suppliers_tenant_read" ON public.compras_suppliers FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));
CREATE POLICY "compras_suppliers_tenant_write" ON public.compras_suppliers FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 2. compras_supplier_scores
CREATE TABLE public.compras_supplier_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.compras_suppliers(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- '2026-01', '2026-02'
  score_preco NUMERIC(5,2) DEFAULT 0,
  score_otif NUMERIC(5,2) DEFAULT 0,
  score_qualidade NUMERIC(5,2) DEFAULT 0,
  score_responsividade NUMERIC(5,2) DEFAULT 0,
  score_comercial NUMERIC(5,2) DEFAULT 0,
  composite_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_supplier_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_supplier_scores_tenant" ON public.compras_supplier_scores FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 3. compras_skus
CREATE TABLE public.compras_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT DEFAULT 'UN',
  primary_supplier_id UUID REFERENCES public.compras_suppliers(id),
  avg_cta NUMERIC(12,2) DEFAULT 0,
  last_price NUMERIC(12,2) DEFAULT 0,
  coverage_min_days INTEGER DEFAULT 7,
  coverage_max_days INTEGER DEFAULT 30,
  avg_daily_demand NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_skus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_skus_tenant" ON public.compras_skus FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 4. compras_price_history (immutable time series)
CREATE TABLE public.compras_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.compras_skus(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.compras_suppliers(id) ON DELETE CASCADE,
  price NUMERIC(12,2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_price_history_tenant" ON public.compras_price_history FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 5. compras_purchase_orders
CREATE TABLE public.compras_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.compras_suppliers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft', -- draft, pending_approval, approved, sent, received, divergent, cancelled
  total_value NUMERIC(14,2) DEFAULT 0,
  ppv_total NUMERIC(12,2) DEFAULT 0,
  ccc_impact_days NUMERIC(8,2) DEFAULT 0,
  expected_date TIMESTAMPTZ,
  received_date TIMESTAMPTZ,
  approved_by UUID,
  approval_threshold TEXT, -- auto, gestor, diretor
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_po_tenant" ON public.compras_purchase_orders FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 6. compras_po_items
CREATE TABLE public.compras_po_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES public.compras_purchase_orders(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.compras_skus(id) ON DELETE CASCADE,
  qty NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  reference_price NUMERIC(12,2) DEFAULT 0,
  ppv NUMERIC(12,2) DEFAULT 0,
  cta_estimated NUMERIC(12,2) DEFAULT 0,
  gmroi_projected NUMERIC(8,4) DEFAULT 0,
  coverage_post_days INTEGER DEFAULT 0,
  flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_po_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_po_items_tenant" ON public.compras_po_items FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 7. compras_trade_allowances
CREATE TABLE public.compras_trade_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.compras_suppliers(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- rebate, bonificacao, verba_fixa, desconto_volume
  description TEXT,
  fiscal_type TEXT, -- nota_credito, desconto_nf, bonificacao_produto
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_conditional BOOLEAN DEFAULT false,
  condition_description TEXT,
  condition_target NUMERIC(14,2),
  planned_value NUMERIC(14,2) DEFAULT 0,
  realized_value NUMERIC(14,2) DEFAULT 0,
  adherence_pct NUMERIC(8,2) DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, expired, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_trade_allowances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_trade_allowances_tenant" ON public.compras_trade_allowances FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 8. compras_divergences
CREATE TABLE public.compras_divergences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.compras_suppliers(id) ON DELETE CASCADE,
  purchase_order_id UUID REFERENCES public.compras_purchase_orders(id),
  sku_id UUID REFERENCES public.compras_skus(id),
  type TEXT NOT NULL, -- qty_short, qty_excess, price, quality, expiry, damaged
  qty_expected NUMERIC(12,2) DEFAULT 0,
  qty_received NUMERIC(12,2) DEFAULT 0,
  value_impact NUMERIC(14,2) DEFAULT 0,
  action_taken TEXT, -- accepted, returned, credit_note, replacement
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_divergences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_divergences_tenant" ON public.compras_divergences FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 9. compras_negotiations
CREATE TABLE public.compras_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.compras_suppliers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'price', -- price, payment_terms, volume_discount, trade_allowance
  status TEXT DEFAULT 'open', -- open, in_progress, closed_won, closed_lost
  original_value NUMERIC(14,2),
  negotiated_value NUMERIC(14,2),
  saving_value NUMERIC(14,2),
  saving_pct NUMERIC(8,2),
  negotiated_by UUID,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_negotiations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_negotiations_tenant" ON public.compras_negotiations FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 10. compras_kpi_snapshots
CREATE TABLE public.compras_kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_kpi_snapshots_tenant" ON public.compras_kpi_snapshots FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 11. compras_alerts
CREATE TABLE public.compras_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- cost, supplier, demand, financial
  level TEXT NOT NULL DEFAULT 'yellow', -- red, yellow, blue
  related_entity_type TEXT,
  related_entity_id UUID,
  status TEXT DEFAULT 'active', -- active, resolved, dismissed
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  auto_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_alerts_tenant" ON public.compras_alerts FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 12. compras_audit_log (immutable)
CREATE TABLE public.compras_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_audit_log_tenant_read" ON public.compras_audit_log FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- 13. compras_executive_summary
CREATE TABLE public.compras_executive_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- '2026-01', '2026-02'
  total_purchase_volume NUMERIC(14,2) DEFAULT 0,
  total_pos_emitted INTEGER DEFAULT 0,
  active_suppliers INTEGER DEFAULT 0,
  avg_dpo NUMERIC(8,2) DEFAULT 0,
  saving_realized NUMERIC(14,2) DEFAULT 0,
  saving_pct NUMERIC(8,2) DEFAULT 0,
  ppv_accumulated NUMERIC(14,2) DEFAULT 0,
  avg_otif NUMERIC(8,2) DEFAULT 0,
  avg_gmroi NUMERIC(8,4) DEFAULT 0,
  ccc_days NUMERIC(8,2) DEFAULT 0,
  semaphore JSONB DEFAULT '{}', -- { cost: 'green', supplier: 'yellow', demand: 'green', financial: 'yellow' }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compras_executive_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compras_executive_summary_tenant" ON public.compras_executive_summary FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

-- Add is_page_allowed support for hipercompras
CREATE OR REPLACE FUNCTION public.is_page_allowed(p_user_id uuid, p_page_path text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_pages_allowed JSONB;
  v_module_key TEXT;
  v_module_pages JSONB;
BEGIN
  SELECT pages_allowed INTO v_pages_allowed
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_pages_allowed IS NULL THEN
    RETURN TRUE;
  END IF;

  IF p_page_path LIKE '%/hipergestao%' THEN
    v_module_key := 'hipergestao';
  ELSIF p_page_path LIKE '%/hipertrade%' THEN
    v_module_key := 'hipertrade';
  ELSIF p_page_path LIKE '%/hiperofertas%' THEN
    v_module_key := 'hiperofertas';
  ELSIF p_page_path LIKE '%/hiperia%' THEN
    v_module_key := 'hiperia';
  ELSIF p_page_path LIKE '%/hiperpmo%' THEN
    v_module_key := 'hiperpmo';
  ELSIF p_page_path LIKE '%/hipercd%' THEN
    v_module_key := 'hipercd';
  ELSIF p_page_path LIKE '%/hipercliente%' THEN
    v_module_key := 'hipercliente';
  ELSIF p_page_path LIKE '%/hipercompras%' THEN
    v_module_key := 'hipercompras';
  ELSE
    RETURN TRUE;
  END IF;

  IF NOT v_pages_allowed ? v_module_key THEN
    RETURN TRUE;
  END IF;

  v_module_pages := v_pages_allowed -> v_module_key;

  IF v_module_pages IS NULL OR v_module_pages = 'null'::JSONB THEN
    RETURN TRUE;
  END IF;

  IF jsonb_array_length(v_module_pages) = 0 THEN
    RETURN FALSE;
  END IF;

  RETURN v_module_pages ? p_page_path;
END;
$function$;
