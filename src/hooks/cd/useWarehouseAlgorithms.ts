/**
 * CD Warehouse Algorithms
 * Based on formal specification: "Auditoria Técnica de Lógica Matemática — CD v1.0"
 * 
 * §2.5 — Put-Away Location Selection
 * §3.1 — FEFO Lot Selection
 * §3.4 — Expiry Alert / Value at Risk
 * §5.1 — S-Shape Picking Route Optimization
 */

// ==================== §2.5 — Put-Away Location Selection ====================

export interface WarehouseLocation {
  id: string;
  code: string;
  zone: string;
  aisle: string | null;
  level: string | null;
  position: string | null;
  is_active: boolean;
  is_occupied: boolean;
  max_weight_kg: number | null;
  max_volume_m3: number | null;
}

export interface PutAwayResult {
  location_id: string | null;
  location_code: string | null;
  priority_level: number; // 1=same lot, 2=primary, 3=secondary, 4=nearest in zone, 0=none
  alert?: string;
}

/**
 * §2.5 — Algoritmo de Seleção de Localização para Put-Away
 * Prioridade estrita:
 *   1. Local com mesmo lote já armazenado (consolidação)
 *   2. Local primário do SKU
 *   3. Local secundário do SKU
 *   4. Local mais próximo na zona preferencial
 *   5. SEM_LOCALIZAÇÃO → alerta crítico
 */
export function selectPutAwayLocation(
  sku: { id: string; preferred_zone?: string },
  lotLocations: WarehouseLocation[], // locations already holding same lot
  primaryLocation: WarehouseLocation | null,
  secondaryLocation: WarehouseLocation | null,
  zoneLocations: WarehouseLocation[] // all available locations in preferred zone
): PutAwayResult {
  // Priority 1: Consolidate with existing lot
  const availableLotLocations = lotLocations.filter(
    (l) => l.is_active && !l.is_occupied
  );
  if (availableLotLocations.length > 0) {
    const best = availableLotLocations[0]; // Already sorted by available space
    return { location_id: best.id, location_code: best.code, priority_level: 1 };
  }
  // Also check if any lot location has space (is_occupied but not full)
  if (lotLocations.length > 0) {
    const withSpace = lotLocations.filter((l) => l.is_active);
    if (withSpace.length > 0) {
      return { location_id: withSpace[0].id, location_code: withSpace[0].code, priority_level: 1 };
    }
  }

  // Priority 2: Primary location
  if (primaryLocation && primaryLocation.is_active && !primaryLocation.is_occupied) {
    return { location_id: primaryLocation.id, location_code: primaryLocation.code, priority_level: 2 };
  }

  // Priority 3: Secondary location
  if (secondaryLocation && secondaryLocation.is_active && !secondaryLocation.is_occupied) {
    return { location_id: secondaryLocation.id, location_code: secondaryLocation.code, priority_level: 3 };
  }

  // Priority 4: Nearest in zone
  const availableInZone = zoneLocations.filter(
    (l) => l.is_active && !l.is_occupied
  );
  if (availableInZone.length > 0) {
    return { location_id: availableInZone[0].id, location_code: availableInZone[0].code, priority_level: 4 };
  }

  // No location found → critical alert
  return {
    location_id: null,
    location_code: null,
    priority_level: 0,
    alert: "SEM_LOCALIZAÇÃO — Alerta crítico: nenhuma posição disponível para armazenagem",
  };
}

// ==================== §3.1 — FEFO Lot Selection ====================

export interface StockLot {
  id: string;
  sku_id: string;
  batch_number: string | null;
  expiration_date: string | null;
  qty_available: number;
  location_id: string | null;
}

/**
 * §3.1 — Algoritmo FEFO de Seleção de Lote
 * b*(s, ℓ, t) = arg min_{b ∈ B(s,ℓ,t)} t_val(b)
 * 
 * Selects the lot with the earliest expiration date (First-Expired, First-Out).
 * Only considers lots with qty > 0 and expiration > today.
 * 
 * Caso Degenerado 3.1: If B(s,ℓ,t) = ∅, returns null (rupture event).
 */
export function selectFEFOLot(
  lots: StockLot[],
  today: Date = new Date()
): { lot: StockLot | null; isRupture: boolean } {
  const todayStr = today.toISOString().split("T")[0];
  
  const validLots = lots.filter(
    (lot) =>
      lot.qty_available > 0 &&
      lot.expiration_date != null &&
      lot.expiration_date > todayStr
  );

  if (validLots.length === 0) {
    return { lot: null, isRupture: true };
  }

  // Sort by expiration ascending (FEFO)
  validLots.sort((a, b) => {
    if (!a.expiration_date || !b.expiration_date) return 0;
    return a.expiration_date.localeCompare(b.expiration_date);
  });

  return { lot: validLots[0], isRupture: false };
}

