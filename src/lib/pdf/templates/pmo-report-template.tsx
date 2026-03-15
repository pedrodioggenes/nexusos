/**
 * PMO Report Document — Generic template for all HiperDev report types.
 * Accepts report type + dynamic data and conditionally renders pages
 * based on selected sections from ReportGeneratorDialog.
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
  InsightGrid,
} from "../components";

// ── Data types ──────────────────────────────────────────
export interface PMOKpi {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  accentColor?: string;
}

export interface PMOTableRow {
  [key: string]: string | number;
}

export interface PMOAlert {
  title?: string;
  message: string;
  type: "info" | "success" | "warning" | "danger";
}

export interface PMOProgressItem {
  label: string;
  value: number;
  color?: string;
}

export interface PMOInsight {
  title: string;
  text: string;
  items?: string[];
  type: "opportunity" | "warning" | "success" | "danger";
}

export interface PMOReportData {
  reportType: string;
  reportTitle: string;
  reportSubtitle: string;
  period: string;
  companyName?: string;
  /** Sections to render (matches section keys from ReportGeneratorDialog) */
  sections: string[];
  /** Comments from user */
  comments?: string;
  /** KPI cards */
  kpis?: PMOKpi[];
  /** Data tables - each keyed by section */
  tables?: Record<string, {
    title: string;
    columns: { key: string; label: string; width: string; align?: "left" | "center" | "right" }[];
    rows: PMOTableRow[];
  }>;
  /** Progress bars */
  progressItems?: PMOProgressItem[];
  /** Alerts / callouts */
  alerts?: PMOAlert[];
  /** Insight cards */
  insights?: PMOInsight[];
  /** Bar chart data */
  barCharts?: Record<string, {
    title: string;
    items: { label: string; value: number; formattedValue?: string; color?: string }[];
  }>;
}

function curr(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(v);
}

// ── Report Type Config ──────────────────────────────────
const REPORT_TITLES: Record<string, { title: string; subtitle: string; acronym: string }> = {
  pdi_status: { title: "Relatório de Status PDI", subtitle: "Plano Diretor de Implantação", acronym: "PDI" },
  iniciativas: { title: "Relatório de Iniciativas", subtitle: "Pipeline de Iniciativas", acronym: "INI" },
  sprint_review: { title: "Sprint Review Report", subtitle: "Velocidade e Entregáveis", acronym: "SPR" },
  releases: { title: "Release Notes Report", subtitle: "Changelog e Impacto", acronym: "REL" },
  indicadores: { title: "Relatório de Indicadores", subtitle: "KPIs Operacionais", acronym: "KPI" },
  suporte_sla: { title: "Relatório de Suporte & SLA", subtitle: "Compliance e Métricas", acronym: "SLA" },
  geral: { title: "Relatório Geral Executivo", subtitle: "Visão Consolidada Tech", acronym: "EXE" },
};

export function PMOReportDocument({ data }: { data: PMOReportData }) {
  const config = REPORT_TITLES[data.reportType] || {
    title: data.reportTitle,
    subtitle: data.reportSubtitle,
    acronym: data.reportType.toUpperCase().slice(0, 3),
  };

  let sectionNumber = 0;
  const nextSection = () => String(++sectionNumber).padStart(2, "0");

  return (
    <Document
      title={`${config.acronym} - ${data.period}`}
      author={data.companyName || "Empresa"}
    >
      {/* Cover */}
      <CoverPage
        title={config.title}
        subtitle={config.subtitle}
        periodLabel={data.period}
        companyName={data.companyName}
        reportType={config.acronym}
      />

      {/* KPIs Page */}
      {data.kpis && data.kpis.length > 0 && (
        <ContentPage>
          <SectionHeader
            title="Indicadores-Chave"
            subtitle="Métricas consolidadas do período"
            number={nextSection()}
          />
          {/* Render KPIs in rows of 3 */}
          {chunkArray(data.kpis, 3).map((row, i) => (
            <KpiRow key={i} items={row} />
          ))}

          {/* Progress bars if provided */}
          {data.progressItems && data.progressItems.length > 0 && (
            <View style={{ marginTop: SPACE.lg }}>
              {data.progressItems.map((item, idx) => (
                <ProgressBar
                  key={idx}
                  label={item.label}
                  value={item.value}
                  color={item.color || BRAND.red}
                />
              ))}
            </View>
          )}
        </ContentPage>
      )}

      {/* Data Tables Pages */}
      {data.tables &&
        Object.entries(data.tables)
          .filter(([key]) => data.sections.includes(key))
          .map(([key, table]) => (
            <ContentPage key={key}>
              <SectionHeader
                title={table.title}
                number={nextSection()}
              />
              <DataTable
                columns={table.columns}
                rows={table.rows}
              />
            </ContentPage>
          ))}

      {/* Bar Charts Pages */}
      {data.barCharts &&
        Object.entries(data.barCharts)
          .filter(([key]) => data.sections.includes(key))
          .map(([key, chart]) => (
            <ContentPage key={key}>
              <SectionHeader title={chart.title} number={nextSection()} />
              <HorizontalBarChart
                title={chart.title}
                items={chart.items}
              />
            </ContentPage>
          ))}

      {/* Alerts / Insights Page */}
      {((data.alerts && data.alerts.length > 0) || (data.insights && data.insights.length > 0)) && (
        <ContentPage>
          <SectionHeader
            title="Riscos & Oportunidades"
            subtitle="Pontos de atenção identificados no período"
            number={nextSection()}
          />

          {data.insights && data.insights.length > 0 && (
            <InsightGrid cards={data.insights} />
          )}

          {data.alerts &&
            data.alerts.map((alert, idx) => (
              <CalloutBox
                key={idx}
                title={alert.title}
                text={alert.message}
                type={alert.type}
              />
            ))}
        </ContentPage>
      )}

      {/* User Comments Page */}
      {data.comments && data.comments.trim().length > 0 && (
        <ContentPage>
          <SectionHeader
            title="Observações"
            subtitle="Comentários qualitativos do gestor"
            number={nextSection()}
          />
          <CalloutBox
            title="Notas do Gestor"
            text={data.comments}
            type="info"
          />
        </ContentPage>
      )}
    </Document>
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
