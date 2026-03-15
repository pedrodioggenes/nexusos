import { useState, useMemo } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { LinkToContext } from "@/components/dominio/LinkToContext";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { SUPPLIERS, ENTREGAS, COMPRAS, getSupplierProblems } from "@/data/dominio/compras-mock";
import { formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData } from "@/data/dominio/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, AlertTriangle, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { SparklineChart } from "@/components/dominio/SparklineChart";
import type { SupplierDim } from "@/data/dominio/compras-mock";

export default function ComprasFornecedores() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const [drawerSupplier, setDrawerSupplier] = useState<SupplierDim | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<Record<string, string>>({});

  const suppliersData = useMemo(() => {
    return SUPPLIERS.map((s) => {
      const compras = COMPRAS.filter((c) => c.supplier_id === s.id);
      const totalCompras = compras.reduce((sum, c) => sum + c.valor, 0);
      const entrega = ENTREGAS.find((e) => e.supplier_id === s.id);
      const problems = getSupplierProblems(s.id);
      return { ...s, totalCompras, entrega, problemsCount: problems.length, problems };
    }).sort((a, b) => b.totalCompras - a.totalCompras);
  }, []);

  const filtered = useMemo(() => {
    let items = suppliersData;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(s) || i.categories.some((c) => c.toLowerCase().includes(s)));
    }
    return items;
  }, [suppliersData, filters.search]);

  const topByVolume = suppliersData[0];
  const withProblems = suppliersData.filter((s) => s.problemsCount > 0);
  const totalVolume = suppliersData.reduce((s, i) => s + i.totalCompras, 0);
  const avgRating = suppliersData.reduce((s, i) => s + i.rating, 0) / suppliersData.length;

  const kpiItems: KPICardData[] = [
    { label: "Fornecedores Ativos", value: SUPPLIERS.length, formatted_value: SUPPLIERS.length.toString(), variation_pct: 0, variation_type: "neutral" },
    { label: "Volume do Período", value: totalVolume, formatted_value: formatCurrency(totalVolume), variation_pct: 4.2, variation_type: "positive" },
    { label: "Top Fornecedor", value: topByVolume?.name || "", formatted_value: topByVolume?.name.split(" ")[0] || "", impact_label: formatCurrency(topByVolume?.totalCompras || 0) },
    { label: "Com Problemas", value: withProblems.length, formatted_value: withProblems.length.toString(), variation_pct: withProblems.length > 3 ? -10 : 5, variation_type: withProblems.length > 3 ? "negative" : "positive" },
  ];

  const ratingStars = (rating: number) => {
    const full = Math.floor(rating);
    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`h-3 w-3 ${i < full ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
      </span>
    );
  };

  const openCreatePendencia = (supplier: SupplierDim) => {
    setCreateDefaults({ title: `Ação com fornecedor: ${supplier.name}`, description: `Pendência referente ao fornecedor ${supplier.name} (${supplier.categories.join(", ")})` });
    setCreateOpen(true);
  };

  const drawerData = useMemo(() => {
    if (!drawerSupplier) return null;
    const data = suppliersData.find((s) => s.id === drawerSupplier.id);
    return data || null;
  }, [drawerSupplier, suppliersData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fornecedores</h1>
        <p className="text-muted-foreground">Visão consolidada dos fornecedores e suas condições comerciais</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpiItems} columns={4} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Categorias</TableHead>
            <TableHead className="text-right">Volume (R$)</TableHead>
            <TableHead className="text-center">Ocorrências</TableHead>
            <TableHead>Avaliação</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((s) => (
            <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDrawerSupplier(s)}>
              <TableCell className="font-semibold">{s.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {s.categories.map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(s.totalCompras)}</TableCell>
              <TableCell className="text-center">
                {s.problemsCount > 0 ? (
                  <Badge variant="destructive" className="text-[10px]">
                    <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> {s.problemsCount}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">OK</Badge>
                )}
              </TableCell>
              <TableCell>{ratingStars(s.rating)}</TableCell>
              <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openCreatePendencia(s)}>
                  <Plus className="h-3 w-3 mr-1" /> Pendência
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Drawer */}
      <Sheet open={!!drawerSupplier} onOpenChange={(o) => !o && setDrawerSupplier(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{drawerSupplier?.name}</SheetTitle>
            <SheetDescription>CNPJ: {drawerSupplier?.cnpj} · Contato: {drawerSupplier?.contact}</SheetDescription>
          </SheetHeader>
          {drawerData && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Volume Mês</p>
                  <p className="text-lg font-bold">{formatCurrency(drawerData.totalCompras)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Avaliação</p>
                  <div className="mt-1">{ratingStars(drawerData.rating)}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">On-Time</p>
                  <p className="text-lg font-bold">{drawerData.entrega?.on_time_pct || 0}%</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Atraso Médio</p>
                  <p className="text-lg font-bold">{drawerData.entrega?.atraso_medio_dias || 0} dias</p>
                </div>
              </div>

              {drawerData.entrega && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground mb-2">Tendência On-Time (%)</p>
                  <SparklineChart data={drawerData.entrega.trend} color="hsl(var(--primary))" height={48} />
                </div>
              )}

              {drawerData.problems.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Problemas Ativos</h4>
                  <div className="space-y-2">
                    {drawerData.problems.map((p, i) => (
                      <div key={i} className="rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-xs">
                        <span className="font-semibold">{p.type}:</span> {p.description} · <span className="text-muted-foreground">{p.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <LinkToContext label="Rupturas relacionadas" to="/app/dominio/produtos/ruptura" />
                <LinkToContext label="Perdas relacionadas" to="/app/dominio/produtos/perdas" />
                <LinkToContext label="Entregas" to="/app/dominio/compras/entregas" />
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setDrawerSupplier(null); openCreatePendencia(drawerData); }}>
                  <Plus className="h-3 w-3 mr-1" /> Criar Pendência
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <CreatePendenciaModal open={createOpen} onOpenChange={setCreateOpen} onSubmit={(p) => { addPendencia(p); setCreateOpen(false); }} defaults={createDefaults} />
    </div>
  );
}
