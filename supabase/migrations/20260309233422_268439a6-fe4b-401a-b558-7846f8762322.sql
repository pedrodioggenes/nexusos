
-- Add 'nao_perturbe' to the availability enum
ALTER TYPE public.hw_availability_status ADD VALUE IF NOT EXISTS 'nao_perturbe';

-- Create off-hours access terms table
CREATE TABLE public.hw_off_hours_access_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  term_text TEXT NOT NULL,
  term_hash TEXT NOT NULL,
  work_schedule JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.hw_off_hours_access_terms ENABLE ROW LEVEL SECURITY;

-- Users can insert their own terms
CREATE POLICY "Users can insert own off-hours terms"
  ON public.hw_off_hours_access_terms
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can read their own terms
CREATE POLICY "Users can read own off-hours terms"
  ON public.hw_off_hours_access_terms
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all terms in their tenant
CREATE POLICY "Admins can read tenant off-hours terms"
  ON public.hw_off_hours_access_terms
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (
      public.is_sigma_admin(auth.uid())
      OR public.get_user_department_role(auth.uid()) IN ('gestor', 'gestor_marketing', 'supervisor', 'gerente_loja', 'admin')
    )
  );
