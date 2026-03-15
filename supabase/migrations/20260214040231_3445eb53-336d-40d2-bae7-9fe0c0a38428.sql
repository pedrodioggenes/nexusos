-- ═══════════════════════════════════════════════════════════════
-- RPC: rpc_decide_demand_approval
-- Server-side enforcement of approval decisions with RBAC
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.rpc_decide_demand_approval(
  p_approval_id UUID,
  p_decision TEXT,         -- 'approved' | 'changes_requested' | 'rejected'
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_tenant_id UUID;
  v_user_role app_role;
  v_department_role TEXT;
  v_approval RECORD;
  v_demand_id UUID;
BEGIN
  -- 1. Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;

  -- 2. Get user's tenant and roles
  SELECT tenant_id, role, COALESCE(department_role, 'colaborador')
    INTO v_tenant_id, v_user_role, v_department_role
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tenant não encontrado');
  END IF;

  -- 3. RBAC check: only admin or gestor can decide
  IF v_user_role NOT IN ('admin') AND v_department_role != 'gestor' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem permissão para decidir aprovações. Apenas gestores e administradores podem aprovar ou rejeitar.');
  END IF;

  -- 4. Validate decision value
  IF p_decision NOT IN ('approved', 'changes_requested', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Decisão inválida. Use: approved, changes_requested ou rejected.');
  END IF;

  -- 5. Fetch approval and validate tenant
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

  -- 6. Update approval
  UPDATE public.demand_approvals
  SET status = p_decision,
      note = COALESCE(p_note, note),
      decided_at = now(),
      approver_user_id = v_user_id,
      updated_at = now()
  WHERE id = p_approval_id
    AND tenant_id = v_tenant_id;

  -- 7. Audit log
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
$$;

-- Grant execute to authenticated users (RPC handles RBAC internally)
GRANT EXECUTE ON FUNCTION public.rpc_decide_demand_approval(UUID, TEXT, TEXT) TO authenticated;