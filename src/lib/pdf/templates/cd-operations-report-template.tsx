/**
 * CD Operations Report — Relatório Operacional do Centro de Distribuição
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

export interface CDOperationsData {
  period: string;
  companyName?: string;
  semaphore: { label: string; status: "green" | "yellow" | "red"; detail: string }[];
  kpis: {
    rar: number | null;
    dst: number | null;
    sur: number | null;
    pa: number | null;
    otd: number | null;
    fillRate: number | null;
    shrinkRate: number | null;
    inventoryAccuracy: number | null;
  };
  shrinkByOrigin: { origin: string; value: number; percentage: number }[];
  fillRateByStore: { store: string; fillRate: number; totalOrders: number }[];
  activeAlerts: { title: string; level: string; category: string }[];
  ruptureProjections: { sku: string; store: string; daysUntilRupture: number; currentStock: number }[];
}

function pct(v: number | null, decimals = 1): string {
  if (v == null || isNaN(v)) return "—";
  return `${v.toFixed(decimals)}%`;
}

function mins(v: number | null): string {
  if (v == null || isNaN(v)) return "—";
  return `${Math.round(v)} min`;
}

const semaphoreColors = { green: BRAND.green, yellow: BRAND.yellow, red: BRAND.danger };

export function CDOperationsDocument({ data }: { data: CDOperationsData }) {
  return (
    <Document title={`Relatório Operacional CD — ${data.period}`} author={data.companyName || "Empresa"}>
      <CoverPage
        title="Relatório Operacional"
        subtitle="Centro de Distribuição"
        periodLabel={data.period}
        companyName={data.companyName}
        reportType="CD"
      />

      {/* Page 1: Semaphore + KPIs */}
      <FlowPage moduleName="CD">
        <SmartSection title="Semáforo Operacional" subtitle="Status das áreas operacionais" number="01">
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

        <SmartSection title="Indicadores Consolidados" subtitle="KPIs operacionais do período" number="02">
          <KpiRow items={[
            { label: "Receiving Accuracy", value: pct(data.kpis.rar), accentColor: (data.kpis.rar ?? 0) >= 98 ? BRAND.green : BRAND.yellow },
            { label: "Dock-to-Stock", value: mins(data.kpis.dst), accentColor: (data.kpis.dst ?? 999) <= 90 ? BRAND.green : BRAND.yellow },
            { label: "Space Utilization", value: pct(data.kpis.sur), accentColor: (data.kpis.sur ?? 0) <= 85 ? BRAND.green : BRAND.yellow },
            { label: "Inv. Accuracy", value: pct(data.kpis.inventoryAccuracy), accentColor: (data.kpis.inventoryAccuracy ?? 0) >= 95 ? BRAND.green : BRAND.yellow },
          ]} />
          <View style={{ height: SPACE.md }} />
          <KpiRow items={[
            { label: "Fill Rate", value: pct(data.kpis.fillRate), accentColor: (data.kpis.fillRate ?? 0) >= 95 ? BRAND.green : BRAND.yellow },
            { label: "Picking Accuracy", value: pct(data.kpis.pa), accentColor: (data.kpis.pa ?? 0) >= 99 ? BRAND.green : BRAND.yellow },
            { label: "On-Time Dispatch", value: pct(data.kpis.otd), accentColor: (data.kpis.otd ?? 0) >= 95 ? BRAND.green : BRAND.yellow },
            { label: "CD Shrink Rate", value: pct(data.kpis.shrinkRate, 2), accentColor: (data.kpis.shrinkRate ?? 1) <= 0.3 ? BRAND.green : BRAND.yellow },
          ]} />
        </SmartSection>
      </FlowPage>

      {/* Page 2: Shrink + Fill Rate */}
      <FlowPage moduleName="CD">
        <SmartSection title="Breakdown de Perdas" subtitle="Shrink por origem (§6.2)" number="03">
          {data.shrinkByOrigin.length > 0 ? (
            <DataTable
              columns={[
                { key: "origin", label: "Origem", width: "35%" },
                { key: "value", label: "Valor (R$)", width: "30%", align: "right" },
                { key: "pct", label: "% do Total", width: "35%", align: "right" },
              ]}
              rows={data.shrinkByOrigin.map(s => ({
                origin: s.origin,
                value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(s.value),
                pct: `${s.percentage.toFixed(1)}%`,
              }))}
            />
          ) : (
            <CalloutBox type="success" title="Sem Perdas" text="Nenhuma perda registrada no período." />
          )}
        </SmartSection>

        <SmartSection title="Fill Rate por Loja" subtitle="Taxa de atendimento completo (§4.11)" number="04">
          {data.fillRateByStore.length > 0 ? (
            <HorizontalBarChart
              items={data.fillRateByStore.map(f => ({
                label: f.store,
                value: f.fillRate,
                maxValue: 100,
                color: f.fillRate >= 95 ? BRAND.green : (f.fillRate >= 90 ? BRAND.yellow : BRAND.danger),
              }))}
            />
          ) : (
            <CalloutBox type="info" title="Sem Dados" text="Nenhuma ordem de transferência encontrada." />
          )}
        </SmartSection>
      </FlowPage>

      {/* Page 3: Alerts + Rupture */}
      <FlowPage moduleName="CD">
        <SmartSection title="Alertas Ativos" subtitle="Ocorrências que demandam ação" number="05">
          {data.activeAlerts.length > 0 ? (
            <DataTable
              columns={[
                { key: "title", label: "Alerta", width: "55%" },
                { key: "level", label: "Nível", width: "20%", align: "center" },
                { key: "category", label: "Categoria", width: "25%", align: "center" },
              ]}
              rows={data.activeAlerts.map(a => ({
                title: a.title,
                level: a.level === "critical" ? "Crítico" : (a.level === "warning" ? "Atenção" : "Info"),
                category: a.category,
              }))}
            />
          ) : (
            <CalloutBox type="success" title="Tudo Operacional" text="Nenhum alerta ativo no momento." />
          )}
        </SmartSection>

        <SmartSection title="Projeções de Ruptura" subtitle="SKUs com risco de falta (§4)" number="06">
          {data.ruptureProjections.length > 0 ? (
            <DataTable
              columns={[
                { key: "sku", label: "SKU", width: "35%" },
                { key: "store", label: "Loja", width: "25%" },
                { key: "days", label: "Dias p/ Ruptura", width: "20%", align: "center" },
                { key: "stock", label: "Estoque", width: "20%", align: "right" },
              ]}
              rows={data.ruptureProjections.map(r => ({
                sku: r.sku,
                store: r.store,
                days: String(r.daysUntilRupture),
                stock: String(r.currentStock),
              }))}
            />
          ) : (
            <CalloutBox type="success" title="Sem Risco" text="Nenhuma projeção de ruptura identificada." />
          )}
        </SmartSection>
      </FlowPage>
    </Document>
  );
}
