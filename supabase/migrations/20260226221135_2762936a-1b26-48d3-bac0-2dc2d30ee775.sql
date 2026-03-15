
-- ============================================
-- PDI (Plano Diretor de Implantação) Tables
-- ============================================

-- 1. PDI Phases (Fases 0-5)
CREATE TABLE public.pdi_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id),
  phase_number INTEGER NOT NULL, -- 0-5
  name TEXT NOT NULL,
  objective TEXT,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  gate_name TEXT, -- "Gate 0: Kick-off aprovado"
  deliverables TEXT, -- semicolon-separated key deliverables
  cadence TEXT, -- "Semanal (WBR)"
  sponsor TEXT,
  operational_owner TEXT,
  status TEXT NOT NULL DEFAULT 'planejado', -- planejado, em_andamento, em_risco, atrasado, concluido, suspenso
  progress INTEGER NOT NULL DEFAULT 0, -- 0-100
  priority TEXT DEFAULT 'alta', -- alta, media, baixa
  observations TEXT,
  evidence_links TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PDI Delivery Cycles (C1-C4, 90 days each)
CREATE TABLE public.pdi_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id),
  cycle_code TEXT NOT NULL, -- C1, C2, C3, C4
  period TEXT, -- "0–90 dias"
  top_initiatives TEXT, -- summary
  why_now TEXT,
  expected_result TEXT, -- KPI/impact
  done_criteria TEXT,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'planejado',
  progress INTEGER NOT NULL DEFAULT 0,
  observations TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at triggers
CREATE TRIGGER update_pdi_phases_updated_at
  BEFORE UPDATE ON public.pdi_phases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pdi_cycles_updated_at
  BEFORE UPDATE ON public.pdi_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.pdi_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdi_cycles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pdi_phases
CREATE POLICY "Tenant users can view pdi_phases"
  ON public.pdi_phases FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins and gestors can insert pdi_phases"
  ON public.pdi_phases FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.get_user_department_role(auth.uid()) IN ('gestor', 'gestor_marketing', 'supervisor'))
  );

CREATE POLICY "Admins and gestors can update pdi_phases"
  ON public.pdi_phases FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.get_user_department_role(auth.uid()) IN ('gestor', 'gestor_marketing', 'supervisor'))
  );

CREATE POLICY "Admins can delete pdi_phases"
  ON public.pdi_phases FOR DELETE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for pdi_cycles
CREATE POLICY "Tenant users can view pdi_cycles"
  ON public.pdi_cycles FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins and gestors can insert pdi_cycles"
  ON public.pdi_cycles FOR INSERT
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.get_user_department_role(auth.uid()) IN ('gestor', 'gestor_marketing', 'supervisor'))
  );

CREATE POLICY "Admins and gestors can update pdi_cycles"
  ON public.pdi_cycles FOR UPDATE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'admin') OR public.get_user_department_role(auth.uid()) IN ('gestor', 'gestor_marketing', 'supervisor'))
  );

CREATE POLICY "Admins can delete pdi_cycles"
  ON public.pdi_cycles FOR DELETE
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'admin')
  );
