import type { UnitSummary, Alert, Goal, Pendencia, CategorySummary, TrendDataPoint, ProductDim, ProductMetrics, RuptureDetail, LossesBySKU, PriceMarginBySKUUnit, GiroCobertura } from "./types";

export const UNITS: UnitSummary[] = [
  { id: "u1", name: "Centro", city: "Centro", sales: 2450000, margin_pct: 24.5, margin_value: 600250, avg_ticket: 142, rupture_count: 23, losses_value: 12400, alerts_count: 3, pendencias_count: 2, trend: [2100000, 2200000, 2350000, 2280000, 2400000, 2450000] },
  { id: "u2", name: "Norte", city: "Norte", sales: 2100000, margin_pct: 22.1, margin_value: 464100, avg_ticket: 118, rupture_count: 45, losses_value: 28700, alerts_count: 5, pendencias_count: 3, trend: [1900000, 1950000, 2050000, 2000000, 2080000, 2100000] },
  { id: "u3", name: "Sul", city: "Sul", sales: 1850000, margin_pct: 26.3, margin_value: 486550, avg_ticket: 135, rupture_count: 18, losses_value: 9800, alerts_count: 1, pendencias_count: 1, trend: [1650000, 1700000, 1780000, 1800000, 1820000, 1850000] },
  { id: "u4", name: "Leste", city: "Leste", sales: 1620000, margin_pct: 19.8, margin_value: 320760, avg_ticket: 95, rupture_count: 87, losses_value: 42300, alerts_count: 7, pendencias_count: 4, trend: [1700000, 1680000, 1650000, 1640000, 1630000, 1620000] },
  { id: "u5", name: "Oeste", city: "Oeste", sales: 1780000, margin_pct: 23.7, margin_value: 421860, avg_ticket: 108, rupture_count: 32, losses_value: 15600, alerts_count: 2, pendencias_count: 1, trend: [1600000, 1650000, 1700000, 1720000, 1750000, 1780000] },
  { id: "u6", name: "Shopping", city: "Shopping", sales: 1450000, margin_pct: 28.1, margin_value: 407450, avg_ticket: 145, rupture_count: 15, losses_value: 8200, alerts_count: 1, pendencias_count: 0, trend: [1300000, 1350000, 1380000, 1400000, 1420000, 1450000] },
  { id: "u7", name: "Express", city: "Express", sales: 1150000, margin_pct: 21.4, margin_value: 246100, avg_ticket: 87, rupture_count: 120, losses_value: 45200, alerts_count: 6, pendencias_count: 3, trend: [1250000, 1220000, 1200000, 1180000, 1160000, 1150000] },
];

export const CATEGORIES: CategorySummary[] = [
  { name: "Mercearia", sales: 3200000, margin_pct: 22.5, share_pct: 25.6 },
  { name: "Perecíveis", sales: 2800000, margin_pct: 28.3, share_pct: 22.4 },
  { name: "Bebidas", sales: 2100000, margin_pct: 18.7, share_pct: 16.8 },
  { name: "Higiene", sales: 1500000, margin_pct: 32.1, share_pct: 12.0 },
  { name: "Limpeza", sales: 1200000, margin_pct: 25.4, share_pct: 9.6 },
  { name: "Hortifruti", sales: 800000, margin_pct: 35.2, share_pct: 6.4 },
  { name: "Açougue", sales: 550000, margin_pct: 20.8, share_pct: 4.4 },
  { name: "Padaria", sales: 350000, margin_pct: 45.0, share_pct: 2.8 },
];

export const TREND_DATA: TrendDataPoint[] = [
  { period: "Jul", sales: 11200000, margin: 2650000, sales_prev: 10800000, margin_prev: 2500000 },
  { period: "Ago", sales: 11500000, margin: 2720000, sales_prev: 11000000, margin_prev: 2580000 },
  { period: "Set", sales: 11800000, margin: 2800000, sales_prev: 11300000, margin_prev: 2650000 },
  { period: "Out", sales: 12000000, margin: 2850000, sales_prev: 11600000, margin_prev: 2700000 },
  { period: "Nov", sales: 12200000, margin: 2900000, sales_prev: 11800000, margin_prev: 2780000 },
  { period: "Dez", sales: 12400000, margin: 2947070, sales_prev: 12000000, margin_prev: 2850000 },
];

