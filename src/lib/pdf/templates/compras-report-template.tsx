/**
 * Compras Purchasing Report — Relatório de Inteligência de Compras
 */
import React from "react";
import { Document, View, Text } from "@react-pdf/renderer";
import { BRAND, TYPE, SPACE } from "../theme";
import {
  CoverPage,
  FlowPage,
  SmartSection,
  KpiRow,
  DataTable,
  CalloutBox,
  HorizontalBarChart,
} from "../components";

export interface ComprasReportData {
  period: string;
  companyName?: string;
  semaphore: { label: string; status: "green" | "yellow" | "red"; detail: string }[];
  kpis: {
    totalVolume: number;
    activePOs: number;
    activeSuppliers: number;
    avgDPO: number;
    savingPct: number;
    ppvAccumulated: number;
    otifAvg: number;
    gmroiAvg: number;
  };
  topSuppliers: { name: string; score: number; volume: number }[];
  pipelineSummary: { status: string; count: number; value: number }[];
  tradeAllowances: { supplier: string; type: string; planned: number; realized: number; adherence: number }[];
  activeAlerts: { title: string; level: string; type: string }[];
}

function brl(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function pct(v: number, d = 1): string {
  return `${v.toFixed(d)}%`;
}

const semaphoreColors = { green: BRAND.green, yellow: BRAND.yellow, red: BRAND.danger };

export function ComprasReportDocument({ data }: { data: ComprasReportData }) {
  return (
    <Document title={`Relatório de Compras — ${data.period}`} author={data.companyName || "Empresa"}>
      <CoverPage
        title="Relatório de Inteligência"
        subtitle="Compras & Suprimentos"
        periodLabel={data.period}
        companyName={data.companyName}
        reportType="COMPRAS"
      />

      {/* Page 1: Semaphore + KPIs */}
      <FlowPage moduleName="Compras">
        <SmartSection title="Semáforo Geral" subtitle="Visão consolidada das 4 dimensões" number="01">
          <View style={{ flexDirection: "row", gap: SPACE.sm, marginBottom: SPACE.lg }}>
            {data.semaphore.map((s, i) => (
              <View key={i} style={{
                flex: 1, backgroundColor: BRAND.gray100, borderRadius: 6,
                padding: SPACE.md, borderLeftWidth: 4, borderLeftColor: semaphoreColors[s.status],
              }}>
                <Text style={{ fontSize: TYPE.caption, fontFamily: "Helvetica-Bold", color: BRAND.gray800, marginBottom: 2 }}>
                  {s.label}
                </Text>
                <Text style={{ fontSize: TYPE.tiny, color: BRAND.gray500 }}>{s.detail}</Text>
              </View>
            ))}
          </View>
        </SmartSection>

        <SmartSection title="Indicadores Consolidados" subtitle="KPIs do período" number="02">
          <KpiRow items={[
            { label: "Volume de Compras", value: brl(data.kpis.totalVolume), accentColor: "#0A3264" },
            { label: "OCs Ativas", value: String(data.kpis.activePOs), accentColor: "#0A3264" },
            { label: "Fornecedores Ativos", value: String(data.kpis.activeSuppliers), accentColor: "#0A3264" },
            { label: "DPO Médio", value: `${data.kpis.avgDPO}d`, accentColor: data.kpis.avgDPO >= 30 ? BRAND.green : BRAND.yellow },
          ]} />
          <View style={{ height: SPACE.md }} />
          <KpiRow items={[
            { label: "Saving", value: pct(data.kpis.savingPct), accentColor: data.kpis.savingPct >= 1 ? BRAND.green : BRAND.yellow },
            { label: "PPV Acumulado", value: brl(data.kpis.ppvAccumulated), accentColor: data.kpis.ppvAccumulated >= 0 ? BRAND.green : BRAND.danger },
            { label: "OTIF Médio", value: pct(data.kpis.otifAvg), accentColor: data.kpis.otifAvg >= 95 ? BRAND.green : BRAND.yellow },
            { label: "GMROI Médio", value: `${data.kpis.gmroiAvg.toFixed(2)}x`, accentColor: data.kpis.gmroiAvg >= 2 ? BRAND.green : BRAND.yellow },
          ]} />
        </SmartSection>
      </FlowPage>

      {/* Page 2: Top Suppliers + Pipeline */}
      <FlowPage moduleName="Compras">
        <SmartSection title="Top Fornecedores" subtitle="Ranking por score composto" number="03">
          {data.topSuppliers.length > 0 ? (
            <HorizontalBarChart
              items={data.topSuppliers.map(s => ({
                label: `${s.name} (${s.score})`,
                value: s.score,
                maxValue: 100,
                color: s.score >= 85 ? BRAND.green : (s.score >= 70 ? "#0A3264" : (s.score >= 50 ? BRAND.yellow : BRAND.danger)),
              }))}
            />
          ) : (
            <CalloutBox type="info" title="Sem Dados" text="Nenhum fornecedor com score registrado." />
          )}
        </SmartSection>

        <SmartSection title="Pipeline de OCs" subtitle="Distribuição por status" number="04">
          {data.pipelineSummary.length > 0 ? (
            <DataTable
              columns={[
                { key: "status", label: "Status", width: "35%" },
                { key: "count", label: "Qtd", width: "20%", align: "center" },
                { key: "value", label: "Valor Total", width: "45%", align: "right" },
              ]}
              rows={data.pipelineSummary.map(p => ({
                status: p.status,
                count: String(p.count),
                value: brl(p.value),
              }))}
            />
          ) : (
            <CalloutBox type="info" title="Sem OCs" text="Nenhuma ordem de compra no período." />
          )}
        </SmartSection>
      </FlowPage>

      {/* Page 3: Trade Allowances + Alerts */}
      <FlowPage moduleName="Compras">
        <SmartSection title="Verbas Comerciais" subtitle="Previsto vs. Realizado" number="05">
          {data.tradeAllowances.length > 0 ? (
            <DataTable
              columns={[
                { key: "supplier", label: "Fornecedor", width: "25%" },
                { key: "type", label: "Tipo", width: "20%" },
                { key: "planned", label: "Previsto", width: "18%", align: "right" },
                { key: "realized", label: "Realizado", width: "18%", align: "right" },
                { key: "adherence", label: "Aderência", width: "19%", align: "right" },
              ]}
              rows={data.tradeAllowances.map(t => ({
                supplier: t.supplier,
                type: t.type,
                planned: brl(t.planned),
                realized: brl(t.realized),
                adherence: pct(t.adherence),
              }))}
            />
          ) : (
            <CalloutBox type="info" title="Sem Verbas" text="Nenhuma verba comercial registrada." />
          )}
        </SmartSection>

        <SmartSection title="Alertas Ativos" subtitle="Ocorrências que demandam ação" number="06">
          {data.activeAlerts.length > 0 ? (
            <DataTable
              columns={[
                { key: "title", label: "Alerta", width: "55%" },
                { key: "level", label: "Nível", width: "20%", align: "center" },
                { key: "type", label: "Tipo", width: "25%", align: "center" },
              ]}
              rows={data.activeAlerts.map(a => ({
                title: a.title,
                level: a.level === "critical" ? "Crítico" : (a.level === "warning" ? "Atenção" : "Info"),
                type: a.type.replace(/_/g, " "),
              }))}
            />
          ) : (
            <CalloutBox type="success" title="Tudo OK" text="Nenhum alerta ativo." />
          )}
        </SmartSection>
      </FlowPage>
    </Document>
  );
}
