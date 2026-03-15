/**
 * Demand State Machine
 * 
 * Defines allowed status transitions, restricted moves, and workflow recommendations.
 * This is the authoritative rule engine for demand lifecycle management.
 */

import type { DemandStatus } from './types';

// ─── ALLOWED TRANSITIONS ───────────────────────────────────────

/**
 * Base allowed transitions for each status.
 * Represents the "happy path" and legitimate alternatives.
 */
export const allowedTransitions: Record<DemandStatus, DemandStatus[]> = {
  open: ['in_progress', 'cancelled'],           // A Fazer → Fazendo (acuse de recebimento)
  in_progress: ['review', 'cancelled', 'open'], // Fazendo → Revisão (entrega)
  review: ['approved', 'in_progress'],           // Revisão → Aprovado ou volta para Fazendo (reprovado)
  approved: ['completed'],                       // Aprovado → Concluído (opcional, estado terminal)
  completed: [],                                 // Estado terminal
  cancelled: [],                                 // Estado terminal
};

// ─── RESTRICTED TRANSITIONS ────────────────────────────────────

/**
 * Transitions that require explicit approval, final deliverables, or special context.
 * Key: from -> to, Value: why it's restricted
 */
export const restrictedTransitions: Record<string, string> = {
  'open->completed': 'Demanda deve passar por revisão e aprovação',
  'in_progress->approved': 'Demanda deve passar por revisão antes',
  'review->completed': 'Demanda deve ser aprovada primeiro',
  'completed->open': 'Reativação de demanda concluída requer override admin',
  'cancelled->open': 'Reabertura de demanda cancelada requer override admin',
};

// ─── TRANSITIONS REQUIRING REASON ──────────────────────────────

/**
 * Transitions where a reason/explanation is mandatory.
 */
export const transitionsRequiringReason: Set<string> = new Set([
  'open->completed',
  'in_progress->cancelled',
  'review->cancelled',
  'approved->cancelled',
  'completed->open',
  'cancelled->open',
]);

// ─── WORKFLOW RECOMMENDATION ──────────────────────────────────

/**
 * The ideal happy-path flow for a demand.
 */
export const recommendedFlow: DemandStatus[] = [
  'open',
  'in_progress',
  'review',
  'approved',
];

// ─── TERMINAL STATES ───────────────────────────────────────────

export const terminalStates: Set<DemandStatus> = new Set([
  'completed',
  'cancelled',
]);

// ─── UTILITY FUNCTIONS ─────────────────────────────────────────

/**
 * Check if a transition is allowed in the base state machine.
 */
export function isTransitionAllowed(
  from: DemandStatus,
  to: DemandStatus
): boolean {
  if (from === to) return false; // No self-transitions
  return allowedTransitions[from]?.includes(to) ?? false;
}

/**
 * Check if a transition is restricted (requires special context).
 */
export function isTransitionRestricted(from: DemandStatus, to: DemandStatus): boolean {
  const key = `${from}->${to}`;
  return key in restrictedTransitions;
}

/**
 * Get the restriction reason if transition is restricted.
 */
export function getRestrictionReason(from: DemandStatus, to: DemandStatus): string | null {
  const key = `${from}->${to}`;
  return restrictedTransitions[key] ?? null;
}

/**
 * Check if a transition requires a reason to be provided.
 */
export function requiresTransitionReason(from: DemandStatus, to: DemandStatus): boolean {
  const key = `${from}->${to}`;
  return transitionsRequiringReason.has(key);
}

/**
 * Get recommended next statuses for a given status.
 */
export function getRecommendedTransitions(current: DemandStatus): DemandStatus[] {
  const currentIndex = recommendedFlow.indexOf(current);
  if (currentIndex === -1) return [];

  // Recommend next in flow + cancellation
  const recommended: DemandStatus[] = [];

  // Add next in happy path
  if (currentIndex < recommendedFlow.length - 1) {
    recommended.push(recommendedFlow[currentIndex + 1]);
  }

  // Always allow cancel unless terminal
  if (!terminalStates.has(current)) {
    recommended.push('cancelled');
  }

  return recommended;
}

/**
 * Check if a status is a terminal state (no further transitions).
 */
export function isTerminalStatus(status: DemandStatus): boolean {
  return terminalStates.has(status);
}

/**
 * Get all available next statuses (unrestricted base transitions).
 */
export function getAvailableTransitions(from: DemandStatus): DemandStatus[] {
  return allowedTransitions[from] ?? [];
}
