import { useState, useMemo } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { STOCK_DIFFS, getStockDiffKPIs, type StockDiffItem } from "@/data/dominio/problemas-mock";
import { formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData } from "@/data/dominio/types";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function ProblemasEstoque() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState<Set<string>>(new Set(STOCK_DIFFS.filter((d) => d.validated).map((d) => d.id)));

  const data = useMemo(() => {
    let items = [...STOCK_DIFFS];
    if (filters.unit_id !== "all" && typeof filters.unit_id === "string") items = items.filter((d) => d.unit_id === filters.unit_id);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter((d) => d.sku.toLowerCase().includes(s) || d.category.toLowerCase().includes(s));
    }
    return items;
  }, [filters.unit_id, filters.search]);

  const kpis = getStockDiffKPIs();

  const kpiItems: KPICardData[] = [
    { label: "Total Ajustes (un)", value: kpis.totalAdjustments, formatted_value: String(kpis.totalAdjustments), variation_type: "negative" },
    { label: "Impacto Estimado", value: kpis.totalImpact, formatted_value: formatCurrency(kpis.totalImpact), variation_type: "negative" },
    { label: "SKU Maior Divergência", value: 0, formatted_value: kpis.topSku?.[0] || "-", impact_label: `${kpis.topSku?.[1]} un` },
    { label: "Unidade Mais Divergente", value: 0, formatted_value: kpis.topUnit?.[0] || "-", impact_label: `${kpis.topUnit?.[1]} un` },
  ];

  const columns: ColumnDef<StockDiffItem>[] = [
    { key: "sku", label: "SKU" },
    { key: "category", label: "Categoria" },
    { key: "unit_name", label: "Unidade" },
    { key: "stock_system", label: "Sistema", getValue: (r) => r.stock_system },
    { key: "stock_counted", label: "Contado", getValue: (r) => r.stock_counted },
    { key: "difference", label: "Diferença", render: (r) => <span className="text-red-500 font-semibold">{r.difference}</span>, getValue: (r) => Math.abs(r.difference) },
    { key: "impact_value", label: "Impacto R$", render: (r) => formatCurrency(r.impact_value), getValue: (r) => r.impact_value },
    { key: "status", label: "Status", sortable: false, filterable: false, render: (r) => validated.has(r.id) ? <Badge variant="secondary" className="text-[10px]">Validado</Badge> : <Badge variant="destructive" className="text-[10px]">Pendente</Badge> },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} />

      <DataTablePro
        data={data}
        columns={columns}
        actions={[
          {
            label: "Pendência",
            onClick: (r) => {
              setCreateDefaults({ title: `Checar divergência: ${r.sku}`, description: `Sistema: ${r.stock_system}, Contado: ${r.stock_counted}, Dif: ${r.difference}`, priority: "high" });
              setCreateOpen(true);
            },
          },
          {
            label: "Validar",
            onClick: (r) => {
              setValidated((prev) => new Set([...prev, r.id]));
              toast({ title: "Validado", description: `${r.sku} marcado como validado` });
            },
            show: (r) => !validated.has(r.id),
          },
        ]}
      />

      <CreatePendenciaModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={addPendencia}
        defaults={createDefaults}
      />
    </div>
  );
}
