/**
 * Demand Domain Module
 * 
 * Centralized exports for all demand-related domain logic:
 * - Types (statuses, types, priorities)
 * - Labels & styling (PT labels, color tokens, icons)
 * - State machine (transitions, rules)
 * - Validators (transition validation with business rules)
 */

// Types
export type {
  DemandStatus,
  DemandType,
  DemandPriority,
  DemandRole,
  TransitionSource,
  TransitionValidationResult,
  TransitionContext,
} from './types';

// Labels
export {
  statusLabelPT,
  statusColorToken,
  statusBgColorToken,
  statusIcon,
  typeLabelPT,
  typeIcon,
  typeColorToken,
  typeBgColorToken,
  priorityLabelPT,
  priorityColorToken,
  priorityBgColorToken,
  priorityIcon,
  getStatusConfig,
  getTypeConfig,
  getPriorityConfig,
} from './labels';

// State Machine
export {
  allowedTransitions,
  restrictedTransitions,
  transitionsRequiringReason,
  recommendedFlow,
  terminalStates,
  isTransitionAllowed,
  isTransitionRestricted,
  getRestrictionReason,
  requiresTransitionReason,
  getRecommendedTransitions,
  isTerminalStatus,
  getAvailableTransitions,
} from './stateMachine';

// Validator
export {
  canTransition,
  getTransitionReasonPrompt,
  isRoleAuthorizedForTransition,
} from './validator';
