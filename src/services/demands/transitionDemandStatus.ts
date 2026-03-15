/**
 * Demand Status Transition Service
 *
 * Centralized service for all demand status transitions.
 * Handles validation, history tracking, and timestamp management.
 */

import { supabase } from "@/integrations/supabase/client";
import { TransitionSource } from "@/domain/demands/types";
import { canTransition, type DemandStatus, type DemandRole } from "@/domain/demands";
import type { TransitionValidationResult } from "@/domain/demands";

interface TransitionDemandStatusInput {
  demandId: string;
  toStatus: DemandStatus;
  source: TransitionSource;
  reason?: string;
  userId: string; // Current user ID for audit trail
  tenantId: string; // Current tenant for RLS
  /** Caller's DemandRole. If omitted, resolved from user_roles in DB. */
  role?: DemandRole;
  /** Caller's departmentRole ('gestor' | 'colaborador'). If omitted, resolved from user_roles in DB. */
  departmentRole?: 'gestor' | 'colaborador';
}

interface TransitionDemandStatusResult {
  success: boolean;
  validation?: TransitionValidationResult;
  error?: string;
  demandId?: string;
  historyId?: string;
}

/**
 * Transition a demand to a new status with full validation and history tracking.
 */
export async function transitionDemandStatus(
  input: TransitionDemandStatusInput
): Promise<TransitionDemandStatusResult> {
  try {
    const { demandId, toStatus, source, reason, userId, tenantId } = input;

    // Resolve caller role from DB when not provided by caller
    let resolvedRole: DemandRole = input.role ?? 'colaborador';
    let resolvedDeptRole: 'gestor' | 'colaborador' = input.departmentRole ?? 'colaborador';

    if (!input.role) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role, department_role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleRow) {
        const appRole = roleRow.role as string;
        const deptRole = (roleRow as any).department_role as string | null;
        resolvedDeptRole = deptRole === 'gestor' ? 'gestor' : 'colaborador';
        if (appRole === 'admin') resolvedRole = 'admin';
        else if (resolvedDeptRole === 'gestor') resolvedRole = 'gestor';
        else resolvedRole = 'colaborador';
      }
    }

    // Step 1: Fetch current demand
    const { data: demand, error: fetchError } = await supabase
      .from("marketing_demands")
      .select("status, created_at, started_at, completed_at")
      .eq("id", demandId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!demand) {
      return {
        success: false,
        error: "Demanda não encontrada",
      };
    }

    const fromStatus = demand.status as DemandStatus;

    // Step 1b: Check approval status for completion gating
    let hasApproval = true; // Default: no approval required = approved
    const { data: requiredApprovals } = await supabase
      .from("demand_approvals")
      .select("status")
      .eq("demand_id", demandId)
      .eq("tenant_id", tenantId)
      .eq("required", true);

    if (requiredApprovals && requiredApprovals.length > 0) {
      const allApproved = requiredApprovals.every(
        (a) => a.status === "approved"
      );
      hasApproval = allApproved;
    }

    // Step 1c: Check for final deliverable
    let hasFinalDeliverable = true;
    if (toStatus === "completed") {
      const { data: finalResponses } = await supabase
        .from("demand_responses")
        .select("is_final, deliverable_urls, status")
        .eq("demand_id", demandId);

      hasFinalDeliverable = (finalResponses || []).some(
        (r) =>
          r.is_final === true ||
          (r.deliverable_urls != null &&
            JSON.stringify(r.deliverable_urls) !== "[]" &&
            JSON.stringify(r.deliverable_urls) !== "null")
      );
    }

    // Step 2: Validate transition using domain logic
    const validation = canTransition({
      from: fromStatus,
      to: toStatus,
      role: resolvedRole,
      departmentRole: resolvedDeptRole,
      hasApproval,
      hasFinalDeliverable,
      reason,
    });

    if (!validation.ok) {
      return {
        success: false,
        validation,
        error: validation.blockReason || "Transição não permitida",
      };
    }

    // Step 3: Check if reason is required but not provided
    if (validation.requiresReason && !reason?.trim()) {
      return {
        success: false,
        validation: {
          ...validation,
          ok: false,
          hardBlock: true,
          blockReason: validation.reasonPrompt || "Motivo é obrigatório",
        },
        error: "Motivo obrigatório para esta transição",
      };
    }

    // Step 4: Prepare updates for marketing_demands
    const updates: Record<string, unknown> = {
      status: toStatus,
      last_status_change_at: new Date().toISOString(),
    };

    // Set timestamps based on target status
    if (toStatus === "in_progress" && !demand.started_at) {
      updates.started_at = new Date().toISOString();
    }
    if (toStatus === "completed" && !demand.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    // Step 5: Update demand status
    const { error: updateError } = await supabase
      .from("marketing_demands")
      .update(updates)
      .eq("id", demandId)
      .eq("tenant_id", tenantId);

    if (updateError) throw updateError;

    // Step 6: Record in demand_status_history
    const { data: history, error: historyError } = await supabase
      .from("demand_status_history")
      .insert({
        tenant_id: tenantId,
        demand_id: demandId,
        from_status: fromStatus,
        to_status: toStatus,
        changed_by: userId,
        change_reason: reason || null,
        source,
      })
      .select("id")
      .single();

    if (historyError) {
      console.error("Failed to record history:", historyError);
      // Don't fail the whole transition if history fails
    }

    return {
      success: true,
      demandId,
      historyId: history?.id,
    };
  } catch (error) {
    console.error("[transitionDemandStatus] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar status",
    };
  }
}

/**
 * Get the validation result for a transition without updating.
 * Useful for previewing what will happen before confirming.
 */
export async function validateTransition(
  demandId: string,
  toStatus: DemandStatus,
  tenantId: string,
  userId?: string
): Promise<TransitionValidationResult | null> {
  try {
    const { data: demand, error } = await supabase
      .from("marketing_demands")
      .select("status")
      .eq("id", demandId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error || !demand) return null;

    const fromStatus = demand.status as DemandStatus;

    let role: DemandRole = 'colaborador';
    let departmentRole: 'gestor' | 'colaborador' = 'colaborador';

    if (userId) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role, department_role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleRow) {
        const appRole = roleRow.role as string;
        const deptRole = (roleRow as any).department_role as string | null;
        departmentRole = deptRole === 'gestor' ? 'gestor' : 'colaborador';
        if (appRole === 'admin') role = 'admin';
        else if (departmentRole === 'gestor') role = 'gestor';
        else role = 'colaborador';
      }
    }

    return canTransition({
      from: fromStatus,
      to: toStatus,
      role,
      departmentRole,
    });
  } catch (error) {
    console.error("[validateTransition] Error:", error);
    return null;
  }
}
