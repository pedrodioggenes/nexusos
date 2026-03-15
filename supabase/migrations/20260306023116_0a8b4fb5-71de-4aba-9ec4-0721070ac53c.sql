
-- Create hw_interviews table for scheduling
CREATE TABLE public.hw_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.hw_candidates(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES auth.users(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  type TEXT DEFAULT 'presencial',
  notes TEXT,
  result TEXT DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hw_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can manage interviews"
  ON public.hw_interviews FOR ALL TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Add kanban_stage to hw_candidates for richer pipeline
ALTER TABLE public.hw_candidates
  ADD COLUMN IF NOT EXISTS kanban_stage TEXT DEFAULT 'triagem',
  ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direto';

-- Trigger to auto-notify on interview scheduled
CREATE OR REPLACE FUNCTION public.hw_notify_interview_scheduled()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_candidate_name TEXT;
BEGIN
  SELECT name INTO v_candidate_name FROM public.hw_candidates WHERE id = NEW.candidate_id;

  IF NEW.interviewer_id IS NOT NULL THEN
    INSERT INTO public.hw_notifications (
      user_id, tenant_id, type, title, body, related_entity_type, related_entity_id
    ) VALUES (
      NEW.interviewer_id, NEW.tenant_id, 'interview',
      'Entrevista agendada',
      'Entrevista com ' || COALESCE(v_candidate_name, 'candidato') || ' em ' ||
      to_char(NEW.scheduled_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI'),
      'hw_interviews', NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_hw_interview_notify
  AFTER INSERT ON public.hw_interviews
  FOR EACH ROW EXECUTE FUNCTION public.hw_notify_interview_scheduled();
