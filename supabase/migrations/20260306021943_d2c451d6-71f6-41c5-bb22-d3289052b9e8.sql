
-- ══════════════════════════════════════════════════════════
-- Sprint 6F: Engajamento — Aniversários, Reconhecimentos, Clima
-- ══════════════════════════════════════════════════════════

-- 1) Birthday field on profiles (if not exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 2) Recognition / Kudos
CREATE TABLE public.hw_recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'kudos',
  message TEXT NOT NULL,
  emoji TEXT DEFAULT '⭐',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hw_recognitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view recognitions"
  ON public.hw_recognitions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create recognitions"
  ON public.hw_recognitions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()) AND from_user_id = auth.uid());

-- 3) Bulletin Board (Quadro de Avisos)
CREATE TABLE public.hw_bulletins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hw_bulletins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view bulletins"
  ON public.hw_bulletins FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Gestores can create bulletins"
  ON public.hw_bulletins FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Authors can update bulletins"
  ON public.hw_bulletins FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

-- 4) Climate Survey
CREATE TABLE public.hw_climate_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  is_anonymous BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hw_climate_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view active surveys"
  ON public.hw_climate_surveys FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Gestores can create surveys"
  ON public.hw_climate_surveys FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()));

-- 5) Climate Survey Responses
CREATE TABLE public.hw_climate_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.hw_climate_surveys(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
  user_id UUID,
  answers JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hw_climate_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit responses"
  ON public.hw_climate_responses FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()));

CREATE POLICY "Gestores can view responses"
  ON public.hw_climate_responses FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM public.user_roles WHERE user_id = auth.uid()));

-- Notify on recognition
CREATE OR REPLACE FUNCTION public.hw_notify_recognition()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_from_name TEXT;
BEGIN
  SELECT COALESCE(full_name, split_part(email, '@', 1))
  INTO v_from_name FROM public.profiles WHERE user_id = NEW.from_user_id LIMIT 1;

  INSERT INTO public.hw_notifications (user_id, tenant_id, type, title, body, related_entity_type, related_entity_id)
  VALUES (NEW.to_user_id, NEW.tenant_id, 'recognition',
    NEW.emoji || ' Reconhecimento recebido!',
    COALESCE(v_from_name, 'Alguém') || ' reconheceu você: "' || LEFT(NEW.message, 100) || '"',
    'hw_recognitions', NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_hw_recognition_notify
  AFTER INSERT ON public.hw_recognitions
  FOR EACH ROW EXECUTE FUNCTION public.hw_notify_recognition();
