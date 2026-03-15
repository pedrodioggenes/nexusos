-- =====================================================
-- HiperRH, HiperReposição, HiperDomínio - Core Tables
-- =====================================================

-- =====================================================
-- HIPERRH Tables
-- =====================================================

-- Colaboradores (employees)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  cpf TEXT,
  birth_date DATE,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  department TEXT,
  position TEXT,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  work_schedule JSONB DEFAULT '{}',
  salary DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),
  termination_date DATE,
  avatar_url TEXT,
  documents JSONB DEFAULT '[]',
  contact_phone TEXT,
  contact_email TEXT,
  address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registros de Ponto
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  location JSONB,
  device_info TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Férias e Afastamentos
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vacation', 'medical', 'maternity', 'paternity', 'personal', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Avaliações de Desempenho
CREATE TABLE public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  review_cycle TEXT NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scores JSONB DEFAULT '{}',
  strengths TEXT,
  improvements TEXT,
  goals JSONB DEFAULT '[]',
  overall_rating DECIMAL(2,1),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'completed')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Recrutamento
CREATE TABLE public.job_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position_applied TEXT NOT NULL,
  resume_url TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  notes TEXT,
  interview_date TIMESTAMPTZ,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- HIPERREPOSIÇÃO Tables
-- =====================================================

-- Gôndolas/Prateleiras
CREATE TABLE public.gondolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  name TEXT,
  sector TEXT,
  category TEXT,
  position JSONB DEFAULT '{}',
  planogram_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, unit_id, code)
);

-- Tarefas de Reposição
CREATE TABLE public.replenishment_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  gondola_id UUID REFERENCES public.gondolas(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  type TEXT DEFAULT 'regular' CHECK (type IN ('regular', 'rupture', 'promotion', 'expiration')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  checklist JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registros de Ruptura
CREATE TABLE public.rupture_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  gondola_id UUID REFERENCES public.gondolas(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  detected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT CHECK (reason IN ('out_of_stock', 'supplier_delay', 'damaged', 'discontinued', 'other')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Controle de Validade
CREATE TABLE public.expiration_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  gondola_id UUID REFERENCES public.gondolas(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  batch_number TEXT,
  expiration_date DATE NOT NULL,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'removed', 'sold', 'discarded')),
  action_taken TEXT,
  action_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_at TIMESTAMPTZ,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comprovações de Reposição
CREATE TABLE public.replenishment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.replenishment_tasks(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('before', 'after', 'issue')),
  photo_url TEXT NOT NULL,
  notes TEXT,
  captured_at TIMESTAMPTZ DEFAULT now(),
  captured_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- HIPERDOMÍNIO Tables
-- =====================================================

-- Métricas Executivas Consolidadas
CREATE TABLE public.executive_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  metrics JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, metric_date, period_type)
);

-- Alertas Estratégicos
CREATE TABLE public.strategic_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('opportunity', 'risk', 'deviation', 'recommendation')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  source_module TEXT,
  source_data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Relatórios Personalizados
CREATE TABLE public.custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  schedule JSONB DEFAULT '{}',
  recipients JSONB DEFAULT '[]',
  last_generated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Snapshots de Métricas para Histórico
CREATE TABLE public.metric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RLS Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gondolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replenishment_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rupture_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expiration_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replenishment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_snapshots ENABLE ROW LEVEL SECURITY;

-- HiperRH Policies
CREATE POLICY "Tenant users can view employees" ON public.employees
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage employees" ON public.employees
  FOR ALL USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role))
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Employees can view own time entries" ON public.time_entries
  FOR SELECT USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Employees can insert own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Tenant users can view leave requests" ON public.leave_requests
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant users can manage leave requests" ON public.leave_requests
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Tenant users can view performance reviews" ON public.performance_reviews
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage performance reviews" ON public.performance_reviews
  FOR ALL USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role))
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Tenant users can view candidates" ON public.job_candidates
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage candidates" ON public.job_candidates
  FOR ALL USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role))
    OR public.is_sigma_admin(auth.uid())
  );

-- HiperReposição Policies
CREATE POLICY "Tenant users can view gondolas" ON public.gondolas
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage gondolas" ON public.gondolas
  FOR ALL USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role))
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Tenant users can view replenishment tasks" ON public.replenishment_tasks
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant users can manage replenishment tasks" ON public.replenishment_tasks
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Tenant users can view rupture records" ON public.rupture_records
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant users can manage rupture records" ON public.rupture_records
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Tenant users can view expiration alerts" ON public.expiration_alerts
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant users can manage expiration alerts" ON public.expiration_alerts
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Tenant users can view replenishment proofs" ON public.replenishment_proofs
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant users can manage replenishment proofs" ON public.replenishment_proofs
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_sigma_admin(auth.uid())
  );

-- HiperDomínio Policies
CREATE POLICY "Tenant users can view executive metrics" ON public.executive_metrics
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "System can manage executive metrics" ON public.executive_metrics
  FOR ALL USING (public.is_sigma_admin(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tenant users can view strategic alerts" ON public.strategic_alerts
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant users can manage strategic alerts" ON public.strategic_alerts
  FOR ALL USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Tenant users can view custom reports" ON public.custom_reports
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage custom reports" ON public.custom_reports
  FOR ALL USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role))
    OR public.is_sigma_admin(auth.uid())
  );

CREATE POLICY "Tenant users can view metric snapshots" ON public.metric_snapshots
  FOR SELECT USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.is_sigma_admin(auth.uid()));

CREATE POLICY "System can manage metric snapshots" ON public.metric_snapshots
  FOR ALL USING (public.is_sigma_admin(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_employees_tenant ON public.employees(tenant_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_employees_department ON public.employees(department);

CREATE INDEX idx_time_entries_employee ON public.time_entries(employee_id);
CREATE INDEX idx_time_entries_timestamp ON public.time_entries(timestamp);

CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);

CREATE INDEX idx_gondolas_tenant_unit ON public.gondolas(tenant_id, unit_id);
CREATE INDEX idx_gondolas_sector ON public.gondolas(sector);

CREATE INDEX idx_replenishment_tasks_date ON public.replenishment_tasks(task_date);
CREATE INDEX idx_replenishment_tasks_status ON public.replenishment_tasks(status);
CREATE INDEX idx_replenishment_tasks_assigned ON public.replenishment_tasks(assigned_to);

CREATE INDEX idx_rupture_records_detected ON public.rupture_records(detected_at);
CREATE INDEX idx_expiration_alerts_date ON public.expiration_alerts(expiration_date);

CREATE INDEX idx_executive_metrics_date ON public.executive_metrics(metric_date);
CREATE INDEX idx_strategic_alerts_type ON public.strategic_alerts(type);
CREATE INDEX idx_strategic_alerts_severity ON public.strategic_alerts(severity);

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
  BEFORE UPDATE ON public.performance_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_candidates_updated_at
  BEFORE UPDATE ON public.job_candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gondolas_updated_at
  BEFORE UPDATE ON public.gondolas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_replenishment_tasks_updated_at
  BEFORE UPDATE ON public.replenishment_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_reports_updated_at
  BEFORE UPDATE ON public.custom_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();