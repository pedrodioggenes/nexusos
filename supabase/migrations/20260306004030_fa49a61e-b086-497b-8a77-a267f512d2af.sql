
-- Sprint 6H: Add hired_at to profiles + training notification trigger

-- 1. Add hired_at column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hired_at DATE;

-- 2. Trigger to auto-create hw_notifications on training assignment
CREATE OR REPLACE FUNCTION public.hw_notify_training_assigned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_assigner_name TEXT;
  v_tenant_id UUID;
BEGIN
  v_tenant_id := NEW.tenant_id;

  SELECT COALESCE(full_name, split_part(email, '@', 1))
  INTO v_assigner_name
  FROM public.profiles
  WHERE user_id = NEW.assigned_by
  LIMIT 1;

  INSERT INTO public.hw_notifications (
    user_id, tenant_id, type, title, body, related_entity_type, related_entity_id
  ) VALUES (
    NEW.user_id,
    v_tenant_id,
    'training',
    'Novo treinamento atribuído',
    COALESCE(v_assigner_name, 'Gestor') || ' atribuiu o treinamento "' || NEW.training_title || '"' ||
    CASE WHEN NEW.mandatory THEN ' (obrigatório).' ELSE '.' END,
    'hw_training_assignments',
    NEW.id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hw_notify_training_assigned ON public.hw_training_assignments;
CREATE TRIGGER trg_hw_notify_training_assigned
  AFTER INSERT ON public.hw_training_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.hw_notify_training_assigned();
