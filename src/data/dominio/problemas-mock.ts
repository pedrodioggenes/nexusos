import { UNITS, CATEGORIES, ALERTS } from "./mock-data";

// ===== ANOMALIES FEED (extends ALERTS with extra evidence) =====
export interface AnomalyItem {
  id: string;
  title: string;
  severity: "critical" | "warning";
  impact_value: number;
  domain: "vendas" | "produtos" | "financeiro" | "unidades";
  unit_name: string;
  unit_id: string;
  evidence: string;
  recurrence: string;
  created_at: string;
  status: "active" | "silenced" | "resolved";
  silenced_until?: string;
  silenced_reason?: string;
  linked_pendencia_id?: string;
  category?: string;
  rule_name: string;
}

export const ANOMALIES: AnomalyItem[] = ALERTS.filter((a) => a.status === "active").map((a) => ({
  id: a.id,
  title: a.title,
  severity: a.severity,
  impact_value: a.impact_value,
  domain: a.domain,
  unit_name: a.unit_name,
  unit_id: a.unit_id,
  evidence:
    a.type === "margin" ? `margem ${a.rule_threshold}, atual abaixo` :
    a.type === "rupture" ? `${a.rule_threshold} itens em ruptura` :
    a.type === "losses" ? `perdas ${a.rule_threshold} acima` :
    a.type === "sales" ? `vendas abaixo de ${a.rule_threshold}` :
    a.type === "trend" ? `queda > ${a.rule_threshold}` :
    a.description.slice(0, 60),
  recurrence: a.type === "trend" ? "4 semanas" : a.type === "margin" ? "3 semanas" : "Pontual",
  created_at: a.created_at,
  status: "active",
  category: a.category,
  rule_name: a.rule_name,
}));

// ===== LOSSES =====
export interface LossItem {
  id: string;
  category: string;
  sku: string;
  losses_value: number;
  reason: string;
  unit_name: string;
  unit_id: string;
  recurrence: string;
}

export const LOSSES_DATA: LossItem[] = [
  { id: "l1", category: "Hortifruti", sku: "Banana Prata kg", losses_value: 8200, reason: "Vencimento", unit_name: "Leste", unit_id: "u4", recurrence: "Semanal" },
  { id: "l2", category: "Hortifruti", sku: "Tomate kg", losses_value: 5400, reason: "Avaria", unit_name: "Leste", unit_id: "u4", recurrence: "Semanal" },
  { id: "l3", category: "Perecíveis", sku: "Iogurte Natural 170g", losses_value: 4800, reason: "Vencimento", unit_name: "Express", unit_id: "u7", recurrence: "Quinzenal" },
  { id: "l4", category: "Perecíveis", sku: "Queijo Mussarela kg", losses_value: 6200, reason: "Avaria", unit_name: "Express", unit_id: "u7", recurrence: "Semanal" },
  { id: "l5", category: "Açougue", sku: "Picanha Bov. kg", losses_value: 9500, reason: "Vencimento", unit_name: "Express", unit_id: "u7", recurrence: "Quinzenal" },
  { id: "l6", category: "Padaria", sku: "Pão Francês kg", losses_value: 3200, reason: "Sobra diária", unit_name: "Norte", unit_id: "u2", recurrence: "Diária" },
  { id: "l7", category: "Bebidas", sku: "Cerveja Lata 350ml", losses_value: 2100, reason: "Avaria", unit_name: "Norte", unit_id: "u2", recurrence: "Pontual" },
  { id: "l8", category: "Hortifruti", sku: "Alface Crespa un", losses_value: 1800, reason: "Vencimento", unit_name: "Express", unit_id: "u7", recurrence: "Semanal" },
  { id: "l9", category: "Perecíveis", sku: "Presunto Fatiado 200g", losses_value: 3600, reason: "Vencimento", unit_name: "Norte", unit_id: "u2", recurrence: "Quinzenal" },
  { id: "l10", category: "Mercearia", sku: "Azeite Extra Virgem 500ml", losses_value: 4100, reason: "Avaria", unit_name: "Leste", unit_id: "u4", recurrence: "Pontual" },
  { id: "l11", category: "Limpeza", sku: "Desinfetante 2L", losses_value: 1500, reason: "Avaria", unit_name: "Sul", unit_id: "u3", recurrence: "Pontual" },
  { id: "l12", category: "Higiene", sku: "Shampoo 400ml", losses_value: 2800, reason: "Avaria", unit_name: "Oeste", unit_id: "u5", recurrence: "Pontual" },
];

