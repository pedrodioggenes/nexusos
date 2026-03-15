import { useState, useMemo } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { LOSSES_DATA, getLossesKPIs, type LossItem } from "@/data/dominio/problemas-mock";
import { formatCurrency, formatPercent } from "@/data/dominio/mock-data";
import type { KPICardData } from "@/data/dominio/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const currFmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
const COLORS = ["hsl(350, 70%, 55%)", "hsl(20, 70%, 55%)", "hsl(40, 80%, 55%)", "hsl(270, 60%, 55%)", "hsl(200, 70%, 55%)", "hsl(150, 60%, 45%)"];

export default function ProblemasPerdas() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const data = useMemo(() => {
    let items = [...LOSSES_DATA];
    if (filters.unit_id !== "all" && typeof filters.unit_id === "string") items = items.filter((l) => l.unit_id === filters.unit_id);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter((l) => l.sku.toLowerCase().includes(s) || l.category.toLowerCase().includes(s));
    }
    return items;
  }, [filters.unit_id, filters.search]);

  const kpis = getLossesKPIs();

  const kpiItems: KPICardData[] = [
    { label: "Perdas Totais", value: kpis.totalLosses, formatted_value: formatCurrency(kpis.totalLosses), variation_type: "negative" },
    { label: "Perdas % Venda", value: kpis.lossesPctSales, formatted_value: `${kpis.lossesPctSales.toFixed(2)}%`, variation_type: "negative" },
    { label: "Top Unidade", value: 0, formatted_value: kpis.topUnit?.[0] || "-", impact_label: formatCurrency(kpis.topUnit?.[1] || 0) },
    { label: "Top Categoria", value: 0, formatted_value: kpis.topCat?.[0] || "-", impact_label: formatCurrency(kpis.topCat?.[1] || 0) },
  ];

  const byUnitChart = kpis.byUnit.sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  const byCatChart = kpis.byCat.sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

  const columns: ColumnDef<LossItem>[] = [
    {
      key: "select", label: "", sortable: false, filterable: false,
      render: (r) => (
        <Checkbox
          checked={selected.has(r.id)}
          onCheckedChange={(checked) => {
            setSelected((prev) => {
              const next = new Set(prev);
              checked ? next.add(r.id) : next.delete(r.id);
              return next;
            });
          }}
        />
      ),
    },
    { key: "category", label: "Categoria" },
    { key: "sku", label: "SKU" },
    { key: "losses_value", label: "Perdas R$", render: (r) => formatCurrency(r.losses_value), getValue: (r) => r.losses_value },
    { key: "reason", label: "Motivo" },
    { key: "unit_name", label: "Unidade" },
    { key: "recurrence", label: "Recorrência" },
  ];

  const handleBatchCreate = () => {
    if (selected.size === 0) { toast({ title: "Selecione ao menos uma linha", variant: "destructive" }); return; }
    const items = data.filter((d) => selected.has(d.id));
    const desc = items.map((i) => `${i.sku} (${formatCurrency(i.losses_value)})`).join(", ");
    setCreateOpen(true);
  };

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSection title="Perdas por Unidade" subtitle="Ranking">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byUnitChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tickFormatter={currFmt} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => `R$ ${currFmt(v)}`} />
              <Bar dataKey="value" fill="hsl(350, 70%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Perdas por Categoria" subtitle="Distribuição">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCatChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={currFmt} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => `R$ ${currFmt(v)}`} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {byCatChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 text-xs" onClick={handleBatchCreate}>
            <Plus className="h-3 w-3 mr-1" /> Criar pendência em lote ({selected.size})
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelected(new Set())}>Limpar seleção</Button>
        </div>
      )}

      <DataTablePro data={data} columns={columns} />

      <CreatePendenciaModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={addPendencia}
        defaults={{
          title: `Investigar perdas (${selected.size} itens)`,
          description: data.filter((d) => selected.has(d.id)).map((i) => i.sku).join(", "),
          priority: "high",
        }}
      />
    </div>
  );
}