export const ALERTS: Alert[] = [
  { id: "a1", title: "Ruptura crítica em Bebidas", description: "120 SKUs em ruptura na unidade Express, 85% acima do limite aceitável", severity: "critical", type: "rupture", impact_value: 185000, domain: "produtos", unit_name: "Express", unit_id: "u7", category: "Bebidas", rule_name: "Ruptura > 80 itens", rule_threshold: "80 itens", status: "active", created_at: "2026-02-13T08:00:00Z" },
  { id: "a2", title: "Margem negativa em Açougue", description: "Margem abaixo de 15% na unidade Leste por 3 semanas consecutivas", severity: "critical", type: "margin", impact_value: 92000, domain: "financeiro", unit_name: "Leste", unit_id: "u4", category: "Açougue", rule_name: "Margem < 15%", rule_threshold: "15%", status: "active", created_at: "2026-02-12T14:30:00Z" },
  { id: "a3", title: "Vendas abaixo da meta - Leste", description: "Unidade Leste com vendas 12% abaixo da meta mensal", severity: "critical", type: "sales", impact_value: 220000, domain: "vendas", unit_name: "Leste", unit_id: "u4", rule_name: "Vendas < 90% meta", rule_threshold: "90%", status: "active", created_at: "2026-02-11T10:00:00Z" },
  { id: "a4", title: "Perdas elevadas - Express", description: "Perdas de R$45.2k, 180% acima da média da rede", severity: "critical", type: "losses", impact_value: 45200, domain: "financeiro", unit_name: "Express", unit_id: "u7", rule_name: "Perdas > 150% média", rule_threshold: "150%", status: "active", created_at: "2026-02-10T09:15:00Z" },
  { id: "a5", title: "Ticket médio em queda - Express", description: "Ticket médio R$87, 15% abaixo da média da rede (R$104)", severity: "warning", type: "ticket", impact_value: 68000, domain: "vendas", unit_name: "Express", unit_id: "u7", rule_name: "Ticket < 85% média", rule_threshold: "85%", status: "active", created_at: "2026-02-12T11:00:00Z" },
  { id: "a6", title: "Ruptura em Perecíveis - Norte", description: "45 itens em ruptura, concentrados em laticínios", severity: "warning", type: "rupture", impact_value: 35000, domain: "produtos", unit_name: "Norte", unit_id: "u2", category: "Perecíveis", rule_name: "Ruptura > 30 itens", rule_threshold: "30 itens", status: "active", created_at: "2026-02-13T07:00:00Z" },
  { id: "a7", title: "Perdas acima do normal - Norte", description: "Perdas de R$28.7k, 78% acima da média", severity: "warning", type: "losses", impact_value: 28700, domain: "financeiro", unit_name: "Norte", unit_id: "u2", rule_name: "Perdas > 50% média", rule_threshold: "50%", status: "active", created_at: "2026-02-09T16:00:00Z" },
  { id: "a8", title: "Vendas abaixo da meta - Express", description: "Unidade Express com vendas 8% abaixo da meta", severity: "warning", type: "sales", impact_value: 100000, domain: "vendas", unit_name: "Express", unit_id: "u7", rule_name: "Vendas < 95% meta", rule_threshold: "95%", status: "active", created_at: "2026-02-11T08:30:00Z" },
  { id: "a9", title: "Margem comprimida em Bebidas", description: "Margem de Bebidas caiu para 18.7%, limite é 20%", severity: "warning", type: "margin", impact_value: 27000, domain: "financeiro", unit_name: "Rede (consolidado)", unit_id: "all", category: "Bebidas", rule_name: "Margem categoria < 20%", rule_threshold: "20%", status: "active", created_at: "2026-02-12T13:00:00Z" },
  { id: "a10", title: "Queda sequencial de vendas - Leste", description: "4 semanas consecutivas de queda nas vendas", severity: "critical", type: "trend", impact_value: 150000, domain: "vendas", unit_name: "Leste", unit_id: "u4", rule_name: "Queda > 3 semanas", rule_threshold: "3 semanas", status: "active", created_at: "2026-02-10T10:00:00Z" },
  { id: "a11", title: "Estoque alto em Limpeza - Sul", description: "Cobertura de 45 dias, acima do ideal de 21 dias", severity: "warning", type: "stock", impact_value: 18000, domain: "produtos", unit_name: "Sul", unit_id: "u3", category: "Limpeza", rule_name: "Cobertura > 30 dias", rule_threshold: "30 dias", status: "active", created_at: "2026-02-08T14:00:00Z" },
  { id: "a12", title: "Perdas em Hortifruti - Leste", description: "Perdas de R$12k em Hortifruti, dobro do esperado", severity: "warning", type: "losses", impact_value: 12000, domain: "produtos", unit_name: "Leste", unit_id: "u4", category: "Hortifruti", rule_name: "Perdas categoria > 200%", rule_threshold: "200%", status: "active", created_at: "2026-02-11T15:00:00Z" },
  { id: "a13", title: "Ruptura em Higiene - Oeste", description: "32 itens em ruptura, maioria em marca líder", severity: "warning", type: "rupture", impact_value: 22000, domain: "produtos", unit_name: "Oeste", unit_id: "u5", category: "Higiene", rule_name: "Ruptura > 25 itens", rule_threshold: "25 itens", status: "active", created_at: "2026-02-12T09:00:00Z" },
  { id: "a14", title: "Meta margem comprometida - Norte", description: "Margem acumulada 22.1%, meta é 24%", severity: "warning", type: "margin", impact_value: 40000, domain: "financeiro", unit_name: "Norte", unit_id: "u2", rule_name: "Margem < meta", rule_threshold: "24%", status: "active", created_at: "2026-02-13T06:00:00Z" },
  { id: "a15", title: "Venda abaixo projeção - Shopping", description: "Vendas 5% abaixo da projeção semanal", severity: "warning", type: "sales", impact_value: 15000, domain: "vendas", unit_name: "Shopping", unit_id: "u6", rule_name: "Vendas < 95% projeção", rule_threshold: "95%", status: "resolved", created_at: "2026-02-07T10:00:00Z", resolved_at: "2026-02-10T16:00:00Z" },
];

export const GOALS: Goal[] = [
  { id: "g1", unit_id: "u1", unit_name: "Centro", type: "venda", target: 2500000, actual: 2450000, pct: 98, status: "green", period: "Fev/2026", gap: -50000, projection: 2520000, history: [{ date: "2026-01-15", changed_by: "Carlos Silva", old_value: 2400000, new_value: 2500000, reason: "Ajuste sazonal Carnaval" }] },
  { id: "g2", unit_id: "u2", unit_name: "Norte", type: "venda", target: 2300000, actual: 2100000, pct: 91.3, status: "yellow", period: "Fev/2026", gap: -200000, projection: 2180000, history: [] },
  { id: "g3", unit_id: "u3", unit_name: "Sul", type: "venda", target: 1900000, actual: 1850000, pct: 97.4, status: "green", period: "Fev/2026", gap: -50000, projection: 1920000, history: [] },
  { id: "g4", unit_id: "u4", unit_name: "Leste", type: "venda", target: 1850000, actual: 1620000, pct: 87.6, status: "red", period: "Fev/2026", gap: -230000, projection: 1680000, history: [{ date: "2026-02-01", changed_by: "Ana Oliveira", old_value: 1950000, new_value: 1850000, reason: "Redução por reforma parcial" }] },
  { id: "g5", unit_id: "u5", unit_name: "Oeste", type: "venda", target: 1800000, actual: 1780000, pct: 98.9, status: "green", period: "Fev/2026", gap: -20000, projection: 1830000, history: [] },
  { id: "g6", unit_id: "u6", unit_name: "Shopping", type: "venda", target: 1500000, actual: 1450000, pct: 96.7, status: "green", period: "Fev/2026", gap: -50000, projection: 1510000, history: [] },
  { id: "g7", unit_id: "u7", unit_name: "Express", type: "venda", target: 1350000, actual: 1150000, pct: 85.2, status: "red", period: "Fev/2026", gap: -200000, projection: 1200000, history: [{ date: "2026-01-20", changed_by: "Roberto Santos", old_value: 1400000, new_value: 1350000, reason: "Ajuste por concorrência local" }] },
];

