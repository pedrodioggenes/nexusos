-- 1. Create demand_responses table for collaborator responses
CREATE TABLE IF NOT EXISTS public.demand_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demand_id UUID REFERENCES public.marketing_demands(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content JSONB NOT NULL,
  attachments JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add department_role column to user_roles (gestor or colaborador)
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS department_role TEXT DEFAULT 'colaborador';

-- 3. Enable RLS on demand_responses
ALTER TABLE public.demand_responses ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for demand_responses
-- Users can manage their own responses
CREATE POLICY "Users can view own responses" 
ON public.demand_responses 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own responses" 
ON public.demand_responses 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own responses" 
ON public.demand_responses 
FOR UPDATE 
USING (user_id = auth.uid());

-- Gestors can view all responses for demands in their tenant
CREATE POLICY "Gestors can view tenant responses" 
ON public.demand_responses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.department_role = 'gestor'
    AND ur.tenant_id = (
      SELECT md.tenant_id FROM public.marketing_demands md 
      WHERE md.id = demand_responses.demand_id
    )
  )
);

-- Gestors can update responses (for review)
CREATE POLICY "Gestors can update tenant responses" 
ON public.demand_responses 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.department_role = 'gestor'
    AND ur.tenant_id = (
      SELECT md.tenant_id FROM public.marketing_demands md 
      WHERE md.id = demand_responses.demand_id
    )
  )
);

-- 5. Create helper function to get department role
CREATE OR REPLACE FUNCTION public.get_user_department_role(_user_id uuid)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(department_role, 'colaborador')
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 6. Create storage bucket for demand attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'demand-attachments', 
  'demand-attachments', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 7. Create storage policies for demand-attachments bucket
CREATE POLICY "Authenticated users can upload demand attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'demand-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view demand attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'demand-attachments');

CREATE POLICY "Users can delete own demand attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'demand-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 8. Create trigger for updated_at
CREATE TRIGGER update_demand_responses_updated_at
BEFORE UPDATE ON public.demand_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();