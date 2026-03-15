
-- =============================================
-- HiperCD (WMS) — Phase 1: Complete Data Model
-- =============================================

-- Storage bucket for NC photos
INSERT INTO storage.buckets (id, name, public) VALUES ('cd-attachments', 'cd-attachments', false);

-- RLS policies for cd-attachments bucket
CREATE POLICY "Authenticated users can upload cd-attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'cd-attachments');

CREATE POLICY "Authenticated users can view cd-attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'cd-attachments');

CREATE POLICY "Authenticated users can update cd-attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'cd-attachments');

CREATE POLICY "Authenticated users can delete cd-attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cd-attachments');

-- ========== 1. cd_stores ==========
CREATE TABLE public.cd_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);
ALTER TABLE public.cd_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_stores FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_stores_updated_at BEFORE UPDATE ON public.cd_stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 2. cd_skus ==========
CREATE TABLE public.cd_skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku_code TEXT NOT NULL,
  description TEXT NOT NULL,
  ean TEXT,
  category TEXT,
  subcategory TEXT,
  brand TEXT,
  unit_measure TEXT NOT NULL DEFAULT 'UN',
  pack_size INTEGER NOT NULL DEFAULT 1,
  weight_kg NUMERIC(10,3),
  length_cm NUMERIC(8,2),
  width_cm NUMERIC(8,2),
  height_cm NUMERIC(8,2),
  temp_min NUMERIC(5,1),
  temp_max NUMERIC(5,1),
  requires_temp_control BOOLEAN NOT NULL DEFAULT false,
  abc_curve TEXT CHECK (abc_curve IN ('A','B','C')),
  avg_unit_cost NUMERIC(12,2),
  avg_unit_price NUMERIC(12,2),
  lead_time_days INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, sku_code)
);
ALTER TABLE public.cd_skus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_skus FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_skus_updated_at BEFORE UPDATE ON public.cd_skus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 3. cd_suppliers ==========
CREATE TABLE public.cd_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  cnpj TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  lead_time_promised_days INTEGER,
  lead_time_actual_avg_days NUMERIC(6,1),
  delivery_accuracy_rate NUMERIC(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);