export const PENDENCIAS: Pendencia[] = [
  { id: "p1", title: "Investigar ruptura Bebidas Express", description: "Levantar causa raiz da ruptura em 120 SKUs de bebidas", responsible: "João Mendes", due_date: "2026-02-15", status: "open", priority: "high", related_type: "alert", related_id: "a1", created_at: "2026-02-13T08:30:00Z", created_by: "Sistema" },
  { id: "p2", title: "Renegociar margem Açougue Leste", description: "Negociar com fornecedor para recuperar margem", responsible: "Ana Oliveira", due_date: "2026-02-18", status: "in_progress", priority: "high", related_type: "alert", related_id: "a2", created_at: "2026-02-12T15:00:00Z", created_by: "Carlos Silva" },
  { id: "p3", title: "Plano de ação vendas Leste", description: "Elaborar plano de recuperação de vendas com gerente da unidade", responsible: "Roberto Santos", due_date: "2026-02-16", status: "open", priority: "high", related_type: "goal", related_id: "g4", created_at: "2026-02-11T10:30:00Z", created_by: "Carlos Silva" },
  { id: "p4", title: "Auditoria de perdas Express", description: "Realizar auditoria presencial de perdas na unidade Express", responsible: "Maria Lima", due_date: "2026-02-20", status: "open", priority: "high", related_type: "alert", related_id: "a4", created_at: "2026-02-10T09:30:00Z", created_by: "Ana Oliveira" },
  { id: "p5", title: "Revisar pedidos Perecíveis Norte", description: "Ajustar pedidos de laticínios para reduzir ruptura", responsible: "Pedro Costa", due_date: "2026-02-14", status: "in_progress", priority: "medium", related_type: "alert", related_id: "a6", created_at: "2026-02-13T07:30:00Z", created_by: "Sistema" },
  { id: "p6", title: "Ação promocional Express", description: "Criar campanha para aumentar ticket médio na Express", responsible: "Luciana Ferreira", due_date: "2026-02-22", status: "open", priority: "medium", related_type: "alert", related_id: "a5", created_at: "2026-02-12T11:30:00Z", created_by: "Roberto Santos" },
  { id: "p7", title: "Liquidar estoque Limpeza Sul", description: "Montar ação de liquidação para reduzir cobertura de estoque", responsible: "Marcos Souza", due_date: "2026-02-17", status: "open", priority: "low", related_type: "alert", related_id: "a11", created_at: "2026-02-08T14:30:00Z", created_by: "Ana Oliveira" },
  { id: "p8", title: "Reunião com fornecedor Higiene", description: "Agendar reunião para resolver ruptura de marca líder", responsible: "Pedro Costa", due_date: "2026-02-19", status: "open", priority: "medium", related_type: "alert", related_id: "a13", created_at: "2026-02-12T09:30:00Z", created_by: "Sistema" },
  { id: "p9", title: "Treinamento equipe Hortifruti Leste", description: "Capacitar equipe para reduzir perdas em Hortifruti", responsible: "Maria Lima", due_date: "2026-02-25", status: "open", priority: "medium", related_type: "alert", related_id: "a12", created_at: "2026-02-11T15:30:00Z", created_by: "Roberto Santos" },
  { id: "p10", title: "Revisar meta Norte margem", description: "Avaliar realismo da meta de margem da unidade Norte", responsible: "Carlos Silva", due_date: "2026-02-28", status: "open", priority: "low", related_type: "goal", related_id: "g2", created_at: "2026-02-13T06:30:00Z", created_by: "Ana Oliveira" },
];

