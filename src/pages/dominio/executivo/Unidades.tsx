import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { DataTablePro, type ColumnDef } from "@/components/dominio/DataTablePro";
import { ChartSection, SalesMarginScatter, LossesRankingChart } from "@/components/dominio/ChartSection";
import { UnitDetailsDrawer } from "@/components/dominio/DetailsDrawer";
import { useGlobalFilters, useUnitsSummary, usePendencias } from "@/hooks/useDominioData";
import { formatCurrency, formatPercent } from "@/data/dominio/mock-data";
import type { UnitSummary, KPICardData } from "@/data/dominio/types";

export default function UnidadesResumo() {
  const { filters, updateFilter } = useGlobalFilters();
  const units = useUnitsSummary(filters);
  const { addPendencia } = usePendencias();
  const [selectedUnit, setSelectedUnit] = useState<UnitSummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sortedBySales = [...units].sort((a, b) => b.sales - a.sales);
  const sortedByMargin = [...units].sort((a, b) => b.margin_pct - a.margin_pct);
  const sortedByLosses = [...units].sort((a, b) => b.losses_value - a.losses_value);
  const sortedByRupture = [...units].sort((a, b) => b.rupture_count - a.rupture_count);

  const kpis: KPICardData[] = [
    { label: "🏆 Líder Vendas", value: sortedBySales[0]?.name ?? "", formatted_value: sortedBySales[0]?.name ?? "--", impact_label: formatCurrency(sortedBySales[0]?.sales ?? 0) },
    { label: "📈 Melhor Margem", value: sortedByMargin[0]?.name ?? "", formatted_value: sortedByMargin[0]?.name ?? "--", impact_label: formatPercent(sortedByMargin[0]?.margin_pct ?? 0) },
    { label: "⚠️ Maior Perda", value: sortedByLosses[0]?.name ?? "", formatted_value: sortedByLosses[0]?.name ?? "--", impact_label: formatCurrency(sortedByLosses[0]?.losses_value ?? 0) },
    { label: "🔴 Maior Ruptura", value: sortedByRupture[0]?.name ?? "", formatted_value: sortedByRupture[0]?.name ?? "--", impact_label: `${sortedByRupture[0]?.rupture_count ?? 0} itens` },
  ];

  const columns: ColumnDef<UnitSummary>[] = [
    { key: "name", label: "Unidade", getValue: r => r.name },
    { key: "sales", label: "Venda", render: r => formatCurrency(r.sales), getValue: r => r.sales },
    { key: "margin_pct", label: "Margem%", render: r => formatPercent(r.margin_pct), getValue: r => r.margin_pct },
    { key: "avg_ticket", label: "Ticket", render: r => `R$ ${r.avg_ticket}`, getValue: r => r.avg_ticket },
    { key: "rupture_count", label: "Ruptura", getValue: r => r.rupture_count },
    { key: "losses_value", label: "Perdas", render: r => formatCurrency(r.losses_value), getValue: r => r.losses_value },
  ];

  return (
    <div className="space-y-4">
      <BlurFade delay={0}>
        <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      </BlurFade>

      <BlurFade delay={0.05}>
        <KPIGrid items={kpis} columns={4} />
      </BlurFade>

      <BlurFade delay={0.1}>
        <div className="grid md:grid-cols-2 gap-4">
          <ChartSection title="Venda x Margem" subtitle="Bolha = volume de perdas">
            <SalesMarginScatter data={units} />
          </ChartSection>
          <ChartSection title="Ranking de Perdas" subtitle="Por unidade">
            <LossesRankingChart data={units} />
          </ChartSection>
        </div>
      </BlurFade>

      <BlurFade delay={0.15}>
        <ChartSection title="Todas as Unidades">
          <DataTablePro<any>
            data={units}
            columns={columns as any}
            actions={[
              { label: "Detalhe", onClick: (row: any) => { setSelectedUnit(row as UnitSummary); setDrawerOpen(true); } },
            ]}
            onRowClick={(row: any) => { setSelectedUnit(row as UnitSummary); setDrawerOpen(true); }}
          />
        </ChartSection>
      </BlurFade>

      <UnitDetailsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} unit={selectedUnit} onCreatePendencia={addPendencia} />
    </div>
  );
}
