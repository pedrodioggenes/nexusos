
-- ============================================
-- HiperPMO Module — Full Schema
-- ============================================

-- 1. pmo_initiatives (Roadmap + Backlog unificado)
CREATE TABLE public.pmo_initiatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  title TEXT NOT NULL,
  description TEXT,
  area TEXT, -- TI, Marketing, Trade, RH, Operação
  impact_score INTEGER DEFAULT 1 CHECK (impact_score BETWEEN 1 AND 5),
  effort_score INTEGER DEFAULT 1 CHECK (effort_score BETWEEN 1 AND 5),
  calculated_score NUMERIC GENERATED ALWAYS AS (impact_score::NUMERIC / NULLIF(effort_score, 0)) STORED,
  priority TEXT DEFAULT 'depois' CHECK (priority IN ('agora', 'depois', 'nunca')),
  status TEXT DEFAULT 'proposto' CHECK (status IN ('proposto', 'em_avaliacao', 'aprovado', 'em_execucao', 'concluido', 'arquivado')),
  stage TEXT DEFAULT 'backlog' CHECK (stage IN ('backlog', 'planejado', 'em_andamento', 'bloqueado', 'em_validacao', 'concluido')),
  owner_name TEXT,
  owner_user_id UUID,
  due_date DATE,
  tags TEXT[],
  block_reason TEXT,
  block_responsible TEXT,
  kpi_expected TEXT,
  dependencies TEXT,
  risks TEXT,
  archive_reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_initiatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_initiatives_tenant" ON public.pmo_initiatives FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 2. pmo_sprints
CREATE TABLE public.pmo_sprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  name TEXT NOT NULL,
  goals TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planejado' CHECK (status IN ('planejado', 'ativo', 'encerrado')),
  summary JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_sprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_sprints_tenant" ON public.pmo_sprints FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 3. pmo_sprint_items
CREATE TABLE public.pmo_sprint_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  sprint_id UUID NOT NULL REFERENCES public.pmo_sprints(id) ON DELETE CASCADE,
  initiative_id UUID NOT NULL REFERENCES public.pmo_initiatives(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'bloqueado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_sprint_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_sprint_items_tenant" ON public.pmo_sprint_items FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 4. pmo_weekly_reports (WBR)
CREATE TABLE public.pmo_weekly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  edition INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  content JSONB DEFAULT '{}'::JSONB,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_weekly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_weekly_reports_tenant" ON public.pmo_weekly_reports FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 5. pmo_monthly_metrics
CREATE TABLE public.pmo_monthly_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  month TEXT NOT NULL, -- '2026-01'
  solution TEXT NOT NULL,
  kpi_name TEXT NOT NULL,
  baseline NUMERIC,
  current_value NUMERIC,
  delta NUMERIC,
  estimated_value_brl NUMERIC,
  data_source TEXT,
  initiative_id UUID REFERENCES public.pmo_initiatives(id),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_monthly_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_monthly_metrics_tenant" ON public.pmo_monthly_metrics FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 6. pmo_releases
CREATE TABLE public.pmo_releases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  version TEXT NOT NULL,
  release_date DATE,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'fechado')),
  summary TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_releases_tenant" ON public.pmo_releases FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 7. pmo_release_items
CREATE TABLE public.pmo_release_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  release_id UUID NOT NULL REFERENCES public.pmo_releases(id) ON DELETE CASCADE,
  initiative_id UUID REFERENCES public.pmo_initiatives(id),
  description TEXT NOT NULL,
  modules_impacted TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_release_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_release_items_tenant" ON public.pmo_release_items FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 8. pmo_training_sessions
CREATE TABLE public.pmo_training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  topic TEXT NOT NULL,
  audience TEXT,
  objectives TEXT,
  materials JSONB DEFAULT '[]'::JSONB,
  attendance JSONB DEFAULT '[]'::JSONB,
  session_date DATE,
  post_tasks TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_training_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_training_sessions_tenant" ON public.pmo_training_sessions FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 9. pmo_playbooks
CREATE TABLE public.pmo_playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}'::JSONB,
  category TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_playbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_playbooks_tenant" ON public.pmo_playbooks FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 10. pmo_internal_owners
CREATE TABLE public.pmo_internal_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  person_name TEXT NOT NULL,
  area TEXT,
  role_title TEXT,
  maturity_level TEXT DEFAULT 'iniciante' CHECK (maturity_level IN ('iniciante', 'intermediario', 'autonomo')),
  goals TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_internal_owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_internal_owners_tenant" ON public.pmo_internal_owners FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 11. pmo_owner_reviews
CREATE TABLE public.pmo_owner_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  owner_id UUID NOT NULL REFERENCES public.pmo_internal_owners(id) ON DELETE CASCADE,
  review_cycle TEXT NOT NULL, -- 'Q1 2026'
  previous_level TEXT,
  current_level TEXT,
  observations TEXT,
  evolution_plan TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_owner_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_owner_reviews_tenant" ON public.pmo_owner_reviews FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 12. pmo_quarterly_reviews (QBR)
