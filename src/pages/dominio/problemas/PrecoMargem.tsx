import { useState, useMemo } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { SeverityBadge } from "@/components/dominio/SeverityBadge";
import { LinkToContext } from "@/components/dominio/LinkToContext";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { PRICE_MARGIN_DATA, getPriceMarginKPIs, type PriceMarginItem } from "@/data/dominio/problemas-mock";
import { formatCurrency, formatPercent } from "@/data/dominio/mock-data";
import type { KPICardData } from "@/data/dominio/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Lightbulb } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const COLORS = ["hsl(350, 70%, 55%)", "hsl(270, 60%, 55%)", "hsl(200, 70%, 55%)", "hsl(150, 60%, 45%)", "hsl(40, 80%, 55%)", "hsl(20, 70%, 55%)"];

export default function ProblemasPrecoMargem() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerItem, setDrawerItem] = useState<PriceMarginItem | null>(null);
  const [marginFilter, setMarginFilter] = useState("");
  const [dropFilter, setDropFilter] = useState("");

  const data = useMemo(() => {
    let items = [...PRICE_MARGIN_DATA];
    if (filters.unit_id !== "all" && typeof filters.unit_id === "string") items = items.filter((p) => p.unit_id === filters.unit_id);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter((p) => p.sku.toLowerCase().includes(s) || p.category.toLowerCase().includes(s));
    }
    if (marginFilter) items = items.filter((p) => p.margin_pct < Number(marginFilter));
    if (dropFilter) items = items.filter((p) => p.variation_pp < -Number(dropFilter));
    return items;
  }, [filters.unit_id, filters.search, marginFilter, dropFilter]);

  const kpis = getPriceMarginKPIs();

  const kpiItems: KPICardData[] = [
    { label: "SKUs Abaixo do Mínimo", value: kpis.belowMinimum, formatted_value: String(kpis.belowMinimum), variation_type: "negative" },
    { label: "Variação Média (pp)", value: kpis.avgVariation, formatted_value: `${kpis.avgVariation > 0 ? "+" : ""}${kpis.avgVariation.toFixed(1)}pp`, variation_type: kpis.avgVariation >= 0 ? "positive" : "negative" },
    { label: "Impacto Negativo", value: kpis.negativeImpact, formatted_value: formatCurrency(kpis.negativeImpact), variation_type: "negative" },
    { label: "Max Variância entre Unidades", value: kpis.maxVariance, formatted_value: `${kpis.maxVariance.toFixed(1)}pp`, variation_type: kpis.maxVariance > 5 ? "negative" : "neutral" },
  ];

  const scatterData = data.map((p) => ({ name: p.sku, price: p.price, margin: p.margin_pct, below: p.below_minimum }));
  const impactData = [...data].filter((p) => p.variation_pp < 0).sort((a, b) => a.variation_pp - b.variation_pp).slice(0, 8).map((p) => ({ name: p.sku.length > 15 ? p.sku.slice(0, 15) + "…" : p.sku, variation: p.variation_pp }));

  const columns: ColumnDef<PriceMarginItem>[] = [
    { key: "select", label: "", sortable: false, filterable: false, render: (r) => <Checkbox checked={selected.has(r.id)} onCheckedChange={(c) => setSelected((prev) => { const n = new Set(prev); c ? n.add(r.id) : n.delete(r.id); return n; })} /> },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Categoria" },
    { key: "price", label: "Preço", render: (r) => `R$ ${r.price.toFixed(2)}`, getValue: (r) => r.price },
    { key: "cost", label: "Custo", render: (r) => `R$ ${r.cost.toFixed(2)}`, getValue: (r) => r.cost },
    { key: "margin_pct", label: "Margem %", render: (r) => <span className={r.below_minimum ? "text-red-500 font-semibold" : ""}>{formatPercent(r.margin_pct)}</span>, getValue: (r) => r.margin_pct },
    { key: "margin_value", label: "Margem R$", render: (r) => `R$ ${r.margin_value.toFixed(2)}`, getValue: (r) => r.margin_value },
    { key: "variation_pp", label: "Variação (pp)", render: (r) => <span className={r.variation_pp < 0 ? "text-red-500" : "text-green-500"}>{r.variation_pp > 0 ? "+" : ""}{r.variation_pp.toFixed(1)}pp</span>, getValue: (r) => r.variation_pp },
    { key: "unit_name", label: "Unidade" },
  ];

  const handleSuggest = (item: PriceMarginItem) => {
    const suggestedPrice = (item.cost / (1 - 0.25)).toFixed(2);
    toast({
      title: "Sugestão de Ajuste",
      description: `Para ${item.sku}: aumentar preço para R$ ${suggestedPrice} (margem-alvo 25%). Margem atual: ${item.margin_pct.toFixed(1)}%`,
      duration: 8000,
    });
  };

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} showCategory />

      {/* Extra filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Label className="text-xs text-muted-foreground">Margem &lt;</Label>
          <Input value={marginFilter} onChange={(e) => setMarginFilter(e.target.value)} className="h-7 w-16 text-xs" placeholder="%" type="number" />
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-xs text-muted-foreground">Queda &gt;</Label>
          <Input value={dropFilter} onChange={(e) => setDropFilter(e.target.value)} className="h-7 w-16 text-xs" placeholder="pp" type="number" />
        </div>
      </div>

      <KPIGrid items={kpiItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSection title="Preço x Margem" subtitle="Dispersão por SKU">
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" dataKey="price" name="Preço" unit=" R$" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="number" dataKey="margin" name="Margem" unit="%" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <ReferenceLine y={20} stroke="hsl(350, 70%, 55%)" strokeDasharray="4 4" label={{ value: "Min 20%", fontSize: 10 }} />
              <Scatter data={scatterData}>
                {scatterData.map((d, i) => <Cell key={i} fill={d.below ? "hsl(350, 70%, 55%)" : "hsl(150, 60%, 45%)"} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Ranking de Impacto" subtitle="Maiores quedas de margem (pp)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={impactData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}pp`} />
              <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" />
              <Bar dataKey="variation" fill="hsl(350, 70%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 text-xs" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3 w-3 mr-1" /> Revisar preço ({selected.size} SKUs)
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelected(new Set())}>Limpar</Button>
        </div>
      )}

      <DataTablePro
        data={data}
        columns={columns}
        onRowClick={(r) => setDrawerItem(r)}
        actions={[
          { label: "Sugerir", onClick: (r) => handleSuggest(r) },
          { label: "Pendência", onClick: (r) => { setSelected(new Set([r.id])); setCreateOpen(true); } },
        ]}
      />

      {/* Drawer */}
      <Sheet open={!!drawerItem} onOpenChange={(open) => !open && setDrawerItem(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {drawerItem && (
            <>
              <SheetHeader>
                <SheetTitle>{drawerItem.sku}</SheetTitle>
                <SheetDescription>{drawerItem.category} • {drawerItem.unit_name}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <MiniKPI label="Preço" value={`R$ ${drawerItem.price.toFixed(2)}`} />
                  <MiniKPI label="Custo" value={`R$ ${drawerItem.cost.toFixed(2)}`} />
                  <MiniKPI label="Margem %" value={formatPercent(drawerItem.margin_pct)} />
                  <MiniKPI label="Variação" value={`${drawerItem.variation_pp > 0 ? "+" : ""}${drawerItem.variation_pp.toFixed(1)}pp`} />
                </div>
                {drawerItem.below_minimum && (
                  <Badge variant="destructive" className="text-xs">Abaixo do mínimo</Badge>
                )}
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Histórico (mock)</p>
                  <p>• Jan/26: margem {(drawerItem.margin_pct + 2).toFixed(1)}% → Fev/26: {drawerItem.margin_pct.toFixed(1)}%</p>
                  <p>• Preço estável, custo subiu 3.2% no período</p>
                </div>
                <div className="space-y-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => handleSuggest(drawerItem)}>
                    <Lightbulb className="h-3 w-3 mr-1" /> Sugerir ajuste
                  </Button>
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => { setDrawerItem(null); setSelected(new Set([drawerItem.id])); setCreateOpen(true); }}>
                    <Plus className="h-3 w-3 mr-1" /> Criar pendência
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CreatePendenciaModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={addPendencia}
        defaults={{
          title: `Revisar preço - ${data.filter((d) => selected.has(d.id)).map((d) => d.sku).join(", ").slice(0, 60)}`,
          description: data.filter((d) => selected.has(d.id)).map((d) => `${d.sku}: margem ${d.margin_pct.toFixed(1)}%`).join("; "),
          priority: "high",
        }}
      />
    </div>
  );
}

function MiniKPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-secondary/30">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
