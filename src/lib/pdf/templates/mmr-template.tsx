/**
 * MMR — Monthly Marketing Review
 * Relatório mensal completo com análise estratégica.
 * Redesigned to match Genspark mockups.
 */
import React from "react";
import { Document, View, Text } from "@react-pdf/renderer";
import { BRAND, TYPE, SPACE } from "../theme";
import {
  CoverPage,
  ContentPage,
  SectionHeader,
  KpiRow,
  DataTable,
  ProgressBar,
  CalloutBox,
  HorizontalBarChart,
  TwoColumn,
  InsightGrid,
  DonutChart,
} from "../components";

export interface MMRData {
  period: string;
  companyName?: string;
  executiveSummary: string;
  kpis: {
    roi: number;
    revenue: number;
    totalBudget: number;
    budgetSpent: number;
    conversions: number;
    cac: number;
    demandsTotal: number;
    demandsCompleted: number;
    campaignsLaunched: number;
    avgSatisfaction?: number;
  };
  budgetCategories: { name: string; allocated: number; spent: number }[];
  campaignResults: {
    name: string;
    type: string;
    status: string;
    reach: number;
    investment: number;
    roi?: number;
  }[];
  demandMetrics: {
    avgDaysToComplete: number;
    byType: { type: string; count: number }[];
    byPriority: { priority: string; count: number }[];
  };
  storeRanking?: { name: string; score: number }[];
  recommendations?: string[];
  insights?: {
    title: string;
    text: string;
    items?: string[];
    type: "opportunity" | "warning" | "success" | "danger";
  }[];
  aiInsights?: string;
}

function curr(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);
}

function num(v: number) {
  return new Intl.NumberFormat("pt-BR").format(v);
}