// ===== PRICE & MARGIN =====
export interface PriceMarginItem {
  id: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  margin_pct: number;
  margin_value: number;
  variation_pp: number;
  unit_name: string;
  unit_id: string;
  below_minimum: boolean;
}

export const PRICE_MARGIN_DATA: PriceMarginItem[] = [
  { id: "pm1", sku: "Arroz 5kg Tipo 1", category: "Mercearia", price: 22.90, cost: 19.50, margin_pct: 14.8, margin_value: 3.40, variation_pp: -5.2, unit_name: "Leste", unit_id: "u4", below_minimum: true },
  { id: "pm2", sku: "Feijão Carioca 1kg", category: "Mercearia", price: 8.49, cost: 7.20, margin_pct: 15.2, margin_value: 1.29, variation_pp: -4.8, unit_name: "Leste", unit_id: "u4", below_minimum: true },
  { id: "pm3", sku: "Leite Integral 1L", category: "Perecíveis", price: 5.99, cost: 5.10, margin_pct: 14.9, margin_value: 0.89, variation_pp: -3.1, unit_name: "Express", unit_id: "u7", below_minimum: true },
  { id: "pm4", sku: "Coca-Cola 2L", category: "Bebidas", price: 9.99, cost: 8.10, margin_pct: 18.9, margin_value: 1.89, variation_pp: -1.1, unit_name: "Norte", unit_id: "u2", below_minimum: false },
  { id: "pm5", sku: "Picanha kg", category: "Açougue", price: 69.90, cost: 62.00, margin_pct: 11.3, margin_value: 7.90, variation_pp: -8.7, unit_name: "Leste", unit_id: "u4", below_minimum: true },
  { id: "pm6", sku: "Detergente 500ml", category: "Limpeza", price: 2.49, cost: 1.55, margin_pct: 37.8, margin_value: 0.94, variation_pp: 2.1, unit_name: "Centro", unit_id: "u1", below_minimum: false },
  { id: "pm7", sku: "Sabonete 90g", category: "Higiene", price: 3.29, cost: 1.85, margin_pct: 43.8, margin_value: 1.44, variation_pp: 1.5, unit_name: "Sul", unit_id: "u3", below_minimum: false },
  { id: "pm8", sku: "Cerveja Lata 350ml", category: "Bebidas", price: 3.99, cost: 3.40, margin_pct: 14.8, margin_value: 0.59, variation_pp: -5.2, unit_name: "Express", unit_id: "u7", below_minimum: true },
  { id: "pm9", sku: "Óleo Soja 900ml", category: "Mercearia", price: 7.49, cost: 6.30, margin_pct: 15.9, margin_value: 1.19, variation_pp: -2.1, unit_name: "Norte", unit_id: "u2", below_minimum: true },
  { id: "pm10", sku: "Presunto kg", category: "Perecíveis", price: 32.90, cost: 27.50, margin_pct: 16.4, margin_value: 5.40, variation_pp: -3.6, unit_name: "Leste", unit_id: "u4", below_minimum: true },
  { id: "pm11", sku: "Pão Francês kg", category: "Padaria", price: 14.90, cost: 7.80, margin_pct: 47.7, margin_value: 7.10, variation_pp: 0.5, unit_name: "Centro", unit_id: "u1", below_minimum: false },
  { id: "pm12", sku: "Banana Prata kg", category: "Hortifruti", price: 6.99, cost: 3.50, margin_pct: 49.9, margin_value: 3.49, variation_pp: 3.2, unit_name: "Sul", unit_id: "u3", below_minimum: false },
];

// ===== STOCK DIFFERENCES =====
export interface StockDiffItem {
  id: string;
  sku: string;
  category: string;
  unit_name: string;
  unit_id: string;
  stock_system: number;
  stock_counted: number;
  difference: number;
  impact_value: number;
  validated: boolean;
}

