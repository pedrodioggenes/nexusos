/**
 * CD KPI Calculations
 * Based on formal specification: "Auditoria Técnica de Lógica Matemática — CD v1.0"
 * 
 * All formulas follow the canonical definitions from the spec document.
 * NaN is used for undefined/insufficient data per spec conventions.
 */

// ==================== §2 — Receiving ====================

/**
 * §2.6 — Receiving Accuracy Rate (RAR)
 * RAR(P) = |R_conf| / |R_P| × 100
 * Caso Degenerado 2.2: If |R_P| = 0, return NaN
 */
export function calcReceivingAccuracyRate(records: any[]): number | null {
  const closed = records.filter((r) => r.completed_at);
  if (closed.length === 0) return null; // NaN → "sem dados"
  const conforme = closed.filter((r) => r.result === "approved");
  return (conforme.length / closed.length) * 100;
}

/**
 * §2.7 — Dock-to-Stock Time (DST)
 * DST(P) = (1/|R_P|) × Σ DST(r)
 * Caso Degenerado 2.3: If no put-away tasks, DST(r) = NaN
 */
export function calcAvgDockToStock(records: any[]): number | null {
  const withD2S = records.filter((r) => r.dock_to_stock_minutes != null && r.dock_to_stock_minutes > 0);
  if (withD2S.length === 0) return null;
  const sum = withD2S.reduce((s: number, r: any) => s + r.dock_to_stock_minutes, 0);
  return Math.round(sum / withD2S.length);
}

// ==================== §3 — Storage ====================

/**
 * §3.2 — Space Utilization Rate (SUR) per zone
 * SUR(z) = |L_ocup ∩ zone=z| / |L_ativ ∩ zone=z| × 100
 */
export function calcSpaceUtilizationRate(locations: any[], zone?: string): number | null {
  let active = locations.filter((l: any) => l.is_active);
  if (zone) active = active.filter((l: any) => l.zone === zone);
  if (active.length === 0) return null;
  const occupied = active.filter((l: any) => l.is_occupied);
  return (occupied.length / active.length) * 100;
}

/**
 * §3.3 — Inventory Accuracy (IA)
 * IA(P) = |C_0| / |C_P| × 100
 * Caso Degenerado 3.2: If |C_P| = 0, return NaN
 */
export function calcInventoryAccuracy(cycleCounts: any[]): number | null {
  if (cycleCounts.length === 0) return null;
  const noDivergence = cycleCounts.filter((c: any) => c.delta === 0 || c.delta == null);
  return (noDivergence.length / cycleCounts.length) * 100;
}

// ==================== §4 — Demand ====================

/**
 * §4.2 — ADD (Average Daily Demand) with declining weights 3/2/1
 * Window: W = {-1, -2, ..., -30}
 * W1 = W* ∩ {-1,...,-10}, w1=3
 * W2 = W* ∩ {-11,...,-20}, w2=2
 * W3 = W* ∩ {-21,...,-30}, w3=1
 * Caso Degenerado 4.1: If |W*| = 0, return NaN
 * Caso Degenerado 4.2: If |W*| < 7, flag DADO_INSUFICIENTE
 */
export function calcADD(
  salesData: { date: string; qty_sold: number; had_rupture: boolean }[]
): { value: number | null; flag?: string } {
  // Filter valid days (no rupture)
  const validDays = salesData.filter((d) => !d.had_rupture);
  if (validDays.length === 0) return { value: null, flag: "SEM_DADOS" };

  const now = new Date();
  const getAge = (dateStr: string) => {
    const d = new Date(dateStr);
    return Math.floor((now.getTime() - d.getTime()) / 86400000);
  };

  const w1Days = validDays.filter((d) => { const age = getAge(d.date); return age >= 1 && age <= 10; });
  const w2Days = validDays.filter((d) => { const age = getAge(d.date); return age >= 11 && age <= 20; });
  const w3Days = validDays.filter((d) => { const age = getAge(d.date); return age >= 21 && age <= 30; });

  const w1 = 3, w2 = 2, w3 = 1;
  const sumW1 = w1Days.reduce((s, d) => s + d.qty_sold, 0);
  const sumW2 = w2Days.reduce((s, d) => s + d.qty_sold, 0);
  const sumW3 = w3Days.reduce((s, d) => s + d.qty_sold, 0);

  const denominator = w1 * w1Days.length + w2 * w2Days.length + w3 * w3Days.length;
  if (denominator === 0) return { value: null, flag: "SEM_DADOS" };

  const add = (w1 * sumW1 + w2 * sumW2 + w3 * sumW3) / denominator;

  const totalValid = w1Days.length + w2Days.length + w3Days.length;
  const flag = totalValid < 7 ? "DADO_INSUFICIENTE" : undefined;

  return { value: add, flag };
}