CREATE TABLE public.pmo_quarterly_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  cycle TEXT NOT NULL, -- 'Q1 2026'
  diagnosis TEXT,
  roadmap_changes JSONB DEFAULT '[]'::JSONB,
  governance_audit TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado', 'congelado')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_quarterly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_quarterly_reviews_tenant" ON public.pmo_quarterly_reviews FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 13. pmo_incidents (SLA)
CREATE TABLE public.pmo_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  title TEXT NOT NULL,
  severity TEXT DEFAULT 'media' CHECK (severity IN ('baixa', 'media', 'alta', 'critica')),
  status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido')),
  affected_system TEXT,
  impact TEXT,
  resolution TEXT,
  postmortem TEXT,
  opened_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_incidents_tenant" ON public.pmo_incidents FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 14. pmo_immersions
CREATE TABLE public.pmo_immersions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  area TEXT NOT NULL,
  objective TEXT,
  mapped_processes TEXT,
  requirements TEXT,
  decisions TEXT,
  next_steps TEXT,
  immersion_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_immersions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_immersions_tenant" ON public.pmo_immersions FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 15. pmo_work_agenda
CREATE TABLE public.pmo_work_agenda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('presencial', 'remoto', 'rito', 'imersao', 'capacitacao', 'build')),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  results TEXT,
  attendance JSONB DEFAULT '[]'::JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_work_agenda ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_work_agenda_tenant" ON public.pmo_work_agenda FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 16. pmo_tools_costs
CREATE TABLE public.pmo_tools_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  name TEXT NOT NULL,
  vendor TEXT,
  reason TEXT,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  status TEXT DEFAULT 'proposto' CHECK (status IN ('proposto', 'aprovado', 'ativo', 'cancelado')),
  responsible TEXT,
  approved_at DATE,
  approved_by UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_tools_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_tools_costs_tenant" ON public.pmo_tools_costs FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 17. pmo_approvals
CREATE TABLE public.pmo_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  entity_type TEXT NOT NULL, -- 'initiative', 'tool', 'priority_change', 'release'
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'ajuste_solicitado')),
  comments TEXT,
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_approvals_tenant" ON public.pmo_approvals FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 18. pmo_decisions
CREATE TABLE public.pmo_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  title TEXT NOT NULL,
  justification TEXT,
  impact TEXT,
  responsible TEXT,
  decision_date DATE DEFAULT CURRENT_DATE,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_decisions_tenant" ON public.pmo_decisions FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 19. pmo_evidence_links
CREATE TABLE public.pmo_evidence_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  hyperworks_message_id UUID,
  url TEXT,
  label TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_evidence_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_evidence_links_tenant" ON public.pmo_evidence_links FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- 20. pmo_settings
CREATE TABLE public.pmo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) UNIQUE,
  sprint_cadence TEXT DEFAULT '2_weeks' CHECK (sprint_cadence IN ('1_week', '2_weeks', '1_month')),
  semaphore_rules JSONB DEFAULT '{"green": {"max_overdue": 0, "max_critical_risks": 0}, "yellow": {"max_overdue": 3, "max_critical_risks": 2}, "red": {"max_overdue": 99, "max_critical_risks": 99}}'::JSONB,
  wbr_template JSONB DEFAULT '{}'::JSONB,
  mmr_template JSONB DEFAULT '{}'::JSONB,
  qbr_template JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pmo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pmo_settings_tenant" ON public.pmo_settings FOR ALL USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_pmo_initiatives_updated_at BEFORE UPDATE ON public.pmo_initiatives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_sprints_updated_at BEFORE UPDATE ON public.pmo_sprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_weekly_reports_updated_at BEFORE UPDATE ON public.pmo_weekly_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_monthly_metrics_updated_at BEFORE UPDATE ON public.pmo_monthly_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_releases_updated_at BEFORE UPDATE ON public.pmo_releases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_training_sessions_updated_at BEFORE UPDATE ON public.pmo_training_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_playbooks_updated_at BEFORE UPDATE ON public.pmo_playbooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_internal_owners_updated_at BEFORE UPDATE ON public.pmo_internal_owners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_quarterly_reviews_updated_at BEFORE UPDATE ON public.pmo_quarterly_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_incidents_updated_at BEFORE UPDATE ON public.pmo_incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_immersions_updated_at BEFORE UPDATE ON public.pmo_immersions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_work_agenda_updated_at BEFORE UPDATE ON public.pmo_work_agenda FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_tools_costs_updated_at BEFORE UPDATE ON public.pmo_tools_costs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_approvals_updated_at BEFORE UPDATE ON public.pmo_approvals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_decisions_updated_at BEFORE UPDATE ON public.pmo_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pmo_settings_updated_at BEFORE UPDATE ON public.pmo_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update is_page_allowed to support hiperpmo paths
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
