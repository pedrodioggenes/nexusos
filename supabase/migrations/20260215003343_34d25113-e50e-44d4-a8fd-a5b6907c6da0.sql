
-- 1) Trigger: notify admins/gestores when an execution run needs comprovação
CREATE OR REPLACE FUNCTION public.notify_execution_run_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_action_title TEXT;
  v_store_name TEXT;
  v_internal RECORD;
  v_title TEXT;
  v_msg TEXT;
  v_url TEXT;
BEGIN
  -- Only fire on status changes
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  -- Get action title
  SELECT title INTO v_action_title
  FROM public.retail_actions
  WHERE id = NEW.retail_action_id
  LIMIT 1;

  -- Get store name
  SELECT name INTO v_store_name
  FROM public.units
  WHERE id = NEW.store_id
  LIMIT 1;

  -- Build notification based on status
  IF NEW.status = 'in_progress' THEN
    v_title := 'Execução iniciada';
    v_msg := 'A execução de "' || COALESCE(v_action_title, 'Ação') || '" na loja "' || COALESCE(v_store_name, 'Loja') || '" foi iniciada e aguarda comprovação.';
  ELSIF NEW.status = 'completed' THEN
    v_title := 'Execução concluída';
    v_msg := 'A execução de "' || COALESCE(v_action_title, 'Ação') || '" na loja "' || COALESCE(v_store_name, 'Loja') || '" foi concluída com ' || COALESCE(NEW.compliance_score, 0) || '% de compliance.';
  ELSE
    -- Don't notify for other statuses
    RETURN NEW;
  END IF;

  v_url := '/hipersenna/hipergestao/execucao/' || NEW.retail_action_id::TEXT || '/loja/' || NEW.store_id::TEXT;

  -- Notify all admins and gestores of this tenant
  FOR v_internal IN
    SELECT ur.user_id
    FROM public.user_roles ur
    WHERE ur.tenant_id = NEW.tenant_id
      AND (ur.role = 'admin' OR ur.department_role = 'gestor')
  LOOP
    PERFORM public.create_notification(
      v_internal.user_id,
      NEW.tenant_id,
      'execution',
      v_title,
      v_msg,
      'retail_execution_runs',
      NEW.id,
      CASE WHEN NEW.status = 'completed' THEN 'success' ELSE 'info' END,
      v_url
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_execution_run_status
AFTER INSERT OR UPDATE ON public.retail_execution_runs
FOR EACH ROW
EXECUTE FUNCTION public.notify_execution_run_status_change();

-- 2) Trigger: notify admins/gestores when new evidence is linked
CREATE OR REPLACE FUNCTION public.notify_evidence_linked()
RETURNS TRIGGER
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
  -- Only for evidence relation type
  IF NEW.relation_type != 'evidence' THEN
    RETURN NEW;
  END IF;

  -- Get creator name
  SELECT COALESCE(full_name, split_part(email, '@', 1))
  INTO v_creator_name
  FROM public.profiles
  WHERE user_id = NEW.created_by
  LIMIT 1;

  v_label := COALESCE(NEW.label, 'Evidência');

  -- Build action URL based on entity type
  IF NEW.entity_type IN ('retail_execution_run', 'retail_execution_item') THEN
    -- For run/item, resolve the action and store
    SELECT '/hipersenna/hipergestao/execucao/' || r.retail_action_id::TEXT || '/loja/' || r.store_id::TEXT
    INTO v_url
    FROM public.retail_execution_runs r
    WHERE r.id = CASE
      WHEN NEW.entity_type = 'retail_execution_run' THEN NEW.entity_id
      ELSE (SELECT execution_run_id FROM public.retail_execution_items WHERE id = NEW.entity_id LIMIT 1)
    END
    LIMIT 1;
  END IF;

  -- Notify admins/gestores of this tenant (except the creator)
  FOR v_internal IN
    SELECT ur.user_id
    FROM public.user_roles ur
    WHERE ur.tenant_id = NEW.tenant_id
      AND (ur.role = 'admin' OR ur.department_role = 'gestor')
      AND ur.user_id != NEW.created_by
  LOOP
    PERFORM public.create_notification(
      v_internal.user_id,
      NEW.tenant_id,
      'execution',
      'Nova comprovação vinculada',
      COALESCE(v_creator_name, 'Usuário') || ' vinculou uma ' || v_label || ' via HyperWorks.',
      'hyperworks_entity_links',
      NEW.id,
      'info',
      COALESCE(v_url, '/hipersenna/hipergestao/execucao')
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_evidence_linked
AFTER INSERT ON public.hyperworks_entity_links
FOR EACH ROW
EXECUTE FUNCTION public.notify_evidence_linked();