ALTER TABLE public.cd_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_suppliers FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_suppliers_updated_at BEFORE UPDATE ON public.cd_suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 4. cd_purchase_orders ==========
CREATE TABLE public.cd_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.cd_suppliers(id),
  po_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_transit','partial_received','received','cancelled')),
  expected_date DATE,
  received_date DATE,
  total_items INTEGER DEFAULT 0,
  total_cost NUMERIC(14,2) DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, po_number)
);
ALTER TABLE public.cd_purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_purchase_orders FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_purchase_orders_updated_at BEFORE UPDATE ON public.cd_purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 5. cd_purchase_order_items ==========
CREATE TABLE public.cd_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES public.cd_purchase_orders(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  qty_ordered NUMERIC(12,2) NOT NULL,
  qty_received NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','partial','received','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_purchase_order_items FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_po_items_updated_at BEFORE UPDATE ON public.cd_purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 6. cd_receiving_schedules ==========
CREATE TABLE public.cd_receiving_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  purchase_order_id UUID REFERENCES public.cd_purchase_orders(id),
  supplier_id UUID REFERENCES public.cd_suppliers(id),
  scheduled_date DATE NOT NULL,
  time_window_start TIME,
  time_window_end TIME,
  dock TEXT,
  vehicle_plate TEXT,
  driver_name TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','in_progress','completed','cancelled','no_show')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_receiving_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_receiving_schedules FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_receiving_schedules_updated_at BEFORE UPDATE ON public.cd_receiving_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 7. cd_receiving_records ==========
CREATE TABLE public.cd_receiving_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.cd_receiving_schedules(id),
  purchase_order_id UUID REFERENCES public.cd_purchase_orders(id),
  operator_id UUID,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dock_to_stock_minutes INTEGER,
  result TEXT CHECK (result IN ('approved','partial','rejected')),
  invoice_number TEXT,
  invoice_total NUMERIC(14,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_receiving_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_receiving_records FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_receiving_records_updated_at BEFORE UPDATE ON public.cd_receiving_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 8. cd_receiving_items ==========
CREATE TABLE public.cd_receiving_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  receiving_record_id UUID NOT NULL REFERENCES public.cd_receiving_records(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  po_item_id UUID REFERENCES public.cd_purchase_order_items(id),
  qty_invoice NUMERIC(12,2) NOT NULL,
  qty_physical NUMERIC(12,2) NOT NULL,
  qty_accepted NUMERIC(12,2) NOT NULL DEFAULT 0,
  qty_rejected NUMERIC(12,2) NOT NULL DEFAULT 0,
  batch_number TEXT,
  expiration_date DATE,
  temperature_reading NUMERIC(5,1),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','partial','rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_receiving_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_receiving_items FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_receiving_items_updated_at BEFORE UPDATE ON public.cd_receiving_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 9. cd_non_conformities ==========
CREATE TABLE public.cd_non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  receiving_record_id UUID REFERENCES public.cd_receiving_records(id),
  receiving_item_id UUID REFERENCES public.cd_receiving_items(id),
  sku_id UUID REFERENCES public.cd_skus(id),
  supplier_id UUID REFERENCES public.cd_suppliers(id),
  type TEXT NOT NULL CHECK (type IN ('qty_divergence','damaged','expired','wrong_temp','wrong_product','other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  description TEXT,
  qty_affected NUMERIC(12,2),
  photo_urls JSONB DEFAULT '[]'::jsonb,
  treatment_status TEXT NOT NULL DEFAULT 'open' CHECK (treatment_status IN ('open','in_analysis','resolved','closed')),
  treatment_action TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_non_conformities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_non_conformities FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_non_conformities_updated_at BEFORE UPDATE ON public.cd_non_conformities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 10. cd_locations ==========
CREATE TABLE public.cd_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  zone TEXT NOT NULL,
  aisle TEXT,
  module TEXT,
  level TEXT,
  position TEXT,
  location_type TEXT NOT NULL DEFAULT 'picking' CHECK (location_type IN ('picking','reserve','dock','staging','cold','frozen','quarantine','cross_dock')),
  max_weight_kg NUMERIC(10,2),
  max_volume_m3 NUMERIC(10,4),
  width_cm NUMERIC(8,2),
  height_cm NUMERIC(8,2),
  depth_cm NUMERIC(8,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_occupied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, code)
);
ALTER TABLE public.cd_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_locations FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_locations_updated_at BEFORE UPDATE ON public.cd_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 11. cd_stock_lots ==========
CREATE TABLE public.cd_stock_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  location_id UUID REFERENCES public.cd_locations(id),
  batch_number TEXT,
  expiration_date DATE,
  qty_available NUMERIC(12,2) NOT NULL DEFAULT 0,
  qty_reserved NUMERIC(12,2) NOT NULL DEFAULT 0,
  qty_blocked NUMERIC(12,2) NOT NULL DEFAULT 0,
  origin TEXT CHECK (origin IN ('receiving','transfer','adjustment','return')),
  origin_record_id UUID,
  unit_cost NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','blocked','expired','depleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_stock_lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_stock_lots FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_stock_lots_updated_at BEFORE UPDATE ON public.cd_stock_lots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cd_stock_lots_sku ON public.cd_stock_lots(tenant_id, sku_id);
CREATE INDEX idx_cd_stock_lots_location ON public.cd_stock_lots(tenant_id, location_id);
CREATE INDEX idx_cd_stock_lots_expiration ON public.cd_stock_lots(tenant_id, expiration_date);

-- ========== 12. cd_putaway_tasks ==========
CREATE TABLE public.cd_putaway_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  receiving_record_id UUID REFERENCES public.cd_receiving_records(id),
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  stock_lot_id UUID REFERENCES public.cd_stock_lots(id),
  suggested_location_id UUID REFERENCES public.cd_locations(id),
  actual_location_id UUID REFERENCES public.cd_locations(id),
  qty NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  operator_id UUID,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_putaway_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_putaway_tasks FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_putaway_tasks_updated_at BEFORE UPDATE ON public.cd_putaway_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 13. cd_slotting_configs ==========
CREATE TABLE public.cd_slotting_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  preferred_zone TEXT,
  primary_location_id UUID REFERENCES public.cd_locations(id),
  secondary_location_id UUID REFERENCES public.cd_locations(id),
  min_qty NUMERIC(12,2),
  max_qty NUMERIC(12,2),
  replenish_trigger_qty NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, sku_id)
);
ALTER TABLE public.cd_slotting_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_slotting_configs FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_slotting_configs_updated_at BEFORE UPDATE ON public.cd_slotting_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 14. cd_cycle_counts ==========
CREATE TABLE public.cd_cycle_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.cd_locations(id),
  sku_id UUID REFERENCES public.cd_skus(id),
  stock_lot_id UUID REFERENCES public.cd_stock_lots(id),
  qty_system NUMERIC(12,2) NOT NULL,
  qty_physical NUMERIC(12,2),
  delta NUMERIC(12,2),
  delta_pct NUMERIC(8,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','counted','adjusted','approved')),
  counted_by UUID,
  counted_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  adjustment_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_cycle_counts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_cycle_counts FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_cycle_counts_updated_at BEFORE UPDATE ON public.cd_cycle_counts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 15. cd_consumption_history ==========
CREATE TABLE public.cd_consumption_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  store_id UUID NOT NULL REFERENCES public.cd_stores(id),
  consumption_date DATE NOT NULL,
  qty_sold NUMERIC(12,2) NOT NULL DEFAULT 0,
  qty_transferred NUMERIC(12,2) NOT NULL DEFAULT 0,
  had_rupture BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, sku_id, store_id, consumption_date)
);
ALTER TABLE public.cd_consumption_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_consumption_history FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE INDEX idx_cd_consumption_sku_store ON public.cd_consumption_history(tenant_id, sku_id, store_id, consumption_date);

-- ========== 16. cd_replenishment_params ==========
CREATE TABLE public.cd_replenishment_params (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  store_id UUID NOT NULL REFERENCES public.cd_stores(id),
  add_value NUMERIC(12,4),
  add_std_dev NUMERIC(12,4),
  safety_stock NUMERIC(12,2),
  reorder_point NUMERIC(12,2),
  order_qty NUMERIC(12,2),
  service_level NUMERIC(5,4) NOT NULL DEFAULT 0.95,
  z_score NUMERIC(5,3) NOT NULL DEFAULT 1.645,
  replenishment_cycle_days INTEGER NOT NULL DEFAULT 7,
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, sku_id, store_id)
);
ALTER TABLE public.cd_replenishment_params ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_replenishment_params FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_replenishment_params_updated_at BEFORE UPDATE ON public.cd_replenishment_params
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 17. cd_order_suggestions ==========
CREATE TABLE public.cd_order_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  store_id UUID NOT NULL REFERENCES public.cd_stores(id),
  suggested_qty NUMERIC(12,2) NOT NULL,
  suggested_qty_packs NUMERIC(12,2),
  current_stock NUMERIC(12,2),
  reorder_point NUMERIC(12,2),
  projected_rupture_date DATE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','converted')),
  converted_to_transfer_id UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_order_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_order_suggestions FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_order_suggestions_updated_at BEFORE UPDATE ON public.cd_order_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 18. cd_rupture_projections ==========