export function getConsolidatedKPIs() {
  const totalSales = UNITS.reduce((s, u) => s + u.sales, 0);
  const totalMargin = UNITS.reduce((s, u) => s + u.margin_value, 0);
  const avgMarginPct = (totalMargin / totalSales) * 100;
  const avgTicket = UNITS.reduce((s, u) => s + u.avg_ticket, 0) / UNITS.length;
  const totalRupture = UNITS.reduce((s, u) => s + u.rupture_count, 0);
  const totalLosses = UNITS.reduce((s, u) => s + u.losses_value, 0);
  const totalAlerts = ALERTS.filter(a => a.status === "active").length;
  const totalPendencias = PENDENCIAS.filter(p => p.status !== "resolved").length;
  const bestUnit = [...UNITS].sort((a, b) => b.sales - a.sales)[0];
  const worstUnit = [...UNITS].sort((a, b) => a.sales - b.sales)[0];
  const bestCategory = [...CATEGORIES].sort((a, b) => b.sales - a.sales)[0];
  const worstCategory = [...CATEGORIES].sort((a, b) => a.sales - b.sales)[0];

  return {
    totalSales,
    totalMargin,
    avgMarginPct,
    avgTicket,
    totalRupture,
    totalLosses,
    totalAlerts,
    totalPendencias,
    bestUnit,
    worstUnit,
    bestCategory,
    worstCategory,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

// ===== SALES DATA =====

import type { SalesByDay, SalesByHour, SalesByUnit, SalesByCategory, TicketDistribution, ItemsPerCoupon, EvolutionDriver } from "./types";

export const SALES_BY_DAY: SalesByDay[] = Array.from({ length: 30 }, (_, i) => {
  const base = 380000 + Math.sin(i * 0.5) * 50000 + Math.random() * 30000;
  const prev = base * (0.92 + Math.random() * 0.06);
  const cupons = Math.round(3200 + Math.random() * 600);
  return {
    date: `${String(i + 1).padStart(2, "0")}/02`,
    sales: Math.round(base),
    sales_prev: Math.round(prev),
    cupons,
    ticket: Math.round(base / cupons),
  };
});

export const SALES_BY_HOUR: SalesByHour[] = [
  { hour: "07h", sales: 45000, cupons: 380 },
  { hour: "08h", sales: 82000, cupons: 620 },
  { hour: "09h", sales: 125000, cupons: 950 },
  { hour: "10h", sales: 168000, cupons: 1280 },
  { hour: "11h", sales: 210000, cupons: 1650 },
  { hour: "12h", sales: 235000, cupons: 1820 },
  { hour: "13h", sales: 198000, cupons: 1540 },
  { hour: "14h", sales: 155000, cupons: 1200 },
  { hour: "15h", sales: 142000, cupons: 1100 },
  { hour: "16h", sales: 160000, cupons: 1250 },
  { hour: "17h", sales: 205000, cupons: 1600 },
  { hour: "18h", sales: 225000, cupons: 1750 },
  { hour: "19h", sales: 190000, cupons: 1480 },
  { hour: "20h", sales: 120000, cupons: 920 },
  { hour: "21h", sales: 65000, cupons: 500 },
];

export const SALES_BY_UNIT: SalesByUnit[] = UNITS.map(u => {
  const growth = u.id === "u3" ? 8.2 : u.id === "u5" ? 12.1 : u.id === "u1" ? 5.4 : u.id === "u6" ? 6.8 : u.id === "u2" ? 2.1 : u.id === "u4" ? -4.8 : -3.2;
  const totalSales = UNITS.reduce((s, x) => s + x.sales, 0);
  return {
    unit_id: u.id,
    unit_name: u.name,
    sales: u.sales,
    sales_prev: Math.round(u.sales / (1 + growth / 100)),
    cupons: Math.round(u.sales / u.avg_ticket),
    ticket: u.avg_ticket,
    growth_pct: growth,
    share_pct: Math.round((u.sales / totalSales) * 1000) / 10,
    trend: u.trend,
  };
});

export const SALES_BY_CATEGORY: SalesByCategory[] = CATEGORIES.map(c => {
  const growth = c.name === "Hortifruti" ? 15.3 : c.name === "Padaria" ? 9.8 : c.name === "Perecíveis" ? 6.2 : c.name === "Mercearia" ? 3.1 : c.name === "Bebidas" ? -2.4 : c.name === "Higiene" ? 4.5 : c.name === "Limpeza" ? -1.2 : 1.8;
  const subMap: Record<string, string[]> = {
    "Mercearia": ["Enlatados", "Massas", "Cereais", "Óleos"],
    "Perecíveis": ["Laticínios", "Frios", "Iogurtes"],
    "Bebidas": ["Refrigerantes", "Sucos", "Águas", "Cervejas"],
    "Higiene": ["Shampoo", "Sabonetes", "Dental"],
    "Limpeza": ["Detergentes", "Desinfetantes", "Amaciantes"],
    "Hortifruti": ["Frutas", "Verduras", "Legumes"],
    "Açougue": ["Bovinos", "Aves", "Suínos"],
    "Padaria": ["Pães", "Bolos", "Salgados"],
  };
  const subs = (subMap[c.name] || ["Sub 1", "Sub 2", "Sub 3"]).map((s, i) => {
    const share = i === 0 ? 45 : i === 1 ? 30 : i === 2 ? 15 : 10;
    return { name: s, sales: Math.round(c.sales * share / 100), share_pct: share };
  });
  return {
    name: c.name,
    sales: c.sales,
    sales_prev: Math.round(c.sales / (1 + growth / 100)),
    margin_pct: c.margin_pct,
    share_pct: c.share_pct,
    growth_pct: growth,
    subcategories: subs,
  };
});

export const TICKET_DISTRIBUTION: TicketDistribution[] = [
  { range: "Até R$50", count: 18500, pct: 17.6, avg_ticket: 32 },
  { range: "R$50–100", count: 32200, pct: 30.6, avg_ticket: 74 },
  { range: "R$100–150", count: 25800, pct: 24.5, avg_ticket: 122 },
  { range: "R$150–200", count: 15400, pct: 14.6, avg_ticket: 171 },
  { range: "R$200–300", count: 9600, pct: 9.1, avg_ticket: 243 },
  { range: "Acima R$300", count: 3700, pct: 3.5, avg_ticket: 385 },
];

export const ITEMS_PER_COUPON: ItemsPerCoupon[] = [
  { period: "Set", avg_items: 4.2, avg_items_prev: 4.0 },
  { period: "Out", avg_items: 4.3, avg_items_prev: 4.1 },
  { period: "Nov", avg_items: 4.5, avg_items_prev: 4.2 },
  { period: "Dez", avg_items: 4.8, avg_items_prev: 4.4 },
  { period: "Jan", avg_items: 4.4, avg_items_prev: 4.3 },
  { period: "Fev", avg_items: 4.5, avg_items_prev: 4.2 },
];

export const EVOLUTION_DRIVERS: EvolutionDriver[] = [
  { name: "Oeste", type: "unit", current: 1780000, previous: 1588000, delta: 192000, contribution_pct: 24.1 },
  { name: "Sul", type: "unit", current: 1850000, previous: 1709000, delta: 141000, contribution_pct: 17.7 },
  { name: "Hortifruti", type: "category", current: 800000, previous: 694000, delta: 106000, contribution_pct: 13.3 },
  { name: "Centro", type: "unit", current: 2450000, previous: 2324000, delta: 126000, contribution_pct: 15.8 },
  { name: "Perecíveis", type: "category", current: 2800000, previous: 2637000, delta: 163000, contribution_pct: 20.5 },
  { name: "Shopping", type: "unit", current: 1450000, previous: 1358000, delta: 92000, contribution_pct: 11.5 },
  { name: "Padaria", type: "category", current: 350000, previous: 319000, delta: 31000, contribution_pct: 3.9 },
  { name: "Mercearia", type: "category", current: 3200000, previous: 3104000, delta: 96000, contribution_pct: 12.1 },
  { name: "Norte", type: "unit", current: 2100000, previous: 2057000, delta: 43000, contribution_pct: 5.4 },
  { name: "Bebidas", type: "category", current: 2100000, previous: 2152000, delta: -52000, contribution_pct: -6.5 },
  { name: "Leste", type: "unit", current: 1620000, previous: 1702000, delta: -82000, contribution_pct: -10.3 },
  { name: "Limpeza", type: "category", current: 1200000, previous: 1215000, delta: -15000, contribution_pct: -1.9 },
  { name: "Express", type: "unit", current: 1150000, previous: 1188000, delta: -38000, contribution_pct: -4.8 },
  { name: "Higiene", type: "category", current: 1500000, previous: 1435000, delta: 65000, contribution_pct: 8.2 },
  { name: "Açougue", type: "category", current: 550000, previous: 540000, delta: 10000, contribution_pct: 1.3 },
];

export function getSalesKPIs() {
  const totalSales = SALES_BY_DAY.reduce((s, d) => s + d.sales, 0);
  const totalSalesPrev = SALES_BY_DAY.reduce((s, d) => s + d.sales_prev, 0);
  const totalCupons = SALES_BY_DAY.reduce((s, d) => s + d.cupons, 0);
  const avgTicket = Math.round(totalSales / totalCupons);
  const growthPrev = ((totalSales - totalSalesPrev) / totalSalesPrev) * 100;
  return { totalSales, totalSalesPrev, totalCupons, avgTicket, growthPrev };
}

// ===== FINANCIAL DATA =====

import type { DRELine, DREByUnit, CashFlowDay, CashMovement, AccountPayableReceivable, ExpenseByCostCenter, MarginTrend, TaxObligation } from "./types";

const totalSalesNet = UNITS.reduce((s, u) => s + u.sales, 0) * 0.92; // ~líquida
const totalCMV = totalSalesNet * 0.68;
const totalMargemBruta = totalSalesNet - totalCMV;
const totalDespesas = totalSalesNet * 0.18;
const totalResultado = totalMargemBruta - totalDespesas;

export const DRE_RESUMO: DRELine[] = [
  { label: "Venda Líquida", value: totalSalesNet, value_prev: totalSalesNet * 0.94, pct_sales: 100, pct_sales_prev: 100 },
  { label: "CMV", value: -totalCMV, value_prev: -totalCMV * 0.95, pct_sales: -68, pct_sales_prev: -68.5 },
  { label: "Margem Bruta", value: totalMargemBruta, value_prev: totalMargemBruta * 0.92, pct_sales: 32, pct_sales_prev: 31.5 },
  { label: "Despesas Operacionais", value: -totalDespesas, value_prev: -totalDespesas * 0.97, pct_sales: -18, pct_sales_prev: -18.3 },
  { label: "Resultado Operacional", value: totalResultado, value_prev: totalResultado * 0.88, pct_sales: 14, pct_sales_prev: 13.2 },
];

export const DRE_BY_UNIT: DREByUnit[] = UNITS.map(u => {
  const vl = u.sales * 0.92;
  const cmv = vl * (0.64 + Math.random() * 0.08);
  const mb = vl - cmv;
  const desp = vl * (0.15 + Math.random() * 0.06);
  return {
    unit_id: u.id,
    unit_name: u.name,
    venda_liquida: Math.round(vl),
    cmv: Math.round(cmv),
    margem_bruta: Math.round(mb),
    margem_pct: Math.round((mb / vl) * 1000) / 10,
    despesas: Math.round(desp),
    resultado: Math.round(mb - desp),
    resultado_pct: Math.round(((mb - desp) / vl) * 1000) / 10,
  };
});

export const MARGIN_TREND: MarginTrend[] = [
  { period: "Set", margin_pct: 23.1, margin_pct_prev: 22.5, margin_value: 2730000 },
  { period: "Out", margin_pct: 23.5, margin_pct_prev: 22.8, margin_value: 2820000 },
  { period: "Nov", margin_pct: 23.8, margin_pct_prev: 23.2, margin_value: 2900000 },
  { period: "Dez", margin_pct: 24.0, margin_pct_prev: 23.5, margin_value: 2970000 },
  { period: "Jan", margin_pct: 23.6, margin_pct_prev: 23.0, margin_value: 2850000 },
  { period: "Fev", margin_pct: 23.8, margin_pct_prev: 23.3, margin_value: 2947000 },
];

export const CASH_FLOW_PROJECTION: CashFlowDay[] = Array.from({ length: 14 }, (_, i) => {
  const day = i + 1;
  const entradas = 300000 + Math.random() * 200000;
  const saidas = 250000 + Math.random() * 180000;
  return {
    date: `${String(day).padStart(2, "0")}/02`,
    saldo: Math.round(2800000 + (entradas - saidas) * (i + 1) * 0.3),
    entradas: Math.round(entradas),
    saidas: Math.round(saidas),
  };
});

export const CASH_MOVEMENTS: CashMovement[] = [
  { id: "cm1", date: "2026-02-13", type: "entrada", description: "Vendas cartão - Centro", value: 185000, unit_name: "Centro", category: "Vendas" },
  { id: "cm2", date: "2026-02-13", type: "entrada", description: "Vendas dinheiro - Centro", value: 42000, unit_name: "Centro", category: "Vendas" },
  { id: "cm3", date: "2026-02-13", type: "saida", description: "Fornecedor Nestlé", value: 128000, unit_name: "Rede", category: "Fornecedores" },
  { id: "cm4", date: "2026-02-13", type: "saida", description: "Folha de pagamento", value: 320000, unit_name: "Rede", category: "Pessoal" },
  { id: "cm5", date: "2026-02-12", type: "entrada", description: "Vendas PIX - Norte", value: 95000, unit_name: "Norte", category: "Vendas" },
  { id: "cm6", date: "2026-02-12", type: "saida", description: "Aluguel Shopping", value: 85000, unit_name: "Shopping", category: "Ocupação" },
  { id: "cm7", date: "2026-02-12", type: "saida", description: "Energia elétrica", value: 67000, unit_name: "Rede", category: "Utilidades" },
  { id: "cm8", date: "2026-02-11", type: "entrada", description: "Vendas cartão - Sul", value: 142000, unit_name: "Sul", category: "Vendas" },
  { id: "cm9", date: "2026-02-11", type: "saida", description: "Fornecedor Ambev", value: 96000, unit_name: "Rede", category: "Fornecedores" },
  { id: "cm10", date: "2026-02-11", type: "saida", description: "Manutenção - Leste", value: 18500, unit_name: "Leste", category: "Manutenção" },
];

export const ACCOUNTS_PR: AccountPayableReceivable[] = [
  { id: "ap1", due_date: "2026-02-15", counterpart: "Nestlé Brasil", value: 245000, type: "pagar", status: "aberto", unit_name: "Rede", description: "NF 12345 - Mercearia" },
  { id: "ap2", due_date: "2026-02-18", counterpart: "Ambev S.A.", value: 189000, type: "pagar", status: "aberto", unit_name: "Rede", description: "NF 12346 - Bebidas" },
  { id: "ap3", due_date: "2026-02-10", counterpart: "JBS Foods", value: 156000, type: "pagar", status: "atrasado", unit_name: "Rede", description: "NF 12340 - Açougue" },
  { id: "ap4", due_date: "2026-02-20", counterpart: "P&G", value: 98000, type: "pagar", status: "aberto", unit_name: "Rede", description: "NF 12347 - Higiene/Limpeza" },
  { id: "ap5", due_date: "2026-02-25", counterpart: "BRF", value: 112000, type: "pagar", status: "aberto", unit_name: "Rede", description: "NF 12348 - Perecíveis" },
  { id: "ap6", due_date: "2026-02-28", counterpart: "Aluguel Imóveis", value: 340000, type: "pagar", status: "aberto", unit_name: "Rede", description: "Aluguéis Fev/2026" },
  { id: "ar1", due_date: "2026-02-14", counterpart: "Cielo (cartões)", value: 520000, type: "receber", status: "aberto", unit_name: "Rede", description: "Lote cartão 07-13/02" },
  { id: "ar2", due_date: "2026-02-16", counterpart: "Stone (cartões)", value: 380000, type: "receber", status: "aberto", unit_name: "Rede", description: "Lote cartão 07-13/02" },
  { id: "ar3", due_date: "2026-02-08", counterpart: "Getnet (cartões)", value: 215000, type: "receber", status: "recebido", unit_name: "Rede", description: "Lote cartão 01-07/02" },
  { id: "ar4", due_date: "2026-02-20", counterpart: "Convênio Empresas", value: 85000, type: "receber", status: "aberto", unit_name: "Rede", description: "Vale alimentação" },
];

export const EXPENSES_BY_CC: ExpenseByCostCenter[] = [
  { center: "Pessoal", value: 1850000, value_prev: 1780000, variation_pct: 3.9, unit_name: "Rede", is_abnormal: false },
  { center: "Ocupação", value: 680000, value_prev: 660000, variation_pct: 3.0, unit_name: "Rede", is_abnormal: false },
  { center: "Utilidades", value: 320000, value_prev: 295000, variation_pct: 8.5, unit_name: "Rede", is_abnormal: true },
  { center: "Manutenção", value: 185000, value_prev: 140000, variation_pct: 32.1, unit_name: "Rede", is_abnormal: true },
  { center: "Marketing", value: 95000, value_prev: 88000, variation_pct: 8.0, unit_name: "Rede", is_abnormal: false },
  { center: "Logística", value: 210000, value_prev: 198000, variation_pct: 6.1, unit_name: "Rede", is_abnormal: false },
  { center: "TI", value: 78000, value_prev: 75000, variation_pct: 4.0, unit_name: "Rede", is_abnormal: false },
  { center: "Administrativo", value: 145000, value_prev: 138000, variation_pct: 5.1, unit_name: "Rede", is_abnormal: false },
  { center: "Seguros", value: 52000, value_prev: 50000, variation_pct: 4.0, unit_name: "Rede", is_abnormal: false },
  { center: "Perdas", value: 162200, value_prev: 120000, variation_pct: 35.2, unit_name: "Rede", is_abnormal: true },
];

export const TAX_OBLIGATIONS: TaxObligation[] = [
  { id: "tx1", type: "ICMS", value: 890000, due_date: "2026-02-20", status: "aberto" as const, reference_period: "Jan/2026", unit_name: "Rede" },
  { id: "tx2", type: "PIS/COFINS", value: 456000, due_date: "2026-02-25", status: "aberto" as const, reference_period: "Jan/2026", unit_name: "Rede" },
  { id: "tx3", type: "IRPJ", value: 320000, due_date: "2026-03-31", status: "proximo" as const, reference_period: "4T/2025", unit_name: "Rede" },
  { id: "tx4", type: "CSLL", value: 128000, due_date: "2026-03-31", status: "proximo" as const, reference_period: "4T/2025", unit_name: "Rede" },
  { id: "tx5", type: "INSS", value: 380000, due_date: "2026-02-20", status: "aberto" as const, reference_period: "Jan/2026", unit_name: "Rede" },
  { id: "tx6", type: "FGTS", value: 148000, due_date: "2026-02-07", status: "pago" as const, reference_period: "Jan/2026", unit_name: "Rede" },
  { id: "tx7", type: "ISS", value: 42000, due_date: "2026-02-10", status: "pago" as const, reference_period: "Jan/2026", unit_name: "Rede" },
  { id: "tx8", type: "ICMS-ST", value: 215000, due_date: "2026-02-05", status: "atrasado" as const, reference_period: "Jan/2026", unit_name: "Rede" },
   { id: "tx9", type: "Contrib. Sindical", value: 28000, due_date: "2026-03-15", status: "proximo" as const, reference_period: "2026", unit_name: "Rede" },
];

// ===== PRODUCT DATA =====

export const PRODUCTS: ProductDim[] = [
   { sku: "SKU001", name: "Arroz Tipo 1 - 5kg", brand: "Nestlé", category: "Mercearia" },
   { sku: "SKU002", name: "Feijão Carioca - 2kg", brand: "Tio João", category: "Mercearia" },
   { sku: "SKU003", name: "Leite Integral - 1L", brand: "Elegê", category: "Perecíveis" },
   { sku: "SKU004", name: "Iogurte Natural - 500g", brand: "Elegê", category: "Perecíveis" },
   { sku: "SKU005", name: "Refrigerante Cola - 2L", brand: "Coca-Cola", category: "Bebidas" },
   { sku: "SKU006", name: "Suco Natural - 1L", brand: "Suco Mais", category: "Bebidas" },
   { sku: "SKU007", name: "Papel Higiênico - 30m", brand: "Personal", category: "Higiene" },
   { sku: "SKU008", name: "Sabonete Líquido - 500ml", brand: "Dove", category: "Higiene" },
   { sku: "SKU009", name: "Detergente - 500ml", brand: "Ypê", category: "Limpeza" },
   { sku: "SKU010", name: "Água Sanitária - 1L", brand: "Q-Boa", category: "Limpeza" },
   { sku: "SKU011", name: "Maçã Red - kg", brand: "Granja Brasil", category: "Hortifruti" },
   { sku: "SKU012", name: "Cenoura Laranja - kg", brand: "Granja Brasil", category: "Hortifruti" },
   { sku: "SKU013", name: "Carne Vermelha - 1kg", brand: "Grupo Brasil", category: "Açougue" },
   { sku: "SKU014", name: "Pão Francês - kg", brand: "Panificadora Local", category: "Padaria" },
   { sku: "SKU015", name: "Bolo de Chocolate - und", brand: "Panificadora Local", category: "Padaria" },
   { sku: "SKU016", name: "Azeite Extravirgem - 500ml", brand: "Gallo", category: "Mercearia" },
   { sku: "SKU017", name: "Macarrão Integral - 500g", brand: "Barilla", category: "Mercearia" },
   { sku: "SKU018", name: "Achocolatado - 400g", brand: "Nescau", category: "Mercearia" },
   { sku: "SKU019", name: "Café Expresso - 500g", brand: "Melitta", category: "Mercearia" },
   { sku: "SKU020", name: "Queijo Meia Cura - 500g", brand: "Poços de Caldas", category: "Perecíveis" },
   { sku: "SKU021", name: "Presunto Tipo A - 500g", brand: "Perdigão", category: "Perecíveis" },
   { sku: "SKU022", name: "Cerveja Premium - 350ml", brand: "Brahma", category: "Bebidas" },
   { sku: "SKU023", name: "Vinho Tinto Reserva - 750ml", brand: "Santa Margherita", category: "Bebidas" },
   { sku: "SKU024", name: "Xampu Neutro - 400ml", brand: "Seda", category: "Higiene" },
   { sku: "SKU025", name: "Desodorante Aerosol - 150ml", brand: "Rexona", category: "Higiene" },
];

export const PRODUCT_METRICS: ProductMetrics[] = [
   { sku: "SKU001", price: 28.90, cost: 18.50, margin_pct: 22.5, margin_value: 10.40, stock: 850, giro: 18, cobertura: 22, perdas: 240 },
   { sku: "SKU002", price: 12.50, cost: 7.80, margin_pct: 37.6, margin_value: 4.70, stock: 450, giro: 25, cobertura: 28, perdas: 80 },
   { sku: "SKU003", price: 4.90, cost: 3.20, margin_pct: 34.7, margin_value: 1.70, stock: 1200, giro: 40, cobertura: 45, perdas: 320 },
   { sku: "SKU004", price: 7.80, cost: 4.50, margin_pct: 42.3, margin_value: 3.30, stock: 650, giro: 35, cobertura: 38, perdas: 180 },
   { sku: "SKU005", price: 9.90, cost: 5.40, margin_pct: 45.5, margin_value: 4.50, stock: 920, giro: 32, cobertura: 35, perdas: 290 },
   { sku: "SKU006", price: 6.50, cost: 3.80, margin_pct: 41.5, margin_value: 2.70, stock: 480, giro: 28, cobertura: 32, perdas: 120 },
   { sku: "SKU007", price: 3.20, cost: 1.50, margin_pct: 53.1, margin_value: 1.70, stock: 1500, giro: 55, cobertura: 60, perdas: 40 },
   { sku: "SKU008", price: 12.90, cost: 7.20, margin_pct: 44.2, margin_value: 5.70, stock: 680, giro: 38, cobertura: 42, perdas: 150 },
   { sku: "SKU009", price: 2.80, cost: 1.20, margin_pct: 57.1, margin_value: 1.60, stock: 2100, giro: 65, cobertura: 70, perdas: 35 },
   { sku: "SKU010", price: 3.50, cost: 1.80, margin_pct: 48.6, margin_value: 1.70, stock: 1800, giro: 52, cobertura: 58, perdas: 85 },
   { sku: "SKU011", price: 5.80, cost: 3.20, margin_pct: 44.8, margin_value: 2.60, stock: 280, giro: 22, cobertura: 26, perdas: 420 },
   { sku: "SKU012", price: 3.90, cost: 2.10, margin_pct: 46.2, margin_value: 1.80, stock: 320, giro: 20, cobertura: 24, perdas: 580 },
   { sku: "SKU013", price: 42.50, cost: 28.00, margin_pct: 34.1, margin_value: 14.50, stock: 95, giro: 12, cobertura: 15, perdas: 850 },
   { sku: "SKU014", price: 0.80, cost: 0.35, margin_pct: 56.3, margin_value: 0.45, stock: 3200, giro: 85, cobertura: 90, perdas: 120 },
   { sku: "SKU015", price: 18.50, cost: 10.00, margin_pct: 45.9, margin_value: 8.50, stock: 125, giro: 18, cobertura: 22, perdas: 240 },
   { sku: "SKU016", price: 45.00, cost: 28.00, margin_pct: 37.8, margin_value: 17.00, stock: 180, giro: 15, cobertura: 18, perdas: 320 },
   { sku: "SKU017", price: 8.50, cost: 4.80, margin_pct: 43.5, margin_value: 3.70, stock: 520, giro: 30, cobertura: 34, perdas: 95 },
   { sku: "SKU018", price: 15.80, cost: 9.20, margin_pct: 41.8, margin_value: 6.60, stock: 380, giro: 28, cobertura: 32, perdas: 220 },
   { sku: "SKU019", price: 24.50, cost: 14.80, margin_pct: 39.6, margin_value: 9.70, stock: 220, giro: 16, cobertura: 20, perdas: 310 },
   { sku: "SKU020", price: 32.00, cost: 18.50, margin_pct: 42.2, margin_value: 13.50, stock: 140, giro: 14, cobertura: 17, perdas: 420 },
   { sku: "SKU021", price: 28.00, cost: 16.00, margin_pct: 42.9, margin_value: 12.00, stock: 160, giro: 16, cobertura: 19, perdas: 380 },
   { sku: "SKU022", price: 6.50, cost: 3.50, margin_pct: 46.2, margin_value: 3.00, stock: 850, giro: 42, cobertura: 48, perdas: 180 },
   { sku: "SKU023", price: 89.00, cost: 52.00, margin_pct: 41.6, margin_value: 37.00, stock: 65, giro: 8, cobertura: 10, perdas: 1250 },
   { sku: "SKU024", price: 18.90, cost: 10.80, margin_pct: 42.9, margin_value: 8.10, stock: 420, giro: 26, cobertura: 30, perdas: 240 },
   { sku: "SKU025", price: 14.50, cost: 8.20, margin_pct: 43.4, margin_value: 6.30, stock: 580, giro: 32, cobertura: 36, perdas: 190 },
];

export const RUPTURES: RuptureDetail[] = [
   { sku: "SKU001", name: "Arroz Tipo 1 - 5kg", unit_id: "u7", unit_name: "Express", dias_sem_estoque: 4, venda_media: 45, impacto_estimado: 1800, fornecedor: "Nestlé", created_at: "2026-02-09T08:00:00Z" },
   { sku: "SKU003", name: "Leite Integral - 1L", unit_id: "u2", unit_name: "Norte", dias_sem_estoque: 2, venda_media: 85, impacto_estimado: 1700, fornecedor: "Elegê", created_at: "2026-02-11T09:30:00Z" },
   { sku: "SKU005", name: "Refrigerante Cola - 2L", unit_id: "u4", unit_name: "Leste", dias_sem_estoque: 3, venda_media: 32, impacto_estimado: 960, fornecedor: "Coca-Cola", created_at: "2026-02-10T10:15:00Z" },
   { sku: "SKU009", name: "Detergente - 500ml", unit_id: "u7", unit_name: "Express", dias_sem_estoque: 5, venda_media: 28, impacto_estimado: 1400, fornecedor: "Ypê", created_at: "2026-02-08T07:00:00Z" },
   { sku: "SKU013", name: "Carne Vermelha - 1kg", unit_id: "u4", unit_name: "Leste", dias_sem_estoque: 6, venda_media: 18, impacto_estimado: 1080, fornecedor: "Grupo Brasil", created_at: "2026-02-07T14:30:00Z" },
   { sku: "SKU014", name: "Pão Francês - kg", unit_id: "u7", unit_name: "Express", dias_sem_estoque: 1, venda_media: 120, impacto_estimado: 1200, fornecedor: "Panificadora Local", created_at: "2026-02-12T08:00:00Z" },
   { sku: "SKU023", name: "Vinho Tinto Reserva - 750ml", unit_id: "u6", unit_name: "Shopping", dias_sem_estoque: 2, venda_media: 8, impacto_estimado: 712, fornecedor: "Santa Margherita", created_at: "2026-02-11T16:00:00Z" },
];

export const LOSSES_SKU: LossesBySKU[] = [
   { sku: "SKU001", name: "Arroz Tipo 1 - 5kg", category: "Mercearia", perdas: 240, motivo: "Validade", unidade: "Rede", recorrencia: 2 },
   { sku: "SKU003", name: "Leite Integral - 1L", category: "Perecíveis", perdas: 320, motivo: "Validade/Temperatura", unidade: "Rede", recorrencia: 3 },
   { sku: "SKU013", name: "Carne Vermelha - 1kg", category: "Açougue", perdas: 850, motivo: "Validade/Manuseio", unidade: "Rede", recorrencia: 4 },
   { sku: "SKU023", name: "Vinho Tinto Reserva - 750ml", category: "Bebidas", perdas: 1250, motivo: "Quebra", unidade: "Rede", recorrencia: 2 },
   { sku: "SKU011", name: "Maçã Red - kg", category: "Hortifruti", perdas: 420, motivo: "Deterioração", unidade: "Rede", recorrencia: 5 },
];

export const PRICE_MARGIN_SKU: PriceMarginBySKUUnit[] = [
   { sku: "SKU001", category: "Mercearia", preco: 28.90, custo: 18.50, margem_pct: 22.5, margem_r: 10.40, variacao: -2.3, unit_name: "Leste", unit_id: "u4" },
   { sku: "SKU001", category: "Mercearia", preco: 29.50, custo: 18.50, margem_pct: 37.3, margem_r: 11.00, variacao: 0.0, unit_name: "Centro", unit_id: "u1" },
   { sku: "SKU005", category: "Bebidas", preco: 9.90, custo: 5.40, margem_pct: 45.5, margem_r: 4.50, variacao: 0.0, unit_name: "Centro", unit_id: "u1" },
   { sku: "SKU005", category: "Bebidas", preco: 8.90, custo: 5.40, margem_pct: 39.3, margem_r: 3.50, variacao: -6.2, unit_name: "Leste", unit_id: "u4" },
   { sku: "SKU013", category: "Açougue", preco: 42.50, custo: 28.00, margem_pct: 34.1, margem_r: 14.50, variacao: -8.1, unit_name: "Leste", unit_id: "u4" },
   { sku: "SKU013", category: "Açougue", preco: 46.50, custo: 28.00, margem_pct: 39.8, margem_r: 18.50, variacao: 5.7, unit_name: "Centro", unit_id: "u1" },
];

export const GIRO_COBERTURA_DATA: GiroCobertura[] = [
   { sku: "SKU001", name: "Arroz Tipo 1 - 5kg", cobertura_dias: 22, giro: 18, unit_name: "Rede", category: "Mercearia", trend: [18, 19, 20, 22, 21, 22] },
   { sku: "SKU007", name: "Papel Higiênico - 30m", cobertura_dias: 60, giro: 55, unit_name: "Rede", category: "Higiene", trend: [50, 52, 55, 58, 60, 60] },
   { sku: "SKU023", name: "Vinho Tinto Reserva - 750ml", cobertura_dias: 10, giro: 8, unit_name: "Rede", category: "Bebidas", trend: [12, 11, 10, 9, 10, 10] },
   { sku: "SKU014", name: "Pão Francês - kg", cobertura_dias: 90, giro: 85, unit_name: "Rede", category: "Padaria", trend: [80, 83, 85, 88, 90, 90] },
];
