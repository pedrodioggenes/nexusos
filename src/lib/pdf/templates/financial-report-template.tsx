/**
 * Financial Report Template — Full PDF with IDV editorial
 * Uses @react-pdf/renderer for native vector generation.
 */
import React from "react";
import { Document, View, Text } from "@react-pdf/renderer";
import {
  CoverPage,
  FlowPage,
  SmartSection,
  KpiRow,
  DataTable,
  DonutChart,
  VerticalBarChart,
  HorizontalBarChart,
  ProgressBar,
  CalloutBox,
} from "../components";
import { BRAND, TYPE, SPACE } from "../theme";

// ── Data Interface ──────────────────────────────────────
export interface FinancialReportData {
  periodLabel: string;
  companyName?: string;
  summary: {
    totalReceita: number;
    totalCusto: number;
    saldo: number;
    receitaTrend: number;
    custoTrend: number;
  };
  byMonth: { month: string; receita: number; custo: number }[];
  byCategory: { category: string; amount: number; type: string }[];
  bySubcategory: { category: string; subcategory: string; amount: number }[];
  budget?: {
    total: number;
    remaining: number;
    categories?: { name: string; allocated: number; spent: number }[];
  };
  topCosts: {
    date: string;
    description: string;
    category: string;
    subcategory?: string;
    amount: number;
  }[];
  transactions: {
    date: string;
    type: string;
    category: string;
    subcategory?: string;
    description: string;
    amount: number;
    status: string;
  }[];
}

// ── Helpers ─────────────────────────────────────────────
function fmtBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

function fmtPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v}%`;
}

function formatMonthLabel(month: string): string {
  const LABELS: Record<string, string> = {
    "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
    "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
    "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
  };
  const parts = month.split("-");
  return LABELS[parts[1]] || month;
}

const CHART_COLORS = [
  BRAND.red, BRAND.blue, BRAND.teal, BRAND.purple,
  BRAND.orange, BRAND.green, "#E91E63", "#795548",
];

// ── Document ────────────────────────────────────────────
export function FinancialReportDocument({ data }: { data: FinancialReportData }) {
  const totalCusto = data.summary.totalCusto;
  const costCategories = data.byCategory
    .filter((c) => c.type === "custo")
    .sort((a, b) => b.amount - a.amount);

  const donutSegments = costCategories.map((c, i) => ({
    label: c.category,
    value: c.amount,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const monthlyBars = data.byMonth.map((m) => ({
    label: formatMonthLabel(m.month),
    values: [
      { value: m.receita, color: BRAND.green, label: "Receita" },
      { value: m.custo, color: BRAND.red, label: "Custo" },
    ],
  }));

  // Group subcategories by category
  const subByCategory = new Map<string, { subcategory: string; amount: number }[]>();
  data.bySubcategory.forEach((s) => {
    const arr = subByCategory.get(s.category) || [];
    arr.push({ subcategory: s.subcategory, amount: s.amount });
    subByCategory.set(s.category, arr);
  });

  return (
    <Document>
      {/* ═══ COVER ═══ */}
      <CoverPage
        title="Relatório Financeiro — Marketing"
        subtitle="Análise completa de receitas, custos e orçamento"
        periodLabel={data.periodLabel}
        companyName={data.companyName}
        reportType="RFM"
      />

      {/* ═══ CONTENT (continuous flow) ═══ */}
      <FlowPage moduleName="Marketing">
        {/* Section 01: KPIs */}
        <SmartSection title="Indicadores Consolidados" number="01" subtitle="Visão geral do período">
          <KpiRow
            items={[
              {
                label: "Receita Total",
                value: fmtBRL(data.summary.totalReceita),
                change: fmtPct(data.summary.receitaTrend),
                changeType: data.summary.receitaTrend >= 0 ? "positive" : "negative",
                accentColor: BRAND.green,
              },
              {
                label: "Custos Totais",
                value: fmtBRL(data.summary.totalCusto),
                change: fmtPct(data.summary.custoTrend),
                changeType: data.summary.custoTrend <= 0 ? "positive" : "negative",
                accentColor: BRAND.red,
              },
              {
                label: "Saldo",
                value: fmtBRL(data.summary.saldo),
                changeType: data.summary.saldo >= 0 ? "positive" : "negative",
                accentColor: data.summary.saldo >= 0 ? BRAND.blue : BRAND.red,
              },
              ...(data.budget
                ? [
                    {
                      label: "Orçamento Disponível",
                      value: fmtBRL(data.budget.remaining),
                      change: `de ${fmtBRL(data.budget.total)}`,
                      changeType: "neutral" as const,
                      accentColor: BRAND.purple,
                    },
                  ]
                : []),
            ]}
            columns={data.budget ? 4 : 3}
          />
        </SmartSection>

        {/* Section 02: Monthly Evolution */}
        {monthlyBars.length > 0 && (
          <SmartSection title="Evolução Mensal" number="02" subtitle="Receita vs Custo por mês">
            <View wrap={false}>
              <VerticalBarChart
                items={monthlyBars}
                height={180}
              />
            </View>
          </SmartSection>
        )}

        {/* Section 03: Cost Distribution */}
        {costCategories.length > 0 && (
          <SmartSection title="Distribuição de Custos por Categoria" number="03" subtitle="Composição dos gastos no período">
            <View style={{ flexDirection: "row", gap: SPACE.lg }} wrap={false}>
              <View style={{ width: "45%" }}>
                <DonutChart segments={donutSegments} size={160} />
              </View>
              <View style={{ width: "55%" }}>
                <DataTable
                  columns={[
                    { key: "category", label: "Categoria", width: "45%" },
                    { key: "value", label: "Valor", width: "30%", align: "right" },
                    { key: "pct", label: "% Total", width: "25%", align: "right" },
                  ]}
                  rows={costCategories.map((c) => ({
                    category: c.category,
                    value: fmtBRL(c.amount),
                    pct: totalCusto > 0 ? `${((c.amount / totalCusto) * 100).toFixed(1)}%` : "—",
                  }))}
                />
              </View>
            </View>
          </SmartSection>
        )}

        {/* Section 04: Subcategory Breakdown */}
        {subByCategory.size > 0 && (
          <SmartSection title="Detalhamento por Subcategoria" number="04" subtitle="Custos desdobrados por subcategoria">
            {Array.from(subByCategory.entries()).map(([cat, subs]) => (
              <View key={cat} style={{ marginBottom: SPACE.lg }} wrap={false}>
                <Text
                  style={{
                    fontSize: TYPE.h4,
                    fontFamily: "Helvetica-Bold",
                    color: BRAND.gray700,
                    marginBottom: SPACE.sm,
                  }}
                >
                  {cat}
                </Text>
                <HorizontalBarChart
                  items={subs
                    .sort((a, b) => b.amount - a.amount)
                    .map((s) => ({
                      label: s.subcategory,
                      value: s.amount,
                      formattedValue: fmtBRL(s.amount),
                    }))}
                />
              </View>
            ))}
          </SmartSection>
        )}

        {/* Section 05: Budget vs Spend */}
        {data.budget?.categories && data.budget.categories.length > 0 && (
          <SmartSection title="Gasto vs Orçamento" number="05" subtitle="Execução orçamentária por categoria">
            {data.budget.categories.map((bc) => {
              const pct = bc.allocated > 0 ? (bc.spent / bc.allocated) * 100 : 0;
              return (
                <View key={bc.name} wrap={false}>
                  <ProgressBar
                    value={Math.min(pct, 100)}
                    label={`${bc.name} — ${fmtBRL(bc.spent)} / ${fmtBRL(bc.allocated)}`}
                    color={pct > 100 ? BRAND.red : pct > 80 ? BRAND.orange : BRAND.green}
                  />
                </View>
              );
            })}
            {data.budget.categories.some((bc) => bc.allocated > 0 && bc.spent > bc.allocated) && (
              <CalloutBox
                type="warning"
                title="Atenção"
                text="Uma ou mais categorias ultrapassaram o orçamento alocado. Revise os lançamentos para ajustar o planejamento."
              />
            )}
          </SmartSection>
        )}

        {/* Section 06: Top 15 Costs */}
        {data.topCosts.length > 0 && (
          <SmartSection title="Top 15 Maiores Custos" number="06" subtitle="Lançamentos de maior impacto no período">
            <DataTable
              columns={[
                { key: "rank", label: "#", width: "7%" },
                { key: "date", label: "Data", width: "13%" },
                { key: "description", label: "Descrição", width: "30%" },
                { key: "category", label: "Categoria", width: "18%" },
                { key: "subcategory", label: "Subcategoria", width: "17%" },
                { key: "amount", label: "Valor", width: "15%", align: "right" },
              ]}
              rows={data.topCosts.slice(0, 15).map((t, i) => ({
                rank: String(i + 1),
                date: t.date,
                description: t.description || "—",
                category: t.category || "—",
                subcategory: t.subcategory || "—",
                amount: fmtBRL(t.amount),
              }))}
            />
          </SmartSection>
        )}

        {/* Section 07: All Transactions */}
        {data.transactions.length > 0 && (
          <SmartSection title="Lançamentos do Período" number="07" subtitle={`${data.transactions.length} transações registradas`}>
            <DataTable
              columns={[
                { key: "date", label: "Data", width: "10%" },
                { key: "type", label: "Tipo", width: "8%" },
                { key: "category", label: "Categoria", width: "15%" },
                { key: "subcategory", label: "Subcat.", width: "13%" },
                { key: "description", label: "Descrição", width: "24%" },
                { key: "amount", label: "Valor", width: "14%", align: "right" },
                { key: "status", label: "Status", width: "16%", align: "center" },
              ]}
              rows={data.transactions.map((t) => ({
                date: t.date,
                type: t.type === "receita" ? "Receita" : "Custo",
                category: t.category || "—",
                subcategory: t.subcategory || "—",
                description: t.description || "—",
                amount: fmtBRL(t.amount),
                status: t.status,
              }))}
            />
          </SmartSection>
        )}
      </FlowPage>
    </Document>
  );
}
