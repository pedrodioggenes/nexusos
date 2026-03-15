/**
 * QBR — Quarterly Business Review
 * Relatório trimestral estratégico com análise profunda e tendências.
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

export interface QBRData {
  period: string;
  quarter: string;
  companyName?: string;
  executiveSummary: string;
  kpis: {
    roi: number;
    totalRevenue: number;
    totalInvestment: number;
    totalConversions: number;
    avgCac: number;
    avgLtv: number;
    demandsCompleted: number;
    demandsTotal: number;
    campaignsTotal: number;
    experimentsRun: number;
  };
  monthlyTrend: {
    month: string;
    revenue: number;
    investment: number;
    roi: number;
  }[];
  topCampaigns: {
    name: string;
    roi: number;
    investment: number;
    revenue: number;
  }[];
  channelPerformance: {
    channel: string;
    investment: number;
    revenue: number;
    conversions: number;
  }[];
  budgetVsActual: {
    category: string;
    planned: number;
    actual: number;
  }[];
  experimentResults?: {
    title: string;
    hypothesis: string;
    result: string;
    decision: string;
  }[];
  strategicGoals: {
    goal: string;
    target: string;
    actual: string;
    progress: number;
  }[];
  insights?: {
    title: string;
    text: string;
    items?: string[];
    type: "opportunity" | "warning" | "success" | "danger";
  }[];
  nextQuarterPriorities?: string[];
  aiInsights?: string;
}

function curr(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);
}

function num(v: number) {
  return new Intl.NumberFormat("pt-BR").format(v);
}

export function QBRDocument({ data }: { data: QBRData }) {
  const completionRate = data.kpis.demandsTotal > 0 ? (data.kpis.demandsCompleted / data.kpis.demandsTotal) * 100 : 0;

  return (
    <Document title={`QBR - ${data.quarter} ${data.period}`} author={data.companyName || "Empresa"}>
      {/* Cover */}
      <CoverPage
        title="Quarterly Business Review"
        subtitle={`Revisão Trimestral • ${data.quarter}`}
        periodLabel={data.period}
        companyName={data.companyName}
        reportType="QBR"
      />

      {/* Page 1: Executive Summary + Strategic KPIs */}
      <ContentPage>
        <SectionHeader title="Visão Executiva" subtitle="Resultados consolidados do trimestre" number="01" />

        <CalloutBox text={data.executiveSummary} type="info" title="Resumo do Trimestre" />

        <KpiRow
          items={[
            {
              label: "ROI do Trimestre",
              value: `${data.kpis.roi.toFixed(1)}%`,
              accentColor: data.kpis.roi >= 0 ? BRAND.green : BRAND.red,
              change: data.kpis.roi >= 100 ? "Acima da meta" : "Abaixo da meta",
              changeType: data.kpis.roi >= 100 ? "positive" : "negative",
            },
            { label: "Receita Total", value: curr(data.kpis.totalRevenue), accentColor: BRAND.blue },
            { label: "Investimento Total", value: curr(data.kpis.totalInvestment), accentColor: BRAND.orange },
          ]}
        />

        <KpiRow
          items={[
            { label: "CAC Médio", value: curr(data.kpis.avgCac), accentColor: BRAND.orange },
            { label: "LTV Médio", value: curr(data.kpis.avgLtv), accentColor: BRAND.green },
            { label: "Conversões", value: num(data.kpis.totalConversions), accentColor: BRAND.teal },
          ]}
        />

        <KpiRow
          items={[
            {
              label: "Demandas Entregues",
              value: `${data.kpis.demandsCompleted}/${data.kpis.demandsTotal}`,
              accentColor: BRAND.green,
              change: `${completionRate.toFixed(0)}%`,
              changeType: completionRate >= 85 ? "positive" : "negative",
            },
            { label: "Campanhas Realizadas", value: String(data.kpis.campaignsTotal), accentColor: BRAND.blue },
            { label: "Experimentos", value: String(data.kpis.experimentsRun), accentColor: BRAND.purple },
          ]}
        />
      </ContentPage>

      {/* Page 2: Monthly Trend + Top Campaigns */}
      <ContentPage>
        <SectionHeader title="Evolução Mensal" subtitle="Tendência de receita, investimento e ROI mês a mês" number="02" />

        <DataTable
          columns={[
            { key: "month", label: "Mês", width: "25%" },
            { key: "revenue", label: "Receita", width: "25%", align: "right" },
            { key: "investment", label: "Investimento", width: "25%", align: "right" },
            { key: "roi", label: "ROI", width: "25%", align: "right" },
          ]}
          rows={data.monthlyTrend.map((m) => ({
            month: m.month,
            revenue: curr(m.revenue),
            investment: curr(m.investment),
            roi: `${m.roi.toFixed(1)}%`,
          }))}
        />

        <SectionHeader title="Top Campanhas" subtitle="Campanhas com melhor retorno no trimestre" />

        <DataTable
          columns={[
            { key: "name", label: "Campanha", width: "35%" },
            { key: "investment", label: "Investimento", width: "22%", align: "right" },
            { key: "revenue", label: "Receita", width: "22%", align: "right" },
            { key: "roi", label: "ROI", width: "21%", align: "right" },
          ]}
          rows={data.topCampaigns.map((c) => ({
            name: c.name,
            investment: curr(c.investment),
            revenue: curr(c.revenue),
            roi: `${c.roi.toFixed(0)}%`,
          }))}
        />
      </ContentPage>

      {/* Page 3: Channel + Budget Analysis */}
      <ContentPage>
        <SectionHeader title="Performance por Canal" subtitle="Investimento e retorno por canal de marketing" number="03" />

        <DataTable
          columns={[
            { key: "channel", label: "Canal", width: "25%" },
            { key: "investment", label: "Investimento", width: "25%", align: "right" },
            { key: "revenue", label: "Receita", width: "25%", align: "right" },
            { key: "conversions", label: "Conversões", width: "25%", align: "right" },
          ]}
          rows={data.channelPerformance.map((c) => ({
            channel: c.channel,
            investment: curr(c.investment),
            revenue: curr(c.revenue),
            conversions: num(c.conversions),
          }))}
        />

        <SectionHeader title="Orçado vs Realizado" subtitle="Comparação entre planejamento e execução financeira" />

        {data.budgetVsActual.map((b, idx) => {
          const variance = b.planned > 0 ? ((b.actual - b.planned) / b.planned) * 100 : 0;
          return (
            <View key={idx} style={{ marginBottom: SPACE.sm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={{ fontSize: TYPE.caption, color: BRAND.gray600 }}>{b.category}</Text>
                <Text
                  style={{
                    fontSize: TYPE.caption,
                    fontFamily: "Helvetica-Bold",
                    color: variance > 10 ? BRAND.red : variance < -10 ? BRAND.green : BRAND.gray600,
                  }}
                >
                  {curr(b.actual)} / {curr(b.planned)} ({variance > 0 ? "+" : ""}
                  {variance.toFixed(0)}%)
                </Text>
              </View>
              <ProgressBar
                value={b.planned > 0 ? (b.actual / b.planned) * 100 : 0}
                color={variance > 10 ? BRAND.red : BRAND.blue}
                height={6}
              />
            </View>
          );
        })}
      </ContentPage>

      {/* Page 4: Strategic Goals + Experiments */}
      <ContentPage>
        <SectionHeader title="Metas Estratégicas" subtitle="Acompanhamento de objetivos do trimestre" number="04" />

        {data.strategicGoals.map((goal, idx) => (
          <View key={idx} style={{ marginBottom: SPACE.lg }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: SPACE.xs }}>
              <Text style={{ fontSize: TYPE.body, fontFamily: "Helvetica-Bold", color: BRAND.gray800 }}>
                {goal.goal}
              </Text>
              <Text style={{ fontSize: TYPE.caption, color: BRAND.gray500 }}>
                {goal.actual} / {goal.target}
              </Text>
            </View>
            <ProgressBar
              value={goal.progress}
              color={goal.progress >= 80 ? BRAND.green : goal.progress >= 50 ? BRAND.orange : BRAND.red}
            />
          </View>
        ))}

        {data.experimentResults && data.experimentResults.length > 0 && (
          <>
            <SectionHeader title="Resultados de Experimentos" subtitle="Testes A/B e experimentos do trimestre" />
            <DataTable
              columns={[
                { key: "title", label: "Experimento", width: "25%" },
                { key: "hypothesis", label: "Hipótese", width: "30%" },
                { key: "result", label: "Resultado", width: "25%" },
                { key: "decision", label: "Decisão", width: "20%" },
              ]}
              rows={data.experimentResults}
            />
          </>
        )}
      </ContentPage>

      {/* Page 5: Insights + Recommendations */}
      <ContentPage>
        <SectionHeader title="Próximos Passos" subtitle="Prioridades e recomendações para o próximo trimestre" number="05" />

        {data.insights && data.insights.length > 0 && <InsightGrid cards={data.insights} />}

        {data.nextQuarterPriorities && data.nextQuarterPriorities.length > 0 && (
          <DataTable
            title="Prioridades do Próximo Trimestre"
            columns={[
              { key: "idx", label: "#", width: "8%" },
              { key: "priority", label: "Prioridade Estratégica", width: "92%" },
            ]}
            rows={data.nextQuarterPriorities.map((p, i) => ({ idx: String(i + 1), priority: p }))}
          />
        )}

        {data.aiInsights && <CalloutBox title="Análise Estratégica com IA" text={data.aiInsights} type="info" />}
      </ContentPage>
    </Document>
  );
}
