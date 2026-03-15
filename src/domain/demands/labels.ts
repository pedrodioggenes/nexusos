/**
 * Demand Domain Labels & Styling
 * 
 * Centralized mapping of statuses, types, and priorities to:
 * - Portuguese labels
 * - Color tokens (design system)
 * - Icons (lucide-react)
 */

import type { DemandStatus, DemandType, DemandPriority } from './types';

// ─── STATUS ────────────────────────────────────────────────────

export const statusLabelPT: Record<DemandStatus, string> = {
  open: 'A Fazer',
  in_progress: 'Fazendo',
  review: 'Revisão',
  approved: 'Aprovado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const statusColorToken: Record<DemandStatus, string> = {
  open: 'text-muted-foreground',
  in_progress: 'text-blue-500',
  review: 'text-yellow-500',
  approved: 'text-green-500',
  completed: 'text-indigo-500',
  cancelled: 'text-destructive',
};

export const statusBgColorToken: Record<DemandStatus, string> = {
  open: 'bg-muted',
  in_progress: 'bg-blue-500/10',
  review: 'bg-yellow-500/10',
  approved: 'bg-green-500/10',
  completed: 'bg-indigo-500/10',
  cancelled: 'bg-destructive/10',
};

export const statusIcon: Record<DemandStatus, string> = {
  open: 'circle',
  in_progress: 'loader-circle',
  review: 'eye',
  approved: 'check-circle-2',
  completed: 'check-circle',
  cancelled: 'x-circle',
};

// ─── TYPE ──────────────────────────────────────────────────────

export const typeLabelPT: Record<DemandType, string> = {
  social_media: 'Social Media',
  design: 'Design',
  copywriting: 'Copywriting',
  video: 'Vídeo',
  general: 'Geral',
};

export const typeIcon: Record<DemandType, string> = {
  social_media: 'share-2',
  design: 'palette',
  copywriting: 'type',
  video: 'film',
  general: 'clipboard-list',
};

export const typeColorToken: Record<DemandType, string> = {
  social_media: 'text-pink-500',
  design: 'text-purple-500',
  copywriting: 'text-amber-500',
  video: 'text-red-500',
  general: 'text-slate-500',
};

export const typeBgColorToken: Record<DemandType, string> = {
  social_media: 'bg-pink-500/10',
  design: 'bg-purple-500/10',
  copywriting: 'bg-amber-500/10',
  video: 'bg-red-500/10',
  general: 'bg-slate-500/10',
};

// ─── PRIORITY ──────────────────────────────────────────────────

export const priorityLabelPT: Record<DemandPriority, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export const priorityColorToken: Record<DemandPriority, string> = {
  urgent: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-slate-400',
};

export const priorityBgColorToken: Record<DemandPriority, string> = {
  urgent: 'bg-red-500/10',
  high: 'bg-orange-500/10',
  medium: 'bg-yellow-500/10',
  low: 'bg-slate-500/10',
};

export const priorityIcon: Record<DemandPriority, string> = {
  urgent: 'alert-circle',
  high: 'triangle-alert',
  medium: 'info',
  low: 'circle',
};

// ─── UTILITY ───────────────────────────────────────────────────

/**
 * Returns a complete label configuration for a status.
 */
export function getStatusConfig(status: DemandStatus) {
  return {
    label: statusLabelPT[status],
    color: statusColorToken[status],
    bgColor: statusBgColorToken[status],
    icon: statusIcon[status],
  };
}

/**
 * Returns a complete label configuration for a type.
 */
export function getTypeConfig(type: DemandType) {
  return {
    label: typeLabelPT[type],
    color: typeColorToken[type],
    bgColor: typeBgColorToken[type],
    icon: typeIcon[type],
  };
}

/**
 * Returns a complete label configuration for a priority.
 */
export function getPriorityConfig(priority: DemandPriority) {
  return {
    label: priorityLabelPT[priority],
    color: priorityColorToken[priority],
    bgColor: priorityBgColorToken[priority],
    icon: priorityIcon[priority],
  };
}
