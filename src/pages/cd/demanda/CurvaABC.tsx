import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCDSkus } from "@/hooks/cd/useDemandData";

const curveConfig: Record<string, { label: string; color: string; description: string }> = {
  A: { label: "A", color: "bg-primary/10 text-primary border-primary/20", description: "~80% do faturamento" },
  B: { label: "B", color: "bg-warning/10 text-warning border-warning/20", description: "~15% do faturamento" },
  C: { label: "C", color: "bg-muted text-muted-foreground border-border", description: "~5% do faturamento" },
};

export default function CurvaABCPage() {
  const { data: skus = [], isLoading } = useCDSkus();
  const [search, setSearch] = useState("");
  const [curveFilter, setCurveFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const cats = new Set(skus.map((s: any) => s.category).filter(Boolean));
    return Array.from(cats).sort() as string[];
  }, [skus]);

  const filtered = useMemo(() => {
    return skus
      .filter((s: any) => {
        const matchSearch = !search ||
          s.description?.toLowerCase().includes(search.toLowerCase()) ||
          s.sku_code?.toLowerCase().includes(search.toLowerCase());
        const matchCurve = curveFilter === "all" || s.abc_curve === curveFilter;
        const matchCategory = categoryFilter === "all" || s.category === categoryFilter;
        return matchSearch && matchCurve && matchCategory;
      })
      .sort((a: any, b: any) => {
        // Sort: A first, then B, then C, then null
        const order = { A: 0, B: 1, C: 2 };
        const aO = order[a.abc_curve as keyof typeof order] ?? 3;
        const bO = order[b.abc_curve as keyof typeof order] ?? 3;
        if (aO !== bO) return aO - bO;
        // Within same curve, sort by price desc
        return (b.avg_unit_price || 0) - (a.avg_unit_price || 0);
      });
  }, [skus, search, curveFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: skus.length,
    a: skus.filter((s: any) => s.abc_curve === "A").length,
    b: skus.filter((s: any) => s.abc_curve === "B").length,
    c: skus.filter((s: any) => s.abc_curve === "C").length,
    unclassified: skus.filter((s: any) => !s.abc_curve).length,
  }), [skus]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Curva ABC"
        description="Classificação de SKUs por faturamento (últimos 90 dias)"
      />

      {/* Curve Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total SKUs</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        {(["A", "B", "C"] as const).map((curve) => {
          const cfg = curveConfig[curve];
          const count = stats[curve.toLowerCase() as "a" | "b" | "c"];
          const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return (
            <button
              key={curve}
              onClick={() => setCurveFilter(curveFilter === curve ? "all" : curve)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all hover:scale-[1.02]",
                curveFilter === curve ? "ring-2 ring-primary" : "",
                cfg.color
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Curva {cfg.label}</p>
                <Badge variant="outline" className={cn("text-[10px]", cfg.color)}>{pct}%</Badge>
              </div>
              <p className="text-2xl font-bold mt-1">{count}</p>
              <p className="text-[10px] opacity-70">{cfg.description}</p>
            </button>
          );
        })}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Sem Curva</p>
          <p className="text-2xl font-bold text-muted-foreground">{stats.unclassified}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <BarChart3 className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">Nenhum SKU encontrado</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curva</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Custo Médio</TableHead>
              <TableHead className="text-right">Preço Médio</TableHead>
              <TableHead className="text-right">Pack</TableHead>
              <TableHead className="text-right">Lead Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s: any) => {
              const cfg = s.abc_curve ? curveConfig[s.abc_curve] : null;
              return (
                <TableRow key={s.id}>
                  <TableCell>
                    {cfg ? (
                      <Badge variant="outline" className={cn("text-xs font-bold w-8 justify-center", cfg.color)}>
                        {cfg.label}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{s.description}</p>
                      <p className="text-xs text-muted-foreground">{s.sku_code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.category || "—"}
                    {s.subcategory && <span className="text-xs ml-1">/ {s.subcategory}</span>}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {s.avg_unit_cost ? `R$ ${s.avg_unit_cost.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {s.avg_unit_price ? `R$ ${s.avg_unit_price.toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{s.pack_size}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {s.lead_time_days ? `${s.lead_time_days}d` : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