/**
 * §4.7 — Rupture Projection
 * t_rupt = t0 + floor(E_disp / ADD)
 * Caso Degenerado 4.6: If ADD = 0 or NaN, return null
 */
export function calcRuptureProjectionDays(availableStock: number, add: number | null): number | null {
  if (add == null || add <= 0) return null;
  return Math.floor(availableStock / add);
}

/**
 * §4.8 — OOS Cost Projected
 * OOSproj = ADD × Δgap × (1 - τ_sub) × M_unit
 */
export function calcOOSCost(
  add: number,
  gapDays: number,
  substitutionRate: number,
  unitMargin: number
): number {
  return add * Math.max(0, gapDays) * (1 - substitutionRate) * unitMargin;
}

// ==================== §5 — Separation ====================

/**
 * §5.2 — Order Picking Accuracy (PA)
 * PA(P) = |I_corr| / |I_P| × 100
 */
export function calcPickingAccuracy(tasks: any[]): number | null {
  const completed = tasks.filter((t: any) => t.status === "completed" && t.accuracy_rate != null);
  if (completed.length === 0) return null;
  const sum = completed.reduce((s: number, t: any) => s + (t.accuracy_rate || 0), 0);
  return sum / completed.length;
}

/**
 * §5.3 — On-Time Dispatch Rate (OTD)
 * OTD(P) = |E_ontime| / |E_P| × 100
 */
export function calcOnTimeDispatch(orders: any[]): number | null {
  const dispatched = orders.filter((o: any) => o.status === "shipped" || o.status === "delivered");
  if (dispatched.length === 0) return null;
  // For MVP: orders marked shipped/delivered are considered on-time
  // Full implementation needs planned vs actual dispatch timestamps
  return (dispatched.length / Math.max(orders.length, 1)) * 100;
}

/**
 * §5.4 — Picking Productivity (PP)
 * PP = Σ L(o) / Σ H(o) [lines/hour]
 * Caso Degenerado 5.1: If H(o) = 0, PP = NaN
 */
export function calcPickingProductivity(tasks: any[]): number | null {
  const completed = tasks.filter((t: any) => t.status === "completed" && t.started_at && t.completed_at);
  if (completed.length === 0) return null;

  let totalItems = 0;
  let totalHours = 0;

  completed.forEach((t: any) => {
    totalItems += t.items_picked || t.items_total || 0;
    const started = new Date(t.started_at).getTime();
    const ended = new Date(t.completed_at).getTime();
    totalHours += (ended - started) / 3600000;
  });

  if (totalHours <= 0) return null;
  return Math.round(totalItems / totalHours);
}

// ==================== §6 — Quality ====================

/**
 * §6.1 — Loss Valuation
 * V_k = Q_k × C_unit(s_k)
 */
export function calcLossValue(loss: any): number {
  return loss.total_value || (loss.qty || 0) * (loss.unit_cost || loss.avg_unit_cost || 0);
}

/**
 * §6.2 — CD Shrink Rate
 * CSR(P) = (Σ V_k for k ∈ K_P) / V_rec(P) × 100
 * WHERE V_rec(P) = total value of goods RECEIVED in the period
 * Caso Degenerado 6.1: If V_rec(P) = 0, return NaN
 * 
 * IMPORTANT: Denominator is RECEIVED VALUE, not stock value!
 */
export function calcCDShrinkRate(losses: any[], totalReceivedValue: number): number | null {
  if (totalReceivedValue <= 0) return null; // NaN case
  const totalLossValue = losses.reduce((s: number, l: any) => s + calcLossValue(l), 0);
  return (totalLossValue / totalReceivedValue) * 100;
}

/**
 * §6.2 — CSR by origin breakdown
 * CSR_origin(P, o) = (Σ V_k for k where origin=o) / V_rec(P) × 100
 * Origins per spec: RECEBIMENTO, ARMAZENAGEM, MANUSEIO, VENCIMENTO
 */