export function MMRDocument({ data }: { data: MMRData }) {
  const budgetUtil = data.kpis.totalBudget > 0 ? (data.kpis.budgetSpent / data.kpis.totalBudget) * 100 : 0;
  const completionRate = data.kpis.demandsTotal > 0 ? (data.kpis.demandsCompleted / data.kpis.demandsTotal) * 100 : 0;

  return (
    <Document title={`MMR - ${data.period}`} author={data.companyName || "Empresa"}>
      {/* Cover */}
      <CoverPage
        title="Monthly Marketing Review"
        subtitle="Revisão Mensal de Marketing"
        periodLabel={data.period}
        companyName={data.companyName}
        reportType="MMR"
      />

      {/* Page 1: Executive Summary + Core KPIs */}
      <ContentPage>
        <SectionHeader title="Resumo Executivo" subtitle="Visão consolidada do mês" number="01" />

        <CalloutBox text={data.executiveSummary} type="info" title="Sumário" />

        <KpiRow
          items={[
            {
              label: "ROI",
              value: `${data.kpis.roi.toFixed(1)}%`,
              accentColor: data.kpis.roi >= 0 ? BRAND.green : BRAND.red,
              change: data.kpis.roi >= 0 ? "Positivo" : "Negativo",
              changeType: data.kpis.roi >= 0 ? "positive" : "negative",
            },
            { label: "Receita Gerada", value: curr(data.kpis.revenue), accentColor: BRAND.blue },
            { label: "CAC", value: curr(data.kpis.cac), accentColor: BRAND.orange },
          ]}
        />

        <KpiRow
          items={[
            { label: "Campanhas Lançadas", value: String(data.kpis.campaignsLaunched), accentColor: BRAND.teal },
            {
              label: "Demandas Entregues",
              value: `${data.kpis.demandsCompleted}/${data.kpis.demandsTotal}`,
              accentColor: BRAND.green,
              change: `${completionRate.toFixed(0)}% entregues`,
              changeType: completionRate >= 80 ? "positive" : "negative",
            },
            { label: "Conversões", value: num(data.kpis.conversions), accentColor: BRAND.blue },
          ]}
        />
      </ContentPage>

      {/* Page 2: Budget Deep Dive */}
      <ContentPage>
        <SectionHeader title="Análise Orçamentária" subtitle="Distribuição e utilização do budget" number="02" />

        <KpiRow
          columns={3}
          items={[
            { label: "Budget Total", value: curr(data.kpis.totalBudget), accentColor: BRAND.blue },
            { label: "Investido", value: curr(data.kpis.budgetSpent), accentColor: BRAND.orange },
            {
              label: "Disponível",
              value: curr(data.kpis.totalBudget - data.kpis.budgetSpent),
              accentColor: BRAND.green,
            },
          ]}
        />

        <ProgressBar value={budgetUtil} label="Utilização Geral" color={budgetUtil > 90 ? BRAND.red : BRAND.green} />

        <DataTable
          title="Detalhamento por Categoria"
          columns={[
            { key: "name", label: "Categoria", width: "35%" },
            { key: "allocated", label: "Alocado", width: "22%", align: "right" },
            { key: "spent", label: "Gasto", width: "22%", align: "right" },
            { key: "usage", label: "Uso", width: "21%", align: "right" },
          ]}
          rows={data.budgetCategories.map((c) => ({
            name: c.name,
            allocated: curr(c.allocated),
            spent: curr(c.spent),
            usage: c.allocated > 0 ? `${((c.spent / c.allocated) * 100).toFixed(0)}%` : "—",
          }))}
        />
      </ContentPage>

      {/* Page 3: Campaigns Performance */}
      <ContentPage>
        <SectionHeader title="Performance de Campanhas" subtitle="Resultados detalhados por campanha" number="03" />

        <DataTable
          columns={[
            { key: "name", label: "Campanha", width: "28%" },
            { key: "type", label: "Tipo", width: "14%" },
            { key: "status", label: "Status", width: "14%" },
            { key: "reach", label: "Alcance", width: "15%", align: "right" },
            { key: "investment", label: "Investimento", width: "17%", align: "right" },
            { key: "roi", label: "ROI", width: "12%", align: "right" },
          ]}
          rows={data.campaignResults.map((c) => ({
            name: c.name,
            type: c.type,
            status: c.status,
            reach: num(c.reach),
            investment: curr(c.investment),
            roi: c.roi !== undefined ? `${c.roi.toFixed(0)}%` : "—",
          }))}
        />
      </ContentPage>

      {/* Page 4: Demand Metrics + Operational */}
      <ContentPage>
        <SectionHeader title="Produção & Operação" subtitle="Métricas de demandas e eficiência operacional" number="04" />

        <TwoColumn
          left={
            <View>
              <KpiRow
                items={[
                  { label: "Prazo Médio", value: `${data.demandMetrics.avgDaysToComplete}d`, accentColor: BRAND.blue },
                ]}
              />
              <ProgressBar value={completionRate} label="Taxa de Entrega" color={BRAND.green} />
              <HorizontalBarChart
                title="Demandas por Tipo"
                items={data.demandMetrics.byType.map((d) => ({
                  label: d.type,
                  value: d.count,
                  color: BRAND.blue,
                }))}
              />
            </View>
          }
          right={
            <HorizontalBarChart
              title="Demandas por Prioridade"
              items={data.demandMetrics.byPriority.map((d, i) => ({
                label: d.priority,
                value: d.count,
                color: [BRAND.gray400, BRAND.blue, BRAND.orange, BRAND.red][i] || BRAND.gray400,
              }))}
            />
          }
        />
      </ContentPage>

      {/* Page 5: Insights & Recommendations */}
      <ContentPage>
        <SectionHeader title="Conclusões & Recomendações" subtitle="Análise estratégica e próximos passos" number="05" />

        {data.insights && data.insights.length > 0 && <InsightGrid cards={data.insights} />}

        {data.storeRanking && data.storeRanking.length > 0 && (
          <HorizontalBarChart
            title="Ranking de Lojas (Score de Execução)"
            items={data.storeRanking.map((s) => ({
              label: s.name,
              value: s.score,
              formattedValue: `${s.score}%`,
              color: s.score >= 80 ? BRAND.green : s.score >= 50 ? BRAND.orange : BRAND.red,
            }))}
          />
        )}

        {data.recommendations && data.recommendations.length > 0 && (
          <DataTable
            title="Recomendações"
            columns={[
              { key: "idx", label: "#", width: "8%" },
              { key: "rec", label: "Ação Recomendada", width: "92%" },
            ]}
            rows={data.recommendations.map((r, i) => ({ idx: String(i + 1), rec: r }))}
          />
        )}

        {data.aiInsights && <CalloutBox title="Análise com IA" text={data.aiInsights} type="info" />}
      </ContentPage>
    </Document>
  );
}
