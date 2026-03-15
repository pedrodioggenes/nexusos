/**
 * Individual Financial Sub-Report PDF Templates
 * Small, focused PDFs for each report type (resumo, categorias, etc.)
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
} from "../components";
import { BRAND, TYPE, SPACE } from "../theme";

function fmtBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v);
}

function monthLabel(m: string): string {
  const L: Record<string, string> = {
    "01":"Jan","02":"Fev","03":"Mar","04":"Abr","05":"Mai","06":"Jun",
    "07":"Jul","08":"Ago","09":"Set","10":"Out","11":"Nov","12":"Dez",
  };
  return L[m.split("-")[1]] || m;
}

// ── Resumo Mensal ───────────────────────────────────────
export interface ResumoMensalData {
  periodLabel: string;
  rows: { month: string; receita: number; custo: number }[];
}

export function ResumoMensalDocument({ data }: { data: ResumoMensalData }) {
  return (
    <Document>
      <CoverPage title="Resumo Mensal" subtitle="Receitas, custos e saldo consolidados" periodLabel={data.periodLabel} reportType="RMM" />
      <FlowPage moduleName="Marketing">
        <SmartSection title="Evolução Mensal" number="01">
          <View wrap={false}>
            <VerticalBarChart
              items={data.rows.map((r) => ({
                label: monthLabel(r.month),
                values: [
                  { value: r.receita, color: BRAND.green, legend: "Receita" },
                  { value: r.custo, color: BRAND.red, legend: "Custo" },
                ],
              }))}
              height={180}
            />
          </View>
        </SmartSection>
        <SmartSection title="Detalhamento" number="02">
          <DataTable
            columns={[
              { key: "month", label: "Mês", width: "25%" },
              { key: "receita", label: "Receita", width: "25%", align: "right" },
              { key: "custo", label: "Custo", width: "25%", align: "right" },
              { key: "saldo", label: "Saldo", width: "25%", align: "right" },
            ]}
            rows={data.rows.map((r) => ({
              month: monthLabel(r.month),
              receita: fmtBRL(r.receita),
              custo: fmtBRL(r.custo),
              saldo: fmtBRL(r.receita - r.custo),
            }))}
          />
        </SmartSection>
      </FlowPage>
    </Document>
  );
}

// ── Custos por Categoria ────────────────────────────────
export interface CustosCategoriaData {
  periodLabel: string;
  categories: { name: string; value: number }[];
}

const CHART_COLORS = [
  BRAND.red, BRAND.blue, BRAND.teal, BRAND.purple,
  BRAND.orange, BRAND.green, "#E91E63", "#795548",
];

export function CustosCategoriaDocument({ data }: { data: CustosCategoriaData }) {
  const total = data.categories.reduce((s, c) => s + c.value, 0);
  return (
    <Document>
      <CoverPage title="Custos por Categoria" subtitle="Distribuição de gastos por categoria" periodLabel={data.periodLabel} reportType="CPC" />
      <FlowPage moduleName="Marketing">
        <SmartSection title="Distribuição de Custos" number="01">
          <View style={{ flexDirection: "row", gap: SPACE.lg }} wrap={false}>
            <View style={{ width: "45%" }}>
              <DonutChart
                segments={data.categories.map((c, i) => ({
                  label: c.name, value: c.value,
                  color: CHART_COLORS[i % CHART_COLORS.length],
                }))}
                size={160}
              />
            </View>
            <View style={{ width: "55%" }}>
              <DataTable
                columns={[
                  { key: "name", label: "Categoria", width: "45%" },
                  { key: "value", label: "Valor", width: "30%", align: "right" },
                  { key: "pct", label: "% Total", width: "25%", align: "right" },
                ]}
                rows={data.categories.map((c) => ({
                  name: c.name,
                  value: fmtBRL(c.value),
                  pct: total > 0 ? `${((c.value / total) * 100).toFixed(1)}%` : "—",
                }))}
              />
            </View>
          </View>
        </SmartSection>
      </FlowPage>
    </Document>
  );
}

// ── Gasto vs Orçamento ──────────────────────────────────
export interface GastoOrcamentoData {
  periodLabel: string;
  rows: { month: string; gasto: number; orcamento: number }[];
}

export function GastoOrcamentoDocument({ data }: { data: GastoOrcamentoData }) {
  return (
    <Document>
      <CoverPage title="Gasto vs Orçamento" subtitle="Evolução do gasto acumulado vs orçamento planejado" periodLabel={data.periodLabel} reportType="GVO" />
      <FlowPage moduleName="Marketing">
        <SmartSection title="Comparativo Mensal" number="01">
          <View wrap={false}>
            <VerticalBarChart
              items={data.rows.map((r) => ({
                label: monthLabel(r.month),
                values: [
                  { value: r.orcamento, color: BRAND.gray300, legend: "Orçamento" },
                  { value: r.gasto, color: BRAND.red, legend: "Gasto" },
                ],
              }))}
              height={180}
            />
          </View>
        </SmartSection>
        <SmartSection title="Detalhamento" number="02">
          <DataTable
            columns={[
              { key: "month", label: "Mês", width: "30%" },
              { key: "orcamento", label: "Orçamento", width: "35%", align: "right" },
              { key: "gasto", label: "Gasto", width: "35%", align: "right" },
            ]}
            rows={data.rows.map((r) => ({
              month: monthLabel(r.month),
              orcamento: fmtBRL(r.orcamento),
              gasto: fmtBRL(r.gasto),
            }))}
          />
        </SmartSection>
      </FlowPage>
    </Document>
  );
}

// ── Top Custos ──────────────────────────────────────────
export interface TopCustosData {
  periodLabel: string;
  items: { date: string; description: string; category: string; amount: number }[];
}

export function TopCustosDocument({ data }: { data: TopCustosData }) {
  return (
    <Document>
      <CoverPage title="Top Custos do Período" subtitle="Maiores lançamentos de custo ordenados por valor" periodLabel={data.periodLabel} reportType="TPC" />
      <FlowPage moduleName="Marketing">
        <SmartSection title="Maiores Custos" number="01">
          <DataTable
            columns={[
              { key: "rank", label: "#", width: "8%" },
              { key: "date", label: "Data", width: "15%" },
              { key: "description", label: "Descrição", width: "37%" },
              { key: "category", label: "Categoria", width: "20%" },
              { key: "amount", label: "Valor", width: "20%", align: "right" },
            ]}
            rows={data.items.map((t, i) => ({
              rank: String(i + 1),
              date: t.date,
              description: t.description || "—",
              category: t.category || "—",
              amount: fmtBRL(t.amount),
            }))}
          />
        </SmartSection>
      </FlowPage>
    </Document>
  );
}

// ── Lançamentos Detalhados ──────────────────────────────
export interface LancamentosData {
  periodLabel: string;
  items: { date: string; type: string; category: string; subcategory?: string; description: string; amount: number; paymentMethod?: string; status: string }[];
}

export function LancamentosDocument({ data }: { data: LancamentosData }) {
  return (
    <Document>
      <CoverPage title="Lançamentos Detalhados" subtitle="Tabela completa de todos os lançamentos do período" periodLabel={data.periodLabel} reportType="LCD" />
      <FlowPage moduleName="Marketing">
        <SmartSection title={`Lançamentos — ${data.items.length} registros`} number="01">
          <DataTable
            columns={[
              { key: "date", label: "Data", width: "10%" },
              { key: "type", label: "Tipo", width: "8%" },
              { key: "category", label: "Categoria", width: "15%" },
              { key: "description", label: "Descrição", width: "27%" },
              { key: "amount", label: "Valor", width: "14%", align: "right" },
              { key: "payment", label: "Pagamento", width: "12%" },
              { key: "status", label: "Status", width: "14%", align: "center" },
            ]}
            rows={data.items.map((t) => ({
              date: t.date,
              type: t.type === "receita" ? "Receita" : "Custo",
              category: t.category || "—",
              description: t.description || "—",
              amount: fmtBRL(t.amount),
              payment: t.paymentMethod || "—",
              status: t.status,
            }))}
          />
        </SmartSection>
      </FlowPage>
    </Document>
  );
}
