import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection, UnitRankingChart, UnitComparisonChart } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { UnitDetailsDrawer } from "@/components/dominio/DetailsDrawer";
import { useGlobalFilters, useSalesByUnit, useUnitsSummary, usePendencias } from "@/hooks/useDominioData";
import { formatCurrency, formatPercent } from "@/data/dominio/mock-data";
import type { KPICardData, SalesByUnit } from "@/data/dominio/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function VendasPorUnidade() {
  const { filters, updateFilter } = useGlobalFilters();
  const salesByUnit = useSalesByUnit(filters);
  const units = useUnitsSummary(filters);
  const { addPendencia } = usePendencias();
  const [drawerUnit, setDrawerUnit] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const bestSales = [...salesByUnit].sort((a, b) => b.sales - a.sales)[0];
  const bestTicket = [...salesByUnit].sort((a, b) => b.ticket - a.ticket)[0];
  const bestGrowth = [...salesByUnit].sort((a, b) => b.growth_pct - a.growth_pct)[0];
  const bestShare = [...salesByUnit].sort((a, b) => b.share_pct - a.share_pct)[0];

  const kpiItems: KPICardData[] = [
    { label: "Melhor Venda", value: bestSales?.sales || 0, formatted_value: formatCurrency(bestSales?.sales || 0), impact_label: bestSales?.unit_name },
    { label: "Melhor Ticket", value: bestTicket?.ticket || 0, formatted_value: `R$ ${bestTicket?.ticket || 0}`, impact_label: bestTicket?.unit_name },
    { label: "Maior Crescimento", value: bestGrowth?.growth_pct || 0, formatted_value: `+${bestGrowth?.growth_pct.toFixed(1)}%`, variation_pct: bestGrowth?.growth_pct, variation_type: "positive", impact_label: bestGrowth?.unit_name },
    { label: "Maior Share", value: bestShare?.share_pct || 0, formatted_value: `${bestShare?.share_pct.toFixed(1)}%`, impact_label: bestShare?.unit_name },
  ];

  const columns: ColumnDef<SalesByUnit>[] = [
    { key: "unit_name", label: "Unidade" },
    { key: "sales", label: "Venda", render: (r) => formatCurrency(r.sales), getValue: (r) => r.sales },
    { key: "cupons", label: "Cupons", render: (r) => r.cupons.toLocaleString(), getValue: (r) => r.cupons },
    { key: "ticket", label: "Ticket", render: (r) => `R$ ${r.ticket}`, getValue: (r) => r.ticket },
    { key: "growth_pct", label: "Crescimento %", render: (r) => <span className={r.growth_pct >= 0 ? "text-green-500" : "text-red-500"}>{r.growth_pct > 0 ? "+" : ""}{r.growth_pct.toFixed(1)}%</span>, getValue: (r) => r.growth_pct },
    { key: "share_pct", label: "Share %", render: (r) => formatPercent(r.share_pct), getValue: (r) => r.share_pct },
  ];

  const selectedUnit = units.find(u => u.id === drawerUnit) || null;
  const compareData = salesByUnit.filter(u => compareIds.includes(u.unit_id));

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} />

      {/* Compare mode selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Comparar unidades:</span>
        {salesByUnit.map(u => (
          <Badge
            key={u.unit_id}
            variant={compareIds.includes(u.unit_id) ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => {
              setCompareIds(prev =>
                prev.includes(u.unit_id)
                  ? prev.filter(id => id !== u.unit_id)
                  : prev.length < 4 ? [...prev, u.unit_id] : prev
              );
            }}
          >
            {u.unit_name}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSection title="Ranking de Unidades" subtitle="Por volume de vendas">
          <UnitRankingChart data={units} />
        </ChartSection>

        {compareData.length >= 2 ? (
          <ChartSection title="Comparação de Unidades" subtitle={`${compareData.length} unidades selecionadas`}>
            <UnitComparisonChart data={compareData} />
          </ChartSection>
        ) : (
          <ChartSection title="Comparação de Unidades" subtitle="Selecione 2–4 unidades acima">
            <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
              Selecione ao menos 2 unidades para comparar
            </div>
          </ChartSection>
        )}
      </div>

      <DataTablePro
        data={salesByUnit}
        columns={columns}
        actions={[
          { label: "Ver detalhe", onClick: (row) => setDrawerUnit(row.unit_id) },
        ]}
      />

      <UnitDetailsDrawer
        open={!!drawerUnit}
        onOpenChange={(open) => !open && setDrawerUnit(null)}
        unit={selectedUnit}
        onCreatePendencia={addPendencia}
      />
    </div>
  );
}
