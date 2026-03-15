
-- RPC: rpc_complete_demand
-- Validates completion criteria server-side and transitions to 'completed'
CREATE OR REPLACE FUNCTION public.rpc_complete_demand(
  p_demand_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_demand RECORD;
  v_user_id UUID;
  v_tenant_id UUID;
  v_has_submitted_response BOOLEAN;
  v_has_final_response BOOLEAN;
  v_has_deliverable_url BOOLEAN;
  v_has_approved_response BOOLEAN;
  v_has_ready_step BOOLEAN;
  v_all_approvals_approved BOOLEAN;
  v_missing JSONB := '[]'::JSONB;
  v_demand_type TEXT;
BEGIN
  -- Auth check
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não autenticado');
  END IF;

  -- Fetch demand
  SELECT id, tenant_id, type, status, started_at, completed_at
    INTO v_demand
    FROM marketing_demands
   WHERE id = p_demand_id;

  IF v_demand IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Demanda não encontrada');
  END IF;

  v_tenant_id := v_demand.tenant_id;
  v_demand_type := v_demand.type;

  -- Tenant isolation
  IF v_tenant_id != (SELECT get_user_tenant_id(v_user_id)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem permissão para esta demanda');
  END IF;

  -- Already completed?
  IF v_demand.status = 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Demanda já está concluída');
  END IF;
  IF v_demand.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Demanda cancelada não pode ser concluída');
  END IF;

  -- Check responses
  SELECT
    EXISTS(SELECT 1 FROM demand_responses WHERE demand_id = p_demand_id AND status = 'submitted'),
    EXISTS(SELECT 1 FROM demand_responses WHERE demand_id = p_demand_id AND is_final = true),
    EXISTS(SELECT 1 FROM demand_responses WHERE demand_id = p_demand_id AND deliverable_urls IS NOT NULL AND deliverable_urls != '[]'::JSONB AND deliverable_urls != 'null'::JSONB),
    EXISTS(SELECT 1 FROM demand_responses WHERE demand_id = p_demand_id AND status = 'approved')
  INTO v_has_submitted_response, v_has_final_response, v_has_deliverable_url, v_has_approved_response;

  -- Check workflow 'ready' step
  SELECT EXISTS(
    SELECT 1 FROM demand_workflow_steps
     WHERE demand_id = p_demand_id AND step_key = 'ready' AND status = 'done'
  ) INTO v_has_ready_step;

  -- Check approvals
  SELECT NOT EXISTS(
    SELECT 1 FROM demand_approvals
     WHERE demand_id = p_demand_id AND required = true AND status != 'approved'
  ) INTO v_all_approvals_approved;

  -- Validate criteria by type
  -- Common: response_submitted
  IF NOT (v_has_submitted_response OR v_has_approved_response OR v_has_final_response) THEN
    v_missing := v_missing || jsonb_build_array(jsonb_build_object(
      'key', 'response_submitted',
      'label', 'Ao menos uma resposta submetida'
    ));
  END IF;

  -- Type-specific: deliverable
  IF v_demand_type IN ('design', 'copywriting', 'video') THEN
    IF NOT (v_has_deliverable_url OR v_has_final_response) THEN
      v_missing := v_missing || jsonb_build_array(jsonb_build_object(
        'key', 'deliverable',
        'label', 'Entregável final anexado'
      ));
    END IF;
  END IF;

  -- social_media: ready step or deliverable
  IF v_demand_type = 'social_media' THEN
    IF NOT (v_has_ready_step OR v_has_deliverable_url OR v_has_final_response) THEN
      v_missing := v_missing || jsonb_build_array(jsonb_build_object(
        'key', 'ready_or_deliverable',
        'label', 'Pronto para publicar ou entregável final'
      ));
    END IF;
  END IF;

  -- Approvals gate
  IF NOT v_all_approvals_approved THEN
    v_missing := v_missing || jsonb_build_array(jsonb_build_object(
      'key', 'approvals',
      'label', 'Todas as aprovações obrigatórias'
    ));
  END IF;

  -- If any missing, return error
  IF jsonb_array_length(v_missing) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Critérios de conclusão não atendidos',
      'missing', v_missing
    );
  END IF;

  -- All good — update demand
  UPDATE marketing_demands
     SET status = 'completed',
         completed_at = COALESCE(completed_at, NOW()),
         last_status_change_at = NOW()
   WHERE id = p_demand_id;

  -- Record history
  INSERT INTO demand_status_history (
    tenant_id, demand_id, from_status, to_status, changed_by, change_reason, source
  ) VALUES (
    v_tenant_id, p_demand_id, v_demand.status, 'completed', v_user_id, p_reason, 'system'
  );

  -- Audit log
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, tenant_id, metadata)
  VALUES (
    v_user_id, 'demand_completed', 'marketing_demands', p_demand_id::TEXT, v_tenant_id,
    jsonb_build_object('from_status', v_demand.status, 'reason', p_reason, 'criteria_type', v_demand_type)
  );

  RETURN jsonb_build_object(
    'success', true,
    'demand_id', p_demand_id
  );
END;
$$;