export const STOCK_DIFFS: StockDiffItem[] = [
  { id: "sd1", sku: "Cerveja Lata 350ml", category: "Bebidas", unit_name: "Express", unit_id: "u7", stock_system: 450, stock_counted: 380, difference: -70, impact_value: 238, validated: false },
  { id: "sd2", sku: "Shampoo 400ml", category: "Higiene", unit_name: "Norte", unit_id: "u2", stock_system: 120, stock_counted: 95, difference: -25, impact_value: 375, validated: false },
  { id: "sd3", sku: "Detergente 500ml", category: "Limpeza", unit_name: "Leste", unit_id: "u4", stock_system: 200, stock_counted: 185, difference: -15, impact_value: 23, validated: false },
  { id: "sd4", sku: "Arroz 5kg Tipo 1", category: "Mercearia", unit_name: "Leste", unit_id: "u4", stock_system: 80, stock_counted: 65, difference: -15, impact_value: 293, validated: true },
  { id: "sd5", sku: "Leite Integral 1L", category: "Perecíveis", unit_name: "Express", unit_id: "u7", stock_system: 300, stock_counted: 270, difference: -30, impact_value: 153, validated: false },
  { id: "sd6", sku: "Picanha kg", category: "Açougue", unit_name: "Norte", unit_id: "u2", stock_system: 40, stock_counted: 32, difference: -8, impact_value: 496, validated: false },
  { id: "sd7", sku: "Coca-Cola 2L", category: "Bebidas", unit_name: "Oeste", unit_id: "u5", stock_system: 180, stock_counted: 175, difference: -5, impact_value: 41, validated: true },
  { id: "sd8", sku: "Queijo Mussarela kg", category: "Perecíveis", unit_name: "Leste", unit_id: "u4", stock_system: 55, stock_counted: 42, difference: -13, impact_value: 403, validated: false },
];

// ===== LOSSES BY UNIT/CATEGORY AGGREGATION =====
export function getLossesKPIs() {
  const totalLosses = LOSSES_DATA.reduce((s, l) => s + l.losses_value, 0);
  const totalSales = UNITS.reduce((s, u) => s + u.sales, 0);
  const lossesPctSales = (totalLosses / totalSales) * 100;

  const byUnit = new Map<string, number>();
  LOSSES_DATA.forEach((l) => byUnit.set(l.unit_name, (byUnit.get(l.unit_name) || 0) + l.losses_value));
  const topUnit = [...byUnit.entries()].sort((a, b) => b[1] - a[1])[0];

  const byCat = new Map<string, number>();
  LOSSES_DATA.forEach((l) => byCat.set(l.category, (byCat.get(l.category) || 0) + l.losses_value));
  const topCat = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];

  return { totalLosses, lossesPctSales, topUnit, topCat, byUnit: [...byUnit.entries()], byCat: [...byCat.entries()] };
}

export function getStockDiffKPIs() {
  const totalAdjustments = STOCK_DIFFS.reduce((s, d) => s + Math.abs(d.difference), 0);
  const totalImpact = STOCK_DIFFS.reduce((s, d) => s + d.impact_value, 0);

  const bySku = new Map<string, number>();
  STOCK_DIFFS.forEach((d) => bySku.set(d.sku, (bySku.get(d.sku) || 0) + Math.abs(d.difference)));
  const topSku = [...bySku.entries()].sort((a, b) => b[1] - a[1])[0];

  const byUnit = new Map<string, number>();
  STOCK_DIFFS.forEach((d) => byUnit.set(d.unit_name, (byUnit.get(d.unit_name) || 0) + Math.abs(d.difference)));
  const topUnit = [...byUnit.entries()].sort((a, b) => b[1] - a[1])[0];

  return { totalAdjustments, totalImpact, topSku, topUnit };
}

export function getPriceMarginKPIs() {
  const belowMinimum = PRICE_MARGIN_DATA.filter((p) => p.below_minimum).length;
  const avgVariation = PRICE_MARGIN_DATA.reduce((s, p) => s + p.variation_pp, 0) / PRICE_MARGIN_DATA.length;
  const negativeImpact = PRICE_MARGIN_DATA.filter((p) => p.variation_pp < 0).reduce((s, p) => s + Math.abs(p.margin_value * p.variation_pp * 100), 0);

  const skuMap = new Map<string, number[]>();
  PRICE_MARGIN_DATA.forEach((p) => {
    const arr = skuMap.get(p.sku) || [];
    arr.push(p.margin_pct);
    skuMap.set(p.sku, arr);
  });
  let maxVariance = 0;
  skuMap.forEach((margins) => {
    if (margins.length > 1) {
      const diff = Math.max(...margins) - Math.min(...margins);
      if (diff > maxVariance) maxVariance = diff;
    }
  });

  return { belowMinimum, avgVariation, negativeImpact, maxVariance };
}
