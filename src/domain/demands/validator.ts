/**
 * Demand Transition Validator
 * 
 * Applies business rules to determine if a transition is allowed
 * and what conditions must be met.
 */

import type { TransitionContext, TransitionValidationResult } from './types';
import {
  isTransitionAllowed,
  isTransitionRestricted,
  getRestrictionReason,
  requiresTransitionReason,
  isTerminalStatus,
} from './stateMachine';
import { statusLabelPT } from './labels';

// ─── VALIDATOR ─────────────────────────────────────────────────

/**
 * Validates if a transition is allowed given the context.
 * Returns detailed information about whether it's allowed, why not,
 * and what's required.
 */
export function canTransition(context: TransitionContext): TransitionValidationResult {
  const { from, to, role, departmentRole, hasApproval, hasFinalDeliverable, requirements, reason } = context;

  // Rule 1: Basic state machine check
  if (!isTransitionAllowed(from, to)) {
    const fromLabel = statusLabelPT[from];
    const toLabel = statusLabelPT[to];
    return {
      ok: false,
      requiresReason: false,
      hardBlock: true,
      blockReason: `Transição de "${fromLabel}" para "${toLabel}" não é permitida no fluxo.`,
    };
  }

  // Rule 2: Cannot transition from terminal state
  if (isTerminalStatus(from)) {
    return {
      ok: false,
      requiresReason: false,
      hardBlock: true,
      blockReason: `Demanda em status terminal (${statusLabelPT[from]}) não pode ser alterada sem override.`,
    };
  }

  // Rule 3: Check if transition is restricted
  if (isTransitionRestricted(from, to)) {
    const restrictionReason = getRestrictionReason(from, to);

    // Admin can override
    if (role === 'admin') {
      // Still check for required context
      if (to === 'completed' && !hasFinalDeliverable) {
        return {
          ok: false,
          requiresReason: true,
          reasonPrompt: 'Por que a demanda está sendo concluída sem entregável final?',
          hardBlock: true,
          blockReason: 'Demanda completa requer entregável final ou justificativa admin.',
        };
      }

      return {
        ok: true,
        requiresReason: requiresTransitionReason(from, to),
        reasonPrompt: restrictionReason ?? undefined,
        hardBlock: false,
      };
    }

    // Gestor can override in specific cases
    if (departmentRole === 'gestor') {
      // Gestores can move through review->approved even if marked as restricted
      if (from === 'review' && to === 'approved') {
        return {
          ok: true,
          requiresReason: false,
          hardBlock: false,
        };
      }

      // Gestores cannot reactivate terminal states
      if (isTerminalStatus(from)) {
        return {
          ok: false,
          hardBlock: true,
          requiresReason: false,
          blockReason: 'Apenas administrador pode reativar demandas encerradas.',
        };
      }
    }

    // Colaborador (default) cannot bypass restrictions
    return {
      ok: false,
      requiresReason: false,
      hardBlock: true,
      blockReason: restrictionReason ?? 'Transição restrita. Contacte um gestor.',
    };
  }

  // Rule 4: Approval-gated completion
  // When hasApproval is explicitly false and transitioning to 'completed',
  // block if there are required approvals that haven't been granted
  if (to === 'completed' && hasApproval === false) {
    return {
      ok: false,
      requiresReason: false,
      hardBlock: true,
      blockReason: 'Esta demanda possui aprovações pendentes. Conclua o processo de aprovação antes de finalizar.',
    };
  }

  // Rule 5: Check if reason is required
  const needsReason = requiresTransitionReason(from, to);
  if (needsReason && !reason?.trim()) {
    return {
      ok: false,
      requiresReason: true,
      reasonPrompt: getTransitionReasonPrompt(from, to),
      hardBlock: true,
      blockReason: 'Motivo da alteração é obrigatório para esta transição.',
    };
  }

  // Rule 6: Check custom requirements (can be partial failures)
  if (requirements) {
    const failedRequirements = Object.entries(requirements)
      .filter(([_, met]) => !met)
      .map(([key, _]) => key);

    if (failedRequirements.length > 0) {
      // Some requirements failed, but don't hard-block
      // Log them for audit purposes
      console.warn(`[Demand Validator] Unmet requirements for ${from}->${to}:`, failedRequirements);
    }
  }

  // ✅ Transition allowed
  return {
    ok: true,
    requiresReason: needsReason,
    hardBlock: false,
  };
}

// ─── UTILITY ───────────────────────────────────────────────────

/**
 * Get a contextual prompt for why a reason is needed for this transition.
 */
export function getTransitionReasonPrompt(from: string, to: string): string {
  const reasonMap: Record<string, string> = {
    'open->completed': 'Por que a demanda foi completada sem passar por revisão?',
    'in_progress->cancelled': 'Por que a demanda está sendo cancelada?',
    'review->cancelled': 'Motivo do cancelamento em revisão:',
    'approved->cancelled': 'Motivo do cancelamento da demanda aprovada:',
    'completed->open': 'Por que a demanda concluída está sendo reabertura?',
    'cancelled->open': 'Justifique a reabertura da demanda cancelada:',
  };

  return (
    reasonMap[`${from}->${to}`] ||
    'Forneça um motivo para esta alteração:'
  );
}

/**
 * Check if a role is authorized for a transition.
 * (Separate from state machine rules—this is purely role-based.)
 */
export function isRoleAuthorizedForTransition(
  from: string,
  to: string,
  role: 'gestor' | 'colaborador' | 'admin'
): boolean {
  // Admins can always transition (subject to state machine rules)
  if (role === 'admin') return true;

  // Gestores can transition within most cases
  if (role === 'gestor') {
    // Restrict specific transitions to admin only
    const adminOnlyTransitions = [
      'completed->open',
      'cancelled->open',
    ];
    const key = `${from}->${to}`;
    return !adminOnlyTransitions.includes(key);
  }

  // Colaboradores have limited transitions (usually just moving their own work forward)
  // Colaboradores: acusar recebimento e entregar para revisão
  const colaboradorAllowed = [
    'open->in_progress',       // Acuse de recebimento
    'in_progress->review',     // Entrega para revisão
  ];
  const key = `${from}->${to}`;
  return colaboradorAllowed.includes(key);
}