// ==================== §3.4 — Expiry Alert / Value at Risk ====================

export interface ExpiryRiskItem {
  lot_id: string;
  sku_id: string;
  sku_name?: string;
  batch_number: string | null;
  expiration_date: string;
  days_remaining: number;
  qty_available: number;
  unit_cost: number;
  value_at_risk: number;
}

/**
 * §3.4 — Função de Alerta de Vencimento Projetado
 * B_risco(t0) = { b ∈ B | 0 < t_val(b) - t0 ≤ D_alerta(SKU(b)) }
 * V_risco(t0) = Σ Q(b, t0) × C_unit(SKU(b))
 * 
 * Ordered by urgency (ascending days remaining).
 */
export function calcExpiryRisk(
  lots: {
    id: string;
    sku_id: string;
    sku_name?: string;
    batch_number: string | null;
    expiration_date: string | null;
    qty_available: number;
    unit_cost: number;
  }[],
  alertDays: number = 30,
  today: Date = new Date()
): { items: ExpiryRiskItem[]; totalValueAtRisk: number } {
  const todayStr = today.toISOString().split("T")[0];
  const items: ExpiryRiskItem[] = [];

  for (const lot of lots) {
    if (!lot.expiration_date || lot.qty_available <= 0) continue;
    
    const expDate = new Date(lot.expiration_date);
    const daysRemaining = Math.floor(
      (expDate.getTime() - today.getTime()) / 86400000
    );

    // Only include lots where 0 < days_remaining ≤ alertDays
    if (daysRemaining > 0 && daysRemaining <= alertDays) {
      const valueAtRisk = lot.qty_available * lot.unit_cost;
      items.push({
        lot_id: lot.id,
        sku_id: lot.sku_id,
        sku_name: lot.sku_name,
        batch_number: lot.batch_number,
        expiration_date: lot.expiration_date,
        days_remaining: daysRemaining,
        qty_available: lot.qty_available,
        unit_cost: lot.unit_cost,
        value_at_risk: valueAtRisk,
      });
    }
  }

  // Sort by urgency (ascending days remaining)
  items.sort((a, b) => a.days_remaining - b.days_remaining);

  const totalValueAtRisk = items.reduce((s, i) => s + i.value_at_risk, 0);

  return { items, totalValueAtRisk };
}

// ==================== §5.1 — S-Shape Picking Route ====================

export interface PickLocation {
  id: string;
  code: string;
  aisle: string;
  level: string | null;
  position: string | null;
  sku_id: string;
  qty_to_pick: number;
}

/**
 * §5.1 — Algoritmo de Otimização de Rota de Picking (S-Shape Traversal)
 * 
 * Complexity: O(n log n) dominated by sorting.
 * Produces near-optimal routes for parallel-aisle warehouse layouts.
 * 
 * Algorithm:
 *   1. Group locations by aisle
 *   2. Sort aisles ascending
 *   3. For odd-indexed aisles: sort positions ascending
 *      For even-indexed aisles: sort positions descending (serpentine)
 *   4. Concatenate
 */
export function optimizePickingRoute(
  locations: PickLocation[]
): PickLocation[] {
  if (locations.length <= 1) return [...locations];

  // Group by aisle
  const aisleMap = new Map<string, PickLocation[]>();
  for (const loc of locations) {
    const aisle = loc.aisle || "0";
    if (!aisleMap.has(aisle)) aisleMap.set(aisle, []);
    aisleMap.get(aisle)!.push(loc);
  }

  // Sort aisles
  const sortedAisles = [...aisleMap.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const route: PickLocation[] = [];
  sortedAisles.forEach((aisle, idx) => {
    const aisleLocations = aisleMap.get(aisle)!;
    
    // Sort by position within aisle
    aisleLocations.sort((a, b) => {
      const posA = a.position || a.level || "0";
      const posB = b.position || b.level || "0";
      return posA.localeCompare(posB, undefined, { numeric: true });
    });

    // Serpentine: reverse order for even-indexed aisles
    if (idx % 2 === 1) {
      aisleLocations.reverse();
    }

    route.push(...aisleLocations);
  });

  return route;
}
