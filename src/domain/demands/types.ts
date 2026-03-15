/**
 * Demand Domain Types
 * 
 * Single source of truth for all demand-related enumerations.
 * Used across the entire Marketing Demandas module.
 */

export type DemandStatus =
  | 'open'
  | 'in_progress'
  | 'review'
  | 'approved'
  | 'completed'
  | 'cancelled';

export type DemandType =
  | 'social_media'
  | 'design'
  | 'copywriting'
  | 'video'
  | 'general';

export type DemandPriority =
  | 'urgent'
  | 'high'
  | 'medium'
  | 'low';

export type DemandRole = 'gestor' | 'colaborador' | 'admin';

export type TransitionSource =
  | 'kanban'
  | 'detailsheet'
  | 'quickaction'
  | 'system'
  | 'api';

/**
 * Represents the result of a transition validation.
 */
export interface TransitionValidationResult {
  ok: boolean;
  requiresReason: boolean;
  reasonPrompt?: string;
  hardBlock: boolean;
  blockReason?: string;
}

/**
 * Transition context for validation.
 */
export interface TransitionContext {
  from: DemandStatus;
  to: DemandStatus;
  role: DemandRole;
  departmentRole?: 'gestor' | 'colaborador';
  hasApproval?: boolean;
  hasFinalDeliverable?: boolean;
  requirements?: Record<string, boolean>;
  reason?: string;
}
