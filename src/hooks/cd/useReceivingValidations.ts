/**
 * CD Receiving Validation Functions
 * Based on formal specification: "Auditoria Técnica de Lógica Matemática — CD v1.0"
 * 
 * §2.1 — Dock Conflict Validation
 * §2.2 — Temperature Validation
 * §2.3 — Expiry Validation
 * §2.4 — Quantity Validation
 */

// ==================== §2.1 — Dock Conflict ====================

export interface ScheduleSlot {
  id: string;
  dock: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Definição 2.1 (Conflito de Doca).
 * Dois agendamentos a_i e a_j constituem conflito se:
 *   d_i = d_j ∧ τ_ini_i < τ_fim_j ∧ τ_ini_j < τ_fim_i
 */
export function findDockConflicts(
  schedules: ScheduleSlot[],
  newSchedule: ScheduleSlot
): ScheduleSlot[] {
  return schedules.filter((existing) => {
    if (existing.id === newSchedule.id) return false;
    if (existing.dock !== newSchedule.dock) return false;
    // Overlap check: start_i < end_j AND start_j < end_i
    return (
      existing.startTime < newSchedule.endTime &&
      newSchedule.startTime < existing.endTime
    );
  });
}

/**
 * Validate a new schedule against existing ones.
 * Returns { valid: true } or { valid: false, conflicts: [...] }
 */
export function validateDockWindow(
  existingSchedules: ScheduleSlot[],
  newSchedule: ScheduleSlot
): { valid: boolean; conflicts: ScheduleSlot[] } {
  const conflicts = findDockConflicts(existingSchedules, newSchedule);
  return { valid: conflicts.length === 0, conflicts };
}

// ==================== §2.2 — Temperature Validation ====================

export type TemperatureResult = "CONFORME" | "NÃO_CONFORME";

/**
 * Definição 2.2 (Intervalo de Temperatura Aceitável).
 * φ_T(s, T_medida) = CONFORME if T_medida ∈ [T_min(s), T_max(s)]
 *                   = NÃO_CONFORME otherwise
 */
export function validateTemperature(
  measuredTemp: number,
  tempMin: number,
  tempMax: number
): { result: TemperatureResult; deviation: number | null } {
  if (measuredTemp >= tempMin && measuredTemp <= tempMax) {
    return { result: "CONFORME", deviation: null };
  }
  const deviation = measuredTemp < tempMin
    ? measuredTemp - tempMin
    : measuredTemp - tempMax;
  return { result: "NÃO_CONFORME", deviation };
}

// ==================== §2.3 — Expiry Validation ====================

export type ExpiryResult = "ACEITO" | "RECUSADO";

/**
 * Definição 2.3 (Prazo Residual de Validade).
 * Δ_val(b, t0) = t_val(b) - t0 [em dias]
 * φ_V(s, b, t0) = ACEITO se Δ_val ≥ P_min(s)
 *               = RECUSADO se Δ_val < P_min(s)
 * 
 * Caso Degenerado 2.1: Se Δ_val ≤ 0, lote vencido → RECUSADO automático
 * com NC tipo VALIDADE_INADEQUADA, prioridade máxima.
 */
export function validateExpiry(
  expirationDate: Date,
  receivingDate: Date,
  minAcceptanceDays: number
): {
  result: ExpiryResult;
  residualDays: number;
  isExpired: boolean;
  shouldAutoReject: boolean;
} {
  const diffMs = expirationDate.getTime() - receivingDate.getTime();
  const residualDays = Math.floor(diffMs / 86400000);
  const isExpired = residualDays <= 0;
  const shouldAutoReject = isExpired;
  const result: ExpiryResult = residualDays >= minAcceptanceDays ? "ACEITO" : "RECUSADO";

  return { result, residualDays, isExpired, shouldAutoReject };
}

// ==================== §2.4 — Quantity Validation ====================

export type QuantityResult =
  | "CONFORME"
  | "REC_PARCIAL"
  | "DIVERGÊNCIA"
  | "BLOQUEADO";

/**
 * Definição 2.4 (Função de Divergência de Quantidade).
 * δ_Q(Q_fis, Q_NF) = Q_fis - Q_NF
 * 
 * Classificação:
 *   CONFORME    se δ_Q = 0 ∧ Q_fis = Q_OC
 *   REC_PARCIAL se δ_Q = 0 ∧ Q_fis < Q_OC
 *   DIVERGÊNCIA se δ_Q ≠ 0
 *   BLOQUEADO   se Q_fis > Q_NF
 */
export function validateQuantity(
  qtyPhysical: number,
  qtyInvoice: number,
  qtyPurchaseOrder: number
): {
  result: QuantityResult;
  deltaQ: number;
  divergencePct: number | null;
} {
  const deltaQ = qtyPhysical - qtyInvoice;
  const divergencePct = qtyInvoice > 0
    ? (deltaQ / qtyInvoice) * 100
    : null;

  let result: QuantityResult;
  if (qtyPhysical > qtyInvoice) {
    result = "BLOQUEADO";
  } else if (deltaQ !== 0) {
    result = "DIVERGÊNCIA";
  } else if (qtyPhysical < qtyPurchaseOrder) {
    result = "REC_PARCIAL";
  } else {
    result = "CONFORME";
  }

  return { result, deltaQ, divergencePct };
}
