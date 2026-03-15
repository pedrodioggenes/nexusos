-- Create marketing_budgets table
CREATE TABLE public.marketing_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_budget NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, year)
);

-- Create marketing_budget_categories table
CREATE TABLE public.marketing_budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES public.marketing_budgets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create marketing_budget_transactions table
CREATE TABLE public.marketing_budget_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.marketing_budget_categories(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_type TEXT,
  reference_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create marketing_kpis table
CREATE TABLE public.marketing_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  roi NUMERIC,
  cac NUMERIC,
  ltv NUMERIC,
  conversion_rate NUMERIC,
  nps INTEGER,
  average_ticket NUMERIC,
  impressions BIGINT,
  clicks BIGINT,
  visits BIGINT,
  leads INTEGER,
  conversions INTEGER,
  revenue NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, period_type, period_start)
);

-- Create marketing_kpis_by_channel table
CREATE TABLE public.marketing_kpis_by_channel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES public.marketing_kpis(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL,
  investment NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  roi NUMERIC,
  leads INTEGER,
  conversions INTEGER,
  conversion_rate NUMERIC,
  cac NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create marketing_plans table
CREATE TABLE public.marketing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  current_value TEXT,
  target_value TEXT,
  progress INTEGER DEFAULT 0,
  responsible TEXT,
  color TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.marketing_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_budget_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_kpis_by_channel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketing_budgets
CREATE POLICY "Internal users can view budgets" ON public.marketing_budgets
  FOR SELECT USING (
    tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid())
  );

CREATE POLICY "Admins can manage budgets" ON public.marketing_budgets
  FOR ALL USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
    OR is_sigma_admin(auth.uid())
  );

-- RLS Policies for marketing_budget_categories
CREATE POLICY "Internal users can view budget categories" ON public.marketing_budget_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketing_budgets mb
      WHERE mb.id = budget_id
      AND (mb.tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage budget categories" ON public.marketing_budget_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.marketing_budgets mb
      WHERE mb.id = budget_id
      AND ((mb.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
           OR is_sigma_admin(auth.uid()))
    )
  );

-- RLS Policies for marketing_budget_transactions
CREATE POLICY "Internal users can view transactions" ON public.marketing_budget_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketing_budget_categories mbc
      JOIN public.marketing_budgets mb ON mb.id = mbc.budget_id
      WHERE mbc.id = category_id
      AND (mb.tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage transactions" ON public.marketing_budget_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.marketing_budget_categories mbc
      JOIN public.marketing_budgets mb ON mb.id = mbc.budget_id
      WHERE mbc.id = category_id
      AND ((mb.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
           OR is_sigma_admin(auth.uid()))
    )
  );

-- RLS Policies for marketing_kpis
CREATE POLICY "Internal users can view KPIs" ON public.marketing_kpis
  FOR SELECT USING (
    tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid())
  );

CREATE POLICY "Admins can manage KPIs" ON public.marketing_kpis
  FOR ALL USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
    OR is_sigma_admin(auth.uid())
  );

-- RLS Policies for marketing_kpis_by_channel
CREATE POLICY "Internal users can view KPIs by channel" ON public.marketing_kpis_by_channel
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketing_kpis mk
      WHERE mk.id = kpi_id
      AND (mk.tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage KPIs by channel" ON public.marketing_kpis_by_channel
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.marketing_kpis mk
      WHERE mk.id = kpi_id
      AND ((mk.tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
           OR is_sigma_admin(auth.uid()))
    )
  );

-- RLS Policies for marketing_plans
CREATE POLICY "Internal users can view plans" ON public.marketing_plans
  FOR SELECT USING (
    tenant_id = get_user_tenant_id(auth.uid()) OR is_sigma_admin(auth.uid())
  );

CREATE POLICY "Admins can manage plans" ON public.marketing_plans
  FOR ALL USING (
    (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
    OR is_sigma_admin(auth.uid())
  );

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_marketing_budgets_updated_at
  BEFORE UPDATE ON public.marketing_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_budget_categories_updated_at
  BEFORE UPDATE ON public.marketing_budget_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_kpis_updated_at
  BEFORE UPDATE ON public.marketing_kpis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_plans_updated_at
  BEFORE UPDATE ON public.marketing_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();