export function calcShrinkByOrigin(
  losses: any[],
  totalReceivedValue: number
): { origin: string; value: number; rate: number | null }[] {
  const map: Record<string, number> = {};
  losses.forEach((l: any) => {
    const origin = l.origin || "other";
    map[origin] = (map[origin] || 0) + calcLossValue(l);
  });
  return Object.entries(map)
    .map(([origin, value]) => ({
      origin,
      value,
      rate: totalReceivedValue > 0 ? (value / totalReceivedValue) * 100 : null,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * §6.3 — Vendor Shrink Rate
 * VSR(f, P) = (Σ V_k for supplier=f) / V_rec(f, P) × 100
 */
export function calcVendorShrinkRate(
  losses: any[],
  receivedValueBySupplier: Record<string, number>
): { supplier: string; supplierName: string; lossValue: number; receivedValue: number; rate: number | null }[] {
  const supplierLosses: Record<string, { name: string; value: number }> = {};
  losses.forEach((l: any) => {
    if (!l.supplier_id) return;
    if (!supplierLosses[l.supplier_id]) supplierLosses[l.supplier_id] = { name: l.supplier_name || "—", value: 0 };
    supplierLosses[l.supplier_id].value += calcLossValue(l);
  });

  return Object.entries(supplierLosses).map(([supplierId, data]) => {
    const recVal = receivedValueBySupplier[supplierId] || 0;
    return {
      supplier: supplierId,
      supplierName: data.name,
      lossValue: data.value,
      receivedValue: recVal,
      rate: recVal > 0 ? (data.value / recVal) * 100 : null,
    };
  }).sort((a, b) => b.lossValue - a.lossValue);
}

// ==================== §7 — Executive ====================

/**
 * §7.2 — Operational Semaphore
 * RED: ∃ κ ∈ K(d) : κ < θ_alerta(κ)
 * YELLOW: ∀ κ ≥ θ_alerta but ∃ κ < θ_meta
 * GREEN: ∀ κ ≥ θ_meta
 */
export type SemaphoreState = "green" | "yellow" | "red";

interface KPIThreshold {
  value: number | null;
  metaTarget: number;
  alertTarget: number;
  higherIsBetter: boolean;
}

export function calcSemaphoreState(kpis: KPIThreshold[]): SemaphoreState {
  const validKpis = kpis.filter((k) => k.value != null);
  if (validKpis.length === 0) return "yellow"; // No data → cautious

  let hasRed = false;
  let hasYellow = false;

  for (const kpi of validKpis) {
    const val = kpi.value!;
    if (kpi.higherIsBetter) {
      if (val < kpi.alertTarget) hasRed = true;
      else if (val < kpi.metaTarget) hasYellow = true;
    } else {
      // Lower is better (e.g., Shrink Rate)
      if (val > kpi.alertTarget) hasRed = true;
      else if (val > kpi.metaTarget) hasYellow = true;
    }
  }

  if (hasRed) return "red";
  if (hasYellow) return "yellow";
  return "green";
}

/**
 * §7.4 — KPI Trend
 * Δκ% = (κ(P0) - κ(P-1)) / κ(P-1) × 100
 * Caso Degenerado 7.1: If κ(P-1) = NaN or 0, return null
 */
export function calcKpiTrend(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * §4.11 — Fill Rate
 * FR(P) = |O_comp| / |O_P| × 100
 * Where O_comp = lines where qty_shipped == qty_requested
 */
export function calcFillRate(orderItems: any[]): number | null {
  if (orderItems.length === 0) return null;
  // For MVP: completed orders with status delivered = fully fulfilled
  const fulfilled = orderItems.filter((item: any) =>
    item.status === "delivered" || item.status === "completed"
  );
  return (fulfilled.length / orderItems.length) * 100;
}

// ==================== §4 — Demand (Extended) ====================

/**
 * §4.3 — Demand Standard Deviation (σ_d)
 * σ_d(s,ℓ) = sqrt( Σ(V(s,ℓ,t) - ADD)² / (|W*| - 1) )
 * Caso Degenerado 4.3: If |W*| ≤ 1, fallback σ_d = 0.30 × ADD
 */
export function calcDemandStdDev(
  salesData: { date: string; qty_sold: number; had_rupture: boolean }[],
  add: number | null
): { value: number | null; flag?: string } {
  if (add == null) return { value: null, flag: "SEM_DADOS" };
  const validDays = salesData.filter((d) => !d.had_rupture);
  if (validDays.length <= 1) {
    return { value: 0.30 * add, flag: "STDDEV_ESTIMADO" };
  }
  const sumSqDiff = validDays.reduce((s, d) => s + Math.pow(d.qty_sold - add, 2), 0);
  const stdDev = Math.sqrt(sumSqDiff / (validDays.length - 1));
  return { value: stdDev };
}

/**
 * §4.4 — Lead Time Standard Deviation (σ_LT)
 * Caso Degenerado 4.4: If n < 5, fallback σ_LT = 0.20 × LT_avg
 */
export function calcLeadTimeStdDev(
  leadTimes: number[]
): { avgLT: number | null; stdDevLT: number | null; flag?: string } {
  if (leadTimes.length === 0) return { avgLT: null, stdDevLT: null, flag: "SEM_DADOS" };
  const avg = leadTimes.reduce((s, v) => s + v, 0) / leadTimes.length;
  if (leadTimes.length < 5) {
    return { avgLT: avg, stdDevLT: 0.20 * avg, flag: "STDDEV_LT_ESTIMADO" };
  }
  const sumSqDiff = leadTimes.reduce((s, v) => s + Math.pow(v - avg, 2), 0);
  const stdDev = Math.sqrt(sumSqDiff / (leadTimes.length - 1));
  return { avgLT: avg, stdDevLT: stdDev };
}

/**
 * §4.5 — Safety Stock
 * SS(s,ℓ,f) = Z(α) × √(σ_d² × LT + ADD² × σ_LT²)
 * Caso Degenerado 4.5: If ADD or σ_d = NaN, SS = NaN
 */
export const Z_TABLE: Record<number, number> = {
  90: 1.28,
  95: 1.65,
  98: 2.05,
  99: 2.33,
};

export function calcSafetyStock(
  add: number | null,
  stdDevDemand: number | null,
  avgLeadTime: number | null,
  stdDevLeadTime: number | null,
  serviceLevel: number = 95
): number | null {
  if (add == null || stdDevDemand == null || avgLeadTime == null || stdDevLeadTime == null) return null;
  const z = Z_TABLE[serviceLevel] || 1.65;
  return z * Math.sqrt(
    Math.pow(stdDevDemand, 2) * avgLeadTime +
    Math.pow(add, 2) * Math.pow(stdDevLeadTime, 2)
  );
}

/**
 * §4.6 — Reorder Point
 * ROP(s,ℓ,f) = ADD(s,ℓ) × LT_cycle(s,ℓ,f) + SS(s,ℓ,f)
 */
export function calcReorderPoint(
  add: number | null,
  leadTimeCycle: number | null,
  safetyStock: number | null
): number | null {
  if (add == null || leadTimeCycle == null || safetyStock == null) return null;
  return add * leadTimeCycle + safetyStock;
}

/**
 * §4.6 — Order Quantity
 * OQ = ⌈(ADD × C_rep) / M⌉ × M
 * Where C_rep = replenishment cycle days, M = pack multiplier
 */
export function calcOrderQuantity(
  add: number | null,
  replenishmentCycleDays: number,
  packMultiplier: number = 1
): number | null {
  if (add == null || add <= 0) return null;
  const raw = add * replenishmentCycleDays;
  if (packMultiplier <= 1) return Math.ceil(raw);
  return Math.ceil(raw / packMultiplier) * packMultiplier;
}

/**
 * §4.9 — ABC Dynamic Classification
 * A: cumulative ≤ θ_A (80%)
 * B: θ_A < cumulative ≤ θ_B (95%)
 * C: cumulative > θ_B
 */
export function calcABCClassification(
  skus: { id: string; revenue: number }[],
  thetaA: number = 80,
  thetaB: number = 95
): { id: string; revenue: number; cumulativePct: number; abc: "A" | "B" | "C" }[] {
  const sorted = [...skus].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = sorted.reduce((s, sk) => s + sk.revenue, 0);
  if (totalRevenue <= 0) return sorted.map((sk) => ({ ...sk, cumulativePct: 0, abc: "C" as const }));

  let cumulative = 0;
  return sorted.map((sk) => {
    cumulative += sk.revenue;
    const cumulativePct = (cumulative / totalRevenue) * 100;
    let abc: "A" | "B" | "C" = "C";
    if (cumulativePct <= thetaA) abc = "A";
    else if (cumulativePct <= thetaB) abc = "B";
    return { ...sk, cumulativePct, abc };
  });
}

// ==================== §7 — Executive (Extended) ====================

/**
 * §7.1 — Cost per Unit Handled (CUH)
 * CUH(P) = C_O(P) / (U_rec(P) + U_exp(P))
 */
export function calcCostPerUnitHandled(
  operationalCost: number,
  unitsReceived: number,
  unitsDispatched: number
): number | null {
  const total = unitsReceived + unitsDispatched;
  if (total <= 0) return null;
  return operationalCost / total;
}

// ==================== Utility ====================

/**
 * Format KPI value respecting NaN convention
 * Per spec: NaN must display "sem dados", never zero
 */
export function formatKpiValue(
  value: number | null,
  format: "percent" | "number" | "currency" | "minutes" = "number",
  decimals = 1
): string {
  if (value == null) return "sem dados";

  switch (format) {
    case "percent":
      return `${value.toFixed(decimals)}%`;
    case "currency":
      return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "minutes":
      return `${Math.round(value)} min`;
    default:
      return value.toFixed(decimals);
  }
}
