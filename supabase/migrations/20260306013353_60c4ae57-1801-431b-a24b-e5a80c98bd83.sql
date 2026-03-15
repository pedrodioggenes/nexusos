
-- Shift scheduling table
CREATE TABLE public.hw_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.hw_teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL DEFAULT 'morning',
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id, shift_date)
);

ALTER TABLE public.hw_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view shifts" ON public.hw_shifts
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Managers can manage shifts" ON public.hw_shifts
  FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Incidents table
CREATE TABLE public.hw_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'observation',
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  created_by UUID NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hw_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view incidents" ON public.hw_incidents
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Managers can manage incidents" ON public.hw_incidents
  FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Member transfers table
CREATE TABLE public.hw_member_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  from_team_id UUID REFERENCES public.hw_teams(id) ON DELETE SET NULL,
  to_team_id UUID REFERENCES public.hw_teams(id) ON DELETE SET NULL NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  transferred_by UUID NOT NULL,
  reason TEXT,
  transferred_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hw_member_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view transfers" ON public.hw_member_transfers
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Managers can create transfers" ON public.hw_member_transfers
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));
