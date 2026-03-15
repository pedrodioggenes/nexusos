
-- Update rpc_decide_demand_approval to support new gestor-level roles
CREATE OR REPLACE FUNCTION public.rpc_decide_demand_approval(p_approval_id uuid, p_decision text, p_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
  v_user_role app_role;
  v_department_role TEXT;
  v_approval RECORD;
  v_demand_id UUID;
  v_is_gestor_level BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;

  SELECT tenant_id, role, COALESCE(department_role, 'colaborador')
    INTO v_tenant_id, v_user_role, v_department_role
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tenant não encontrado');
  END IF;

  -- Check if user has gestor-level access (supports new functional roles)
  v_is_gestor_level := v_department_role IN ('gestor', 'gestor_marketing', 'supervisor', 'gerente_loja', 'gestor_trade');

  -- RBAC check: only admin or gestor-level can decide
  IF v_user_role NOT IN ('admin') AND NOT v_is_gestor_level THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem permissão para decidir aprovações. Apenas gestores e administradores podem aprovar ou rejeitar.');
  END IF;

  IF p_decision NOT IN ('approved', 'changes_requested', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Decisão inválida. Use: approved, changes_requested ou rejected.');
  END IF;

  SELECT da.id, da.tenant_id, da.demand_id, da.status
    INTO v_approval
  FROM public.demand_approvals da
  WHERE da.id = p_approval_id
    AND da.tenant_id = v_tenant_id;

  IF v_approval IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Aprovação não encontrada ou sem acesso');
  END IF;

  IF v_approval.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Esta aprovação já foi decidida');
  END IF;

  v_demand_id := v_approval.demand_id;

  UPDATE public.demand_approvals
  SET status = p_decision,
      note = COALESCE(p_note, note),
      decided_at = now(),
      approver_user_id = v_user_id,
      updated_at = now()
  WHERE id = p_approval_id
    AND tenant_id = v_tenant_id;

  PERFORM public.log_audit(
    'approval_decided',
    'demand_approvals',
    p_approval_id,
    NULL,
    jsonb_build_object('approval_id', p_approval_id, 'demand_id', v_demand_id),
    jsonb_build_object('decision', p_decision, 'note', p_note),
    jsonb_build_object('department_role', v_department_role, 'app_role', v_user_role::TEXT),
    'info'
  );

  RETURN jsonb_build_object(
    'success', true,
    'approval_id', p_approval_id,
    'demand_id', v_demand_id,
    'decision', p_decision
  );
END;
$function$;

-- Update notify_execution_run_status_change to support new gestor-level roles
CREATE OR REPLACE FUNCTION public.notify_execution_run_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_action_title TEXT;
  v_store_name TEXT;
  v_internal RECORD;
  v_title TEXT;
  v_msg TEXT;
  v_url TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT title INTO v_action_title
  FROM public.retail_actions
  WHERE id = NEW.retail_action_id
  LIMIT 1;

  SELECT name INTO v_store_name
  FROM public.units
  WHERE id = NEW.store_id
  LIMIT 1;

  IF NEW.status = 'in_progress' THEN
    v_title := 'Execução iniciada';
    v_msg := 'A execução de "' || COALESCE(v_action_title, 'Ação') || '" na loja "' || COALESCE(v_store_name, 'Loja') || '" foi iniciada e aguarda comprovação.';
  ELSIF NEW.status = 'completed' THEN
    v_title := 'Execução concluída';
    v_msg := 'A execução de "' || COALESCE(v_action_title, 'Ação') || '" na loja "' || COALESCE(v_store_name, 'Loja') || '" foi concluída com ' || COALESCE(NEW.compliance_score, 0) || '% de compliance.';
  ELSE
    RETURN NEW;
  END IF;

  v_url := '/hipersenna/hipergestao/execucao/' || NEW.retail_action_id::TEXT || '/loja/' || NEW.store_id::TEXT;

  FOR v_internal IN
    SELECT ur.user_id
    FROM public.user_roles ur
    WHERE ur.tenant_id = NEW.tenant_id
      AND (ur.role = 'admin' OR ur.department_role IN ('gestor', 'gestor_marketing', 'supervisor', 'gerente_loja', 'gestor_trade'))
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
$function$;

-- Update notify_evidence_linked to support new gestor-level roles
CREATE OR REPLACE FUNCTION public.notify_evidence_linked()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      COALESCE(v_creator_name, 'Usuário') || ' vinculou uma ' || v_label || ' via HyperWorks.',
      'hyperworks_entity_links',
      NEW.id,
      'info',
      COALESCE(v_url, '/hipersenna/hipergestao/execucao')
    );
  END LOOP;

  RETURN NEW;
END;
$function$;
