import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection, SalesByDayChart, SalesByHourChart, CategoryBarChart } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { useGlobalFilters, useSalesByDay, useSalesByHour, useSalesByCategory, usePendencias } from "@/hooks/useDominioData";
import { getSalesKPIs, formatCurrency, formatPercent } from "@/data/dominio/mock-data";
import type { KPICardData, SalesByCategory } from "@/data/dominio/types";

export default function VendasVisaoGeral() {
  const { filters, updateFilter } = useGlobalFilters();
  const navigate = useNavigate();
  const salesByDay = useSalesByDay(filters);
  const salesByHour = useSalesByHour();
  const categories = useSalesByCategory(filters);
  const { addPendencia } = usePendencias();
  const kpis = getSalesKPIs();
  const [showComparison, setShowComparison] = useState(filters.comparison !== "none");

  const isIntraday = filters.period === "today" || filters.period === "realtime";

  const kpiItems: KPICardData[] = [
    { label: "Venda Total", value: kpis.totalSales, formatted_value: formatCurrency(kpis.totalSales), variation_pct: kpis.growthPrev, variation_type: kpis.growthPrev >= 0 ? "positive" : "negative" },
    { label: "Cupons", value: kpis.totalCupons, formatted_value: `${(kpis.totalCupons / 1000).toFixed(1)}k`, variation_pct: 3.2, variation_type: "positive" },
    { label: "Ticket Médio", value: kpis.avgTicket, formatted_value: `R$ ${kpis.avgTicket}`, variation_pct: 1.8, variation_type: "positive" },
    { label: "Crescimento vs Anterior", value: kpis.growthPrev, formatted_value: `${kpis.growthPrev > 0 ? "+" : ""}${kpis.growthPrev.toFixed(1)}%`, variation_pct: kpis.growthPrev, variation_type: kpis.growthPrev >= 0 ? "positive" : "negative" },
    { label: "Crescimento vs AA", value: 7.2, formatted_value: "+7.2%", variation_pct: 7.2, variation_type: "positive" },
  ];

  const catColumns: ColumnDef<SalesByCategory>[] = [
    { key: "name", label: "Categoria" },
    { key: "sales", label: "Venda", render: (r) => formatCurrency(r.sales), getValue: (r) => r.sales },
    { key: "share_pct", label: "Participação %", render: (r) => formatPercent(r.share_pct), getValue: (r) => r.share_pct },
    { key: "growth_pct", label: "Crescimento %", render: (r) => <span className={r.growth_pct >= 0 ? "text-green-500" : "text-red-500"}>{r.growth_pct > 0 ? "+" : ""}{r.growth_pct.toFixed(1)}%</span>, getValue: (r) => r.growth_pct },
    { key: "margin_pct", label: "Margem %", render: (r) => formatPercent(r.margin_pct), getValue: (r) => r.margin_pct },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} showCategory />

      <KPIGrid items={kpiItems} columns={5} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSection title="Venda por Dia" subtitle={showComparison ? "Atual vs Anterior" : "Período atual"}>
          <div className="flex justify-end mb-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={showComparison} onChange={e => setShowComparison(e.target.checked)} className="rounded" />
              Comparar
            </label>
          </div>
          <SalesByDayChart data={salesByDay} showComparison={showComparison} />
        </ChartSection>

        {isIntraday ? (
          <ChartSection title="Venda por Hora" subtitle="Distribuição horária">
            <SalesByHourChart data={salesByHour} />
          </ChartSection>
        ) : (
          <ChartSection title="Top 10 Categorias" subtitle="Por volume de vendas">
            <CategoryBarChart data={categories} />
          </ChartSection>
        )}
      </div>

      {!isIntraday && (
        <ChartSection title="Top 10 Categorias" subtitle="Por volume de vendas">
          <CategoryBarChart data={categories} />
        </ChartSection>
      )}

      <DataTablePro
        data={categories}
        columns={catColumns}
        onRowClick={(row) => navigate("/app/dominio/vendas/por-categoria", { state: { category: row.name } })}
        actions={[
          { label: "Ver detalhes", onClick: (row) => navigate("/app/dominio/vendas/por-categoria", { state: { category: row.name } }) },
        ]}
      />
    </div>
  );
}