CREATE TABLE public.cd_rupture_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  store_id UUID NOT NULL REFERENCES public.cd_stores(id),
  current_stock NUMERIC(12,2) NOT NULL,
  add_value NUMERIC(12,4) NOT NULL,
  projected_rupture_date DATE NOT NULL,
  days_until_rupture INTEGER NOT NULL,
  oos_cost_daily NUMERIC(12,2),
  oos_cost_gap NUMERIC(12,2),
  substitution_rate NUMERIC(5,4) DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_rupture_projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_rupture_projections FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE INDEX idx_cd_rupture_date ON public.cd_rupture_projections(tenant_id, projected_rupture_date);

-- ========== 19. cd_transfer_orders ==========
CREATE TABLE public.cd_transfer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  transfer_number TEXT NOT NULL,
  store_id UUID NOT NULL REFERENCES public.cd_stores(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','picking','picked','checked','shipped','in_transit','delivered','cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  requested_by UUID,
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  total_items INTEGER DEFAULT 0,
  total_skus INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, transfer_number)
);
ALTER TABLE public.cd_transfer_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_transfer_orders FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_transfer_orders_updated_at BEFORE UPDATE ON public.cd_transfer_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 20. cd_transfer_order_items ==========
CREATE TABLE public.cd_transfer_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  transfer_order_id UUID NOT NULL REFERENCES public.cd_transfer_orders(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  stock_lot_id UUID REFERENCES public.cd_stock_lots(id),
  qty_requested NUMERIC(12,2) NOT NULL,
  qty_picked NUMERIC(12,2) NOT NULL DEFAULT 0,
  qty_checked NUMERIC(12,2) NOT NULL DEFAULT 0,
  batch_number TEXT,
  expiration_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','picked','checked','shipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_transfer_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_transfer_order_items FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_transfer_order_items_updated_at BEFORE UPDATE ON public.cd_transfer_order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 21. cd_picking_waves ==========
CREATE TABLE public.cd_picking_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  wave_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled')),
  transfer_order_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_items INTEGER DEFAULT 0,
  total_skus INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, wave_number)
);
ALTER TABLE public.cd_picking_waves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_picking_waves FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_picking_waves_updated_at BEFORE UPDATE ON public.cd_picking_waves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 22. cd_picking_tasks ==========
CREATE TABLE public.cd_picking_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  wave_id UUID REFERENCES public.cd_picking_waves(id),
  transfer_order_id UUID REFERENCES public.cd_transfer_orders(id),
  operator_id UUID,
  sequence_order INTEGER,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  items_picked INTEGER DEFAULT 0,
  items_total INTEGER DEFAULT 0,
  accuracy_rate NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_picking_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_picking_tasks FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_picking_tasks_updated_at BEFORE UPDATE ON public.cd_picking_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 23. cd_shipping_manifests ==========
