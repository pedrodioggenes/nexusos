export interface UnitSummary {
  id: string;
  name: string;
  city: string;
  sales: number;
  margin_pct: number;
  margin_value: number;
  avg_ticket: number;
  rupture_count: number;
  losses_value: number;
  alerts_count: number;
  pendencias_count: number;
  trend: number[];
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning";
  type: string;
  impact_value: number;
  domain: "vendas" | "produtos" | "financeiro" | "unidades";
  unit_name: string;
  unit_id: string;
  category?: string;
  sku?: string;
  rule_name: string;
  rule_threshold: string;
  status: "active" | "resolved" | "ignored";
  created_at: string;
  resolved_at?: string;
  ignored_reason?: string;
}

export interface Goal {
  id: string;
  unit_id: string;
  unit_name: string;
  type: "venda" | "margem";
  target: number;
  actual: number;
  pct: number;
  status: "green" | "yellow" | "red";
  period: string;
  gap: number;
  projection: number;
  history: GoalHistory[];
}

export interface GoalHistory {
  date: string;
  changed_by: string;
  old_value: number;
  new_value: number;
  reason: string;
}

export interface Pendencia {
  id: string;
  title: string;
  description: string;
  responsible: string;
  due_date: string;
  status: "open" | "in_progress" | "resolved" | "postponed";
  priority: "high" | "medium" | "low";
  related_type?: string;
  related_id?: string;
  created_at: string;
  created_by: string;
  resolved_at?: string;
}

export interface KPICardData {
  label: string;
  value: number | string;
  formatted_value: string;
  variation_pct?: number;
  variation_type?: "positive" | "negative" | "neutral";
  trend?: number[];
  impact_label?: string;
  icon?: string;
}

export interface CategorySummary {
  name: string;
  sales: number;
  margin_pct: number;
  share_pct: number;
}

export interface GlobalFilters {
  unit_id: string | "all" | string[];
  period: "realtime" | "today" | "month" | "quarter" | "semester" | "year" | "historic";
  comparison: "previous" | "yoy" | "none";
  category: string | "all";
  search: string;
}

export interface TrendDataPoint {
  period: string;
  sales: number;
  margin: number;
  sales_prev?: number;
  margin_prev?: number;
}

export interface SalesByDay {
  date: string;
  sales: number;
  sales_prev: number;
  cupons: number;
  ticket: number;
}

export interface SalesByHour {
  hour: string;
  sales: number;
  cupons: number;
}

export interface SalesByUnit {
  unit_id: string;
  unit_name: string;
  sales: number;
  sales_prev: number;
  cupons: number;
  ticket: number;
  growth_pct: number;
  share_pct: number;
  trend: number[];
}

export interface SalesByCategory {
  name: string;
  sales: number;
  sales_prev: number;
  margin_pct: number;
  share_pct: number;
  growth_pct: number;
  subcategories: { name: string; sales: number; share_pct: number }[];
}

export interface TicketDistribution {
  range: string;
  count: number;
  pct: number;
  avg_ticket: number;
}

export interface ItemsPerCoupon {
  period: string;
  avg_items: number;
  avg_items_prev: number;
}

export interface EvolutionDriver {
  name: string;
  type: "unit" | "category";
  current: number;
  previous: number;
  delta: number;
  contribution_pct: number;
}

// ===== FINANCIAL TYPES =====

export interface DRELine {
  label: string;
  value: number;
  value_prev: number;
  pct_sales: number;
  pct_sales_prev: number;
}

export interface DREByUnit {
  unit_id: string;
  unit_name: string;
  venda_liquida: number;
  cmv: number;
  margem_bruta: number;
  margem_pct: number;
  despesas: number;
  resultado: number;
  resultado_pct: number;
}

export interface CashFlowDay {
  date: string;
  saldo: number;
  entradas: number;
  saidas: number;
}

export interface CashMovement {
  id: string;
  date: string;
  type: "entrada" | "saida";
  description: string;
  value: number;
  unit_name: string;
  category: string;
}

export interface AccountPayableReceivable {
  id: string;
  due_date: string;
  counterpart: string;
  value: number;
  type: "pagar" | "receber";
  status: "aberto" | "atrasado" | "pago" | "recebido";
  unit_name: string;
  description: string;
}

export interface ExpenseByCostCenter {
  center: string;
  value: number;
  value_prev: number;
  variation_pct: number;
  unit_name: string;
  is_abnormal: boolean;
}

export interface MarginTrend {
  period: string;
  margin_pct: number;
  margin_pct_prev: number;
  margin_value: number;
}

export interface TaxObligation {
   id: string;
   type: string;
   value: number;
   due_date: string;
   status: "em_dia" | "proximo" | "atrasado" | "pago" | "aberto";
   reference_period: string;
   unit_name: string;
}

// ===== PRODUCT TYPES =====

export interface ProductDim {
   sku: string;
   name: string;
   brand: string;
   category: string;
   supplier?: string;
}

export interface ProductMetrics {
   sku: string;
   price: number;
   cost: number;
   margin_pct: number;
   margin_value: number;
   stock: number;
   giro: number; // dias de estoque
   cobertura: number; // dias de cobertura
   perdas: number; // R$ em perdas
   ruptura_dias?: number;
   ativacao_pct?: number;
}

export interface RuptureDetail {
   sku: string;
   name: string;
   unit_id: string;
   unit_name: string;
   dias_sem_estoque: number;
   venda_media: number;
   impacto_estimado: number;
   fornecedor: string;
   created_at: string;
}

export interface LossesBySKU {
   sku: string;
   name: string;
   category: string;
   perdas: number;
   motivo: string;
   unidade: string;
   recorrencia: number;
}

export interface PriceMarginBySKUUnit {
   sku: string;
   category: string;
   preco: number;
   custo: number;
   margem_pct: number;
   margem_r: number;
   variacao: number;
   unit_name: string;
   unit_id: string;
}

export interface GiroCobertura {
   sku: string;
   name: string;
   cobertura_dias: number;
   giro: number;
   unit_name: string;
   category: string;
   trend: number[];
}
