import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection, CategoryBarChart, WaterfallChart } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { CategoryDetailsDrawer } from "@/components/dominio/DetailsDrawer";
import { useGlobalFilters, useSalesByCategory, usePendencias } from "@/hooks/useDominioData";
import { formatCurrency, formatPercent, SALES_BY_CATEGORY } from "@/data/dominio/mock-data";
import type { KPICardData, SalesByCategory, EvolutionDriver } from "@/data/dominio/types";

export default function VendasPorCategoria() {
  const location = useLocation();
  const initialCategory = (location.state as { category?: string })?.category || "all";
  const { filters, updateFilter } = useGlobalFilters({ category: initialCategory });
  const categories = useSalesByCategory(filters);
  const allCategories = SALES_BY_CATEGORY;
  const { addPendencia } = usePendencias();
  const [drawerCategory, setDrawerCategory] = useState<SalesByCategory | null>(null);

  // Pre-select category from navigation state
  useEffect(() => {
    if (initialCategory !== "all") {
      updateFilter("category", initialCategory);
    }
  }, []);

  const sorted = [...allCategories].sort((a, b) => b.growth_pct - a.growth_pct);
  const topAltas = sorted.slice(0, 5).map(c => c.name).join(", ");
  const topQuedas = sorted.slice(-5).reverse().map(c => c.name).join(", ");
  const shareTop3 = allCategories.sort((a, b) => b.sales - a.sales).slice(0, 3).reduce((s, c) => s + c.share_pct, 0);
  const positiveGrowth = allCategories.filter(c => c.growth_pct > 0).length;

  const kpiItems: KPICardData[] = [
    { label: "Top 5 Altas", value: topAltas, formatted_value: topAltas },
    { label: "Top 5 Quedas", value: topQuedas, formatted_value: topQuedas },
    { label: "Share Top 3", value: shareTop3, formatted_value: formatPercent(shareTop3) },
    { label: "Crescimento Positivo", value: positiveGrowth, formatted_value: `${positiveGrowth} categorias`, variation_pct: (positiveGrowth / allCategories.length) * 100, variation_type: "positive" },
  ];

  const waterfallData: EvolutionDriver[] = allCategories.map(c => ({
    name: c.name,
    type: "category" as const,
    current: c.sales,
    previous: c.sales_prev,
    delta: c.sales - c.sales_prev,
    contribution_pct: ((c.sales - c.sales_prev) / c.sales_prev) * 100,
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const columns: ColumnDef<SalesByCategory>[] = [
    { key: "name", label: "Categoria" },
    { key: "sales", label: "Venda", render: (r) => formatCurrency(r.sales), getValue: (r) => r.sales },
    { key: "growth_pct", label: "Crescimento %", render: (r) => <span className={r.growth_pct >= 0 ? "text-green-500" : "text-red-500"}>{r.growth_pct > 0 ? "+" : ""}{r.growth_pct.toFixed(1)}%</span>, getValue: (r) => r.growth_pct },
    { key: "margin_pct", label: "Margem %", render: (r) => formatPercent(r.margin_pct), getValue: (r) => r.margin_pct },
    { key: "share_pct", label: "Participação %", render: (r) => formatPercent(r.share_pct), getValue: (r) => r.share_pct },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} showCategory />

      <KPIGrid items={kpiItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSection title="Vendas por Categoria" subtitle="Volume de vendas por categoria">
          <CategoryBarChart data={categories} />
        </ChartSection>

        <ChartSection title="Waterfall de Contribuição" subtitle="Delta vs período anterior">
          <WaterfallChart data={waterfallData} />
        </ChartSection>
      </div>

      <DataTablePro
        data={categories}
        columns={columns}
        onRowClick={(row) => setDrawerCategory(row)}
        actions={[
          { label: "Ver detalhe", onClick: (row) => setDrawerCategory(row) },
        ]}
      />

      <CategoryDetailsDrawer
        open={!!drawerCategory}
        onOpenChange={(open) => !open && setDrawerCategory(null)}
        category={drawerCategory}
        onCreatePendencia={addPendencia}
      />
    </div>
  );
}
