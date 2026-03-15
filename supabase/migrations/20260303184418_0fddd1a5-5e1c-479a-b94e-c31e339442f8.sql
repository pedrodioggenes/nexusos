
-- Romaneios (shipping manifests) for expedition
CREATE TABLE public.cd_romaneios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  romaneio_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  vehicle_plate TEXT,
  driver_name TEXT,
  carrier_name TEXT,
  departure_at TIMESTAMPTZ,
  arrival_at TIMESTAMPTZ,
  total_orders INT DEFAULT 0,
  total_items INT DEFAULT 0,
  total_weight_kg NUMERIC(10,2),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cd_romaneios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for cd_romaneios" ON public.cd_romaneios
  FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Junction table linking romaneios to transfer orders
CREATE TABLE public.cd_romaneio_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  romaneio_id UUID NOT NULL REFERENCES public.cd_romaneios(id) ON DELETE CASCADE,
  transfer_order_id UUID NOT NULL REFERENCES public.cd_transfer_orders(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cd_romaneio_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for cd_romaneio_orders" ON public.cd_romaneio_orders
  FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE TRIGGER update_cd_romaneios_updated_at
  BEFORE UPDATE ON public.cd_romaneios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
