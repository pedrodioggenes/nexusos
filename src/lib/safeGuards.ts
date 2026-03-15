/**
 * Safe Guards — utilitários defensivos para o módulo Demandas.
 *
 * Funções puras, sem side-effects, sem dependências externas.
 * Usadas para normalizar dados antes de renderizar ou persistir.
 */

import type {
  DemandStatus,
  DemandPriority,
  DemandType,
} from "@/hooks/useMarketingDemands";

// ─── Tenant Context ────────────────────────────────────────

/**
 * Garante que tenant_id e user_id existem.
 * Lança erro descritivo se faltar contexto.
 */
export function assertTenantContext(
  tenantId: string | undefined | null,
  userId: string | undefined | null,
): asserts tenantId is string {
  if (!tenantId) {
    throw new Error("[safeGuard] tenant_id ausente — usuário sem tenant vinculado.");
  }
  if (!userId) {
    throw new Error("[safeGuard] user_id ausente — sessão expirada ou inválida.");
  }
}

// ─── Date Helpers ──────────────────────────────────────────

/**
 * Parse seguro de datas ISO. Retorna `null` em vez de `Invalid Date`.
 */
export function safeParseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Verifica se uma demanda está atrasada.
 * Retorna `false` para demandas já finalizadas ou sem prazo.
 */
export function isOverdue(
  dueDate: string | null | undefined,
  status: DemandStatus,
): boolean {
  if (!dueDate) return false;
  if (status === "completed" || status === "cancelled") return false;

  const due = safeParseDate(dueDate);
  if (!due) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

// ─── Normalization ─────────────────────────────────────────

const VALID_STATUSES: DemandStatus[] = [
  "open",
  "in_progress",
  "review",
  "approved",
  "completed",
  "cancelled",
];

const VALID_PRIORITIES: DemandPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
];

const VALID_TYPES: DemandType[] = [
  "social_media",
  "design",
  "copywriting",
  "video",
  "general",
];

/**
 * Normaliza status para um valor válido. Fallback: `"open"`.
 */
export function normalizeDemandStatus(raw: unknown): DemandStatus {
  if (typeof raw === "string" && VALID_STATUSES.includes(raw as DemandStatus)) {
    return raw as DemandStatus;
  }
  return "open";
}

/**
 * Normaliza prioridade. Fallback: `"medium"`.
 */
export function normalizePriority(raw: unknown): DemandPriority {
  if (typeof raw === "string" && VALID_PRIORITIES.includes(raw as DemandPriority)) {
    return raw as DemandPriority;
  }
  return "medium";
}

/**
 * Normaliza tipo de demanda. Fallback: `"general"`.
 */
export function normalizeDemandType(raw: unknown): DemandType {
  if (typeof raw === "string" && VALID_TYPES.includes(raw as DemandType)) {
    return raw as DemandType;
  }
  return "general";
}
