
-- 1. hw_notification_preferences (DND mode)
CREATE TABLE public.hw_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  dnd_active BOOLEAN NOT NULL DEFAULT false,
  dnd_start TIME DEFAULT '22:00',
  dnd_end TIME DEFAULT '07:00',
  mute_channels BOOLEAN NOT NULL DEFAULT false,
  mute_mentions BOOLEAN NOT NULL DEFAULT false,
  digest_enabled BOOLEAN NOT NULL DEFAULT true,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hw_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own prefs"
  ON public.hw_notification_preferences FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own prefs"
  ON public.hw_notification_preferences FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own prefs"
  ON public.hw_notification_preferences FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2. Cross-module alert function: bridges cd_alerts/fin_alerta_financeiro into hw_notifications
CREATE OR REPLACE FUNCTION public.hw_bridge_cross_module_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user RECORD;
  v_module TEXT;
  v_title TEXT;
  v_body TEXT;
BEGIN
  -- Determine module from table
  IF TG_TABLE_NAME = 'cd_alerts' THEN
    v_module := 'HiperCD';
    v_title := '⚠️ Alerta CD: ' || NEW.title;
    v_body := COALESCE(NEW.description, 'Novo alerta gerado no centro de distribuição.');
  ELSIF TG_TABLE_NAME = 'fin_alerta_financeiro' THEN
    v_module := 'HiperFinanceiro';
    v_title := '💰 Alerta Financeiro: ' || NEW.titulo;
    v_body := COALESCE(NEW.descricao, 'Novo alerta financeiro gerado.');
  ELSE
    RETURN NEW;
  END IF;

  -- Notify all admins and gestors in the tenant
  FOR v_user IN
    SELECT ur.user_id
    FROM public.user_roles ur
    WHERE ur.tenant_id = NEW.tenant_id
      AND (ur.role = 'admin' OR ur.department_role IN ('diretor', 'gestor', 'gestor_marketing', 'gestor_trade'))
    -- Skip users in DND mode
    AND NOT EXISTS (
      SELECT 1 FROM public.hw_notification_preferences np
      WHERE np.user_id = ur.user_id
        AND np.dnd_active = true
        AND LOCALTIME BETWEEN np.dnd_start AND np.dnd_end
    )
  LOOP
    INSERT INTO public.hw_notifications (
      user_id, tenant_id, type, title, body, related_entity_type, related_entity_id
    ) VALUES (
      v_user.user_id, NEW.tenant_id, 'cross_module',
      v_title, v_body, TG_TABLE_NAME, NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- 3. Attach triggers for cross-module alerts
CREATE TRIGGER trg_hw_bridge_cd_alerts
  AFTER INSERT ON public.cd_alerts
  FOR EACH ROW EXECUTE FUNCTION public.hw_bridge_cross_module_alert();

CREATE TRIGGER trg_hw_bridge_fin_alerts
  AFTER INSERT ON public.fin_alerta_financeiro
  FOR EACH ROW EXECUTE FUNCTION public.hw_bridge_cross_module_alert();
