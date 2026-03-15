
-- 1. RPC: Acknowledge demand receipt (collaborator confirms, moves open → in_progress)
CREATE OR REPLACE FUNCTION public.rpc_acknowledge_demand(p_demand_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
  v_demand RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não autenticado');
  END IF;

  SELECT id, tenant_id, status, assigned_to
  INTO v_demand
  FROM public.marketing_demands
  WHERE id = p_demand_id;

  IF v_demand IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Demanda não encontrada');
  END IF;

  -- Must be assigned to this user
  IF v_demand.assigned_to IS DISTINCT FROM v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você não é o responsável por esta demanda');
  END IF;

  -- Must be in 'open' status
  IF v_demand.status != 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Demanda não está no status "A Fazer"');
  END IF;

  v_tenant_id := v_demand.tenant_id;

  -- Transition to in_progress
  UPDATE public.marketing_demands
  SET status = 'in_progress',
      started_at = COALESCE(started_at, now()),
      last_status_change_at = now()
  WHERE id = p_demand_id;

  -- Record history
  INSERT INTO public.demand_status_history (
    tenant_id, demand_id, from_status, to_status, changed_by, change_reason, source
  ) VALUES (
    v_tenant_id, p_demand_id, 'open', 'in_progress', v_user_id, 'Acuse de recebimento', 'system'
  );

  -- Audit
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, tenant_id, metadata)
  VALUES (
    v_user_id, 'demand_acknowledged', 'marketing_demands', p_demand_id::TEXT, v_tenant_id,
    jsonb_build_object('from_status', 'open', 'to_status', 'in_progress')
  );

  RETURN jsonb_build_object('success', true, 'demand_id', p_demand_id);
END;
$$;

-- 2. Trigger function: notify assigned user when demand is created
CREATE OR REPLACE FUNCTION public.notify_demand_assigned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_creator_name TEXT;
  v_title_text TEXT;
BEGIN
  -- Only fire on INSERT or when assigned_to changes
  IF TG_OP = 'INSERT' THEN
    IF NEW.assigned_to IS NULL THEN
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.assigned_to IS NOT DISTINCT FROM OLD.assigned_to THEN
      RETURN NEW;
    END IF;
    IF NEW.assigned_to IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Get creator name
  SELECT COALESCE(full_name, split_part(email, '@', 1))
  INTO v_creator_name
  FROM public.profiles
  WHERE user_id = NEW.created_by
  LIMIT 1;

  v_title_text := COALESCE(NEW.title, 'Nova demanda');

  -- Create notification for the assigned user
  PERFORM public.create_notification(
    NEW.assigned_to,
    NEW.tenant_id,
    'demand',
    'Nova demanda atribuída',
    COALESCE(v_creator_name, 'Gestor') || ' atribuiu a demanda "' || v_title_text || '" para você. Acuse o recebimento para iniciar.',
    'marketing_demands',
    NEW.id,
    'info',
    '/hipersenna/hiperworks?demand=' || NEW.id::TEXT
  );

  RETURN NEW;
END;
$$;

-- 3. Create trigger on marketing_demands
CREATE TRIGGER trg_notify_demand_assigned
AFTER INSERT OR UPDATE OF assigned_to ON public.marketing_demands
FOR EACH ROW
EXECUTE FUNCTION public.notify_demand_assigned();

-- 4. Add 'demand' to notification types if not already supported
-- The notifications table uses text type, so no enum change needed.

-- 5. Fix the notify_evidence_linked function to say HiperWorks instead of HyperWorks
CREATE OR REPLACE FUNCTION public.notify_evidence_linked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_internal RECORD;
  v_label TEXT;
  v_creator_name TEXT;
  v_url TEXT;
BEGIN
  IF NEW.relation_type != 'evidence' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, split_part(email, '@', 1))
  INTO v_creator_name
  FROM public.profiles
  WHERE user_id = NEW.created_by
  LIMIT 1;

  v_label := COALESCE(NEW.label, 'Evidência');

  IF NEW.entity_type IN ('retail_execution_run', 'retail_execution_item') THEN
    SELECT '/hipersenna/hipergestao/execucao/' || r.retail_action_id::TEXT || '/loja/' || r.store_id::TEXT
    INTO v_url
    FROM public.retail_execution_runs r
    WHERE r.id = CASE
      WHEN NEW.entity_type = 'retail_execution_run' THEN NEW.entity_id
      ELSE (SELECT execution_run_id FROM public.retail_execution_items WHERE id = NEW.entity_id LIMIT 1)
    END
    LIMIT 1;
  END IF;

  FOR v_internal IN
    SELECT ur.user_id
    FROM public.user_roles ur
    WHERE ur.tenant_id = NEW.tenant_id
      AND (ur.role = 'admin' OR ur.department_role IN ('gestor', 'gestor_marketing', 'supervisor', 'gerente_loja', 'gestor_trade'))
      AND ur.user_id != NEW.created_by
  LOOP
    PERFORM public.create_notification(
      v_internal.user_id,
      NEW.tenant_id,
      'execution',
      'Nova comprovação vinculada',
      COALESCE(v_creator_name, 'Usuário') || ' vinculou uma ' || v_label || ' via HiperWorks.',
      'hyperworks_entity_links',
      NEW.id,
      'info',
      COALESCE(v_url, '/hipersenna/hipergestao/execucao')
    );
  END LOOP;

  RETURN NEW;
END;
$$;
