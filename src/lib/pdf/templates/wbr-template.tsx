/**
 * WBR — Weekly Business Review
 * Relatório semanal com foco operacional.
 * Redesigned to match Genspark mockups.
 */
import React from "react";
import { Document, View } from "@react-pdf/renderer";
import { BRAND } from "../theme";
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
} from "../components";

export interface WBRData {
  period: string;
  companyName?: string;
  kpis: {
    demandsCreated: number;
    demandsCompleted: number;
    campaignsActive: number;
    budgetUtilization: number;
    avgCompletionDays: number;
    overdueCount: number;
  };
  demandsByStatus: { status: string; count: number }[];
  campaignProgress: { name: string; progress: number; status?: string }[];
  topAlerts: { message: string; severity: "info" | "warning" | "danger" }[];
  budgetByCategory: { name: string; allocated: number; spent: number }[];
  weekHighlights?: string[];
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

export function WBRDocument({ data }: { data: WBRData }) {
  const completionRate =
    data.kpis.demandsCreated > 0 ? (data.kpis.demandsCompleted / data.kpis.demandsCreated) * 100 : 0;

  return (
    <Document title={`WBR - ${data.period}`} author={data.companyName || "Empresa"}>
      {/* Cover */}
      <CoverPage
        title="Weekly Business Review"
        subtitle="Revisão Semanal de Negócios"
        periodLabel={data.period}
        companyName={data.companyName}
        reportType="WBR"
      />

      {/* Page 1: KPIs */}
      <ContentPage>
        <SectionHeader title="Indicadores da Semana" subtitle="Visão geral da operação de marketing" number="01" />

        <KpiRow
          items={[
            {
              label: "Demandas Criadas",
              value: String(data.kpis.demandsCreated),
              accentColor: BRAND.blue,
            },
            {
              label: "Concluídas",
              value: String(data.kpis.demandsCompleted),
              accentColor: BRAND.green,
              change: `${completionRate.toFixed(0)}% taxa`,
              changeType: completionRate >= 70 ? "positive" : "negative",
            },
            {
              label: "Campanhas Ativas",
              value: String(data.kpis.campaignsActive),
              accentColor: BRAND.teal,
            },
          ]}
        />

        <KpiRow
          items={[
            {
              label: "Utilização de Budget",
              value: `${data.kpis.budgetUtilization.toFixed(0)}%`,
              accentColor: data.kpis.budgetUtilization > 90 ? BRAND.red : BRAND.green,
            },
            {
              label: "Tempo Médio",
              value: `${data.kpis.avgCompletionDays}d`,
              accentColor: BRAND.blue,
            },
            {
              label: "Atrasadas",
              value: String(data.kpis.overdueCount),
              accentColor: data.kpis.overdueCount > 0 ? BRAND.red : BRAND.green,
              change: data.kpis.overdueCount > 0 ? "Requer atenção" : "Sem atrasos",
              changeType: data.kpis.overdueCount > 0 ? "negative" : "positive",
            },
          ]}
        />

        <ProgressBar
          value={completionRate}
          label="Taxa de Conclusão de Demandas"
          color={completionRate >= 80 ? BRAND.green : completionRate >= 50 ? BRAND.orange : BRAND.red}
        />

        <HorizontalBarChart
          title="Demandas por Status"
          items={data.demandsByStatus.map((d) => ({
            label: d.status,
            value: d.count,
            color: BRAND.blue,
          }))}
        />
      </ContentPage>

      {/* Page 2: Campaigns + Budget */}
      <ContentPage>
        <SectionHeader title="Campanhas & Orçamento" subtitle="Progresso das campanhas ativas e distribuição de budget" number="02" />

        {data.campaignProgress.length > 0 && (
          <HorizontalBarChart
            title="Progresso das Campanhas"
            items={data.campaignProgress.map((c) => ({
              label: c.name,
              value: c.progress,
              formattedValue: `${c.progress}%`,
              color: c.progress >= 80 ? BRAND.green : c.progress >= 50 ? BRAND.orange : BRAND.blue,
            }))}
          />
        )}

        {data.budgetByCategory.length > 0 && (
          <DataTable
            title="Orçamento por Categoria"
            columns={[
              { key: "name", label: "Categoria", width: "40%" },
              { key: "allocated", label: "Alocado", width: "22%", align: "right" },
              { key: "spent", label: "Gasto", width: "20%", align: "right" },
              { key: "usage", label: "% Uso", width: "18%", align: "right" },
            ]}
            rows={data.budgetByCategory.map((c) => ({
              name: c.name,
              allocated: curr(c.allocated),
              spent: curr(c.spent),
              usage: c.allocated > 0 ? `${((c.spent / c.allocated) * 100).toFixed(0)}%` : "—",
            }))}
          />
        )}
      </ContentPage>

      {/* Page 3: Insights & Alerts */}
      <ContentPage>
        <SectionHeader title="Insights & Alertas" subtitle="Pontos de atenção e análises da semana" number="03" />

        {data.insights && data.insights.length > 0 ? (
          <InsightGrid cards={data.insights} />
        ) : (
          <>
            {data.topAlerts.map((alert, idx) => (
              <CalloutBox key={idx} text={alert.message} type={alert.severity === "danger" ? "danger" : alert.severity === "warning" ? "warning" : "info"} />
            ))}
          </>
        )}

        {data.weekHighlights && data.weekHighlights.length > 0 && (
          <DataTable
            title="Destaques da Semana"
            columns={[
              { key: "idx", label: "#", width: "8%" },
              { key: "highlight", label: "Destaque", width: "92%" },
            ]}
            rows={data.weekHighlights.map((h, i) => ({ idx: String(i + 1), highlight: h }))}
          />
        )}

        {data.aiInsights && <CalloutBox title="Insights com IA" text={data.aiInsights} type="info" />}
      </ContentPage>
    </Document>
  );
}
