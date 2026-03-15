import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { DataTablePro, type ColumnDef } from "@/components/dominio/DataTablePro";
import { ChartSection, TrendChart, UnitRankingChart, CategoryMixChart } from "@/components/dominio/ChartSection";
import { UnitDetailsDrawer } from "@/components/dominio/DetailsDrawer";
import { useGlobalFilters, useUnitsSummary, useConsolidatedKPIs, useCategories, useTrendData, usePendencias } from "@/hooks/useDominioData";
import { formatCurrency, formatPercent } from "@/data/dominio/mock-data";
import { Badge } from "@/components/ui/badge";
import type { UnitSummary, KPICardData } from "@/data/dominio/types";

export default function DashboardExecutivo() {
  const { filters, updateFilter } = useGlobalFilters();
  const units = useUnitsSummary(filters);
  const kpis = useConsolidatedKPIs();
  const categories = useCategories();
  const trendData = useTrendData();
  const { addPendencia } = usePendencias();

  const [selectedUnit, setSelectedUnit] = useState<UnitSummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const kpiRow1: KPICardData[] = [
    { label: "Faturamento", value: kpis.totalSales, formatted_value: formatCurrency(kpis.totalSales), variation_pct: 3.3, variation_type: "positive", trend: [11.2, 11.5, 11.8, 12.0, 12.2, 12.4] },
    { label: "Margem R$", value: kpis.totalMargin, formatted_value: formatCurrency(kpis.totalMargin), variation_pct: 2.1, variation_type: "positive", trend: [2.65, 2.72, 2.80, 2.85, 2.90, 2.95] },
    { label: "Margem %", value: kpis.avgMarginPct, formatted_value: formatPercent(kpis.avgMarginPct), variation_pct: -0.3, variation_type: "negative" },
    { label: "Ticket Médio", value: kpis.avgTicket, formatted_value: `R$ ${kpis.avgTicket.toFixed(0)}`, variation_pct: 1.8, variation_type: "positive" },
    { label: "Ruptura", value: kpis.totalRupture, formatted_value: `${kpis.totalRupture} itens`, variation_pct: 12.5, variation_type: "negative", impact_label: "críticos" },
    { label: "Perdas", value: kpis.totalLosses, formatted_value: formatCurrency(kpis.totalLosses), variation_pct: 8.2, variation_type: "negative" },
  ];

  const kpiRow2: KPICardData[] = [
    { label: "Melhor Unidade", value: kpis.bestUnit.name, formatted_value: kpis.bestUnit.name, impact_label: formatCurrency(kpis.bestUnit.sales) },
    { label: "Pior Unidade", value: kpis.worstUnit.name, formatted_value: kpis.worstUnit.name, impact_label: formatCurrency(kpis.worstUnit.sales) },
    { label: "Alertas Ativos", value: kpis.totalAlerts, formatted_value: String(kpis.totalAlerts), variation_pct: 15, variation_type: "negative" },
    { label: "Pendências", value: kpis.totalPendencias, formatted_value: String(kpis.totalPendencias), variation_type: "neutral" },
  ];

  const columns: ColumnDef<UnitSummary>[] = [
    { key: "name", label: "Unidade", getValue: r => r.name },
    { key: "sales", label: "Venda", render: r => formatCurrency(r.sales), getValue: r => r.sales },
    { key: "margin_pct", label: "Margem%", render: r => formatPercent(r.margin_pct), getValue: r => r.margin_pct },
    { key: "avg_ticket", label: "Ticket", render: r => `R$ ${r.avg_ticket}`, getValue: r => r.avg_ticket },
    { key: "rupture_count", label: "Ruptura", getValue: r => r.rupture_count },
    { key: "losses_value", label: "Perdas", render: r => formatCurrency(r.losses_value), getValue: r => r.losses_value },
    { key: "alerts_count", label: "Alertas", render: r => r.alerts_count > 0 ? <Badge variant={r.alerts_count > 3 ? "destructive" : "secondary"} className="text-[10px]">{r.alerts_count}</Badge> : <span className="text-muted-foreground">0</span>, getValue: r => r.alerts_count },
  ];

  return (
    <div className="space-y-4">
      <BlurFade delay={0}>
        <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} showCategory />
      </BlurFade>

      <BlurFade delay={0.05}>
        <KPIGrid items={kpiRow1} columns={6} />
      </BlurFade>

      <BlurFade delay={0.1}>
        <KPIGrid items={kpiRow2} columns={4} />
      </BlurFade>

      <BlurFade delay={0.15}>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ChartSection title="Tendência Venda / Margem" subtitle="Últimos 6 meses">
              <TrendChart data={trendData} showComparison={filters.comparison !== "none"} />
            </ChartSection>
          </div>
          <ChartSection title="Ranking de Unidades" subtitle="Por faturamento">
            <UnitRankingChart data={units} />
          </ChartSection>
        </div>
      </BlurFade>

      <BlurFade delay={0.2}>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ChartSection title="Resumo por Unidade">
              <DataTablePro<any>
                data={units}
                columns={columns as any}
                actions={[
                  { label: "Detalhe", onClick: (row: any) => { setSelectedUnit(row as UnitSummary); setDrawerOpen(true); } },
                ]}
                onRowClick={(row: any) => { setSelectedUnit(row as UnitSummary); setDrawerOpen(true); }}
              />
            </ChartSection>
          </div>
          <ChartSection title="Mix por Categoria" subtitle="Participação no faturamento">
            <CategoryMixChart data={categories} />
          </ChartSection>
        </div>
      </BlurFade>

      <UnitDetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        unit={selectedUnit}
        onCreatePendencia={addPendencia}
      />
    </div>
  );
}