CREATE TABLE public.cd_shipping_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  manifest_number TEXT NOT NULL,
  transfer_order_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  vehicle_plate TEXT,
  driver_name TEXT,
  driver_doc TEXT,
  temperature_departure NUMERIC(5,1),
  checker_id UUID,
  departure_at TIMESTAMPTZ,
  arrival_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'loading' CHECK (status IN ('loading','departed','in_transit','delivered','cancelled')),
  store_id UUID REFERENCES public.cd_stores(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, manifest_number)
);
ALTER TABLE public.cd_shipping_manifests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_shipping_manifests FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_shipping_manifests_updated_at BEFORE UPDATE ON public.cd_shipping_manifests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== 24. cd_loss_records ==========
CREATE TABLE public.cd_loss_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.cd_skus(id),
  stock_lot_id UUID REFERENCES public.cd_stock_lots(id),
  supplier_id UUID REFERENCES public.cd_suppliers(id),
  store_id UUID REFERENCES public.cd_stores(id),
  origin TEXT NOT NULL CHECK (origin IN ('receiving','storage','picking','shipping','expiration','damage','theft','other')),
  cause TEXT,
  qty NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2),
  total_value NUMERIC(14,2),
  photo_urls JSONB DEFAULT '[]'::jsonb,
  recorded_by UUID,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_loss_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_loss_records FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE TRIGGER update_cd_loss_records_updated_at BEFORE UPDATE ON public.cd_loss_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cd_loss_origin ON public.cd_loss_records(tenant_id, origin);
CREATE INDEX idx_cd_loss_supplier ON public.cd_loss_records(tenant_id, supplier_id);

-- ========== 25. cd_alerts ==========
CREATE TABLE public.cd_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('red','yellow','blue')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  action_url TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  auto_generated BOOLEAN NOT NULL DEFAULT true,
  viewed_at TIMESTAMPTZ,
  viewed_by UUID,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_alerts FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE INDEX idx_cd_alerts_level ON public.cd_alerts(tenant_id, level, resolved_at);

-- ========== 26. cd_kpi_snapshots ==========
CREATE TABLE public.cd_kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily','weekly','monthly')),
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, snapshot_date, period_type)
);
ALTER TABLE public.cd_kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_kpi_snapshots FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- ========== 27. cd_audit_log ==========
CREATE TABLE public.cd_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cd_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON public.cd_audit_log FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
CREATE INDEX idx_cd_audit_entity ON public.cd_audit_log(tenant_id, entity_type, entity_id);

-- Update is_page_allowed to support hipercd
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
