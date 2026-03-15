import { useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { useOrderSuggestions } from "@/hooks/cd/useDemandData";

export default function RupturasPage() {
  const { data: suggestions = [], isLoading } = useOrderSuggestions();

  // Filter only items with projected rupture
  const atRisk = useMemo(() => {
    const now = new Date();
    return suggestions
      .filter((s: any) => s.projected_rupture_date && s.status === "pending")
      .map((s: any) => ({
        ...s,
        days_to_rupture: differenceInDays(parseISO(s.projected_rupture_date), now),
      }))
      .sort((a: any, b: any) => a.days_to_rupture - b.days_to_rupture);
  }, [suggestions]);

  const stats = useMemo(() => ({
    total: atRisk.length,
    today: atRisk.filter((s: any) => s.days_to_rupture <= 0).length,
    within3d: atRisk.filter((s: any) => s.days_to_rupture > 0 && s.days_to_rupture <= 3).length,
    within7d: atRisk.filter((s: any) => s.days_to_rupture > 3 && s.days_to_rupture <= 7).length,
  }), [atRisk]);

  const getUrgencyColor = (days: number) => {
    if (days <= 0) return "text-destructive";
    if (days <= 3) return "text-destructive";
    if (days <= 7) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Projeção de Rupturas"
        description="SKUs com risco de falta e custo OOS estimado"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total em Risco</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <p className="text-xs text-destructive/80">Ruptura Hoje</p>
          </div>
          <p className="text-2xl font-bold text-destructive">{stats.today}</p>
        </div>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-xs text-muted-foreground">Até 3 dias</p>
          <p className="text-2xl font-bold text-destructive">{stats.within3d}</p>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
          <p className="text-xs text-muted-foreground">4–7 dias</p>
          <p className="text-2xl font-bold text-warning">{stats.within7d}</p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : atRisk.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <TrendingDown className="h-10 w-10 mb-2 opacity-40" />
          <p className="text-sm">Nenhum SKU com risco de ruptura no momento</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Urgência</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead className="text-right">Estoque Atual</TableHead>
              <TableHead className="text-right">ROP</TableHead>
              <TableHead>Data Ruptura</TableHead>
              <TableHead className="text-right">Sugestão</TableHead>
              <TableHead>Curva</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atRisk.map((s: any) => {
              const urgColor = getUrgencyColor(s.days_to_rupture);
              return (
                <TableRow key={s.id} className={cn(s.days_to_rupture <= 0 && "bg-destructive/5")}>
                  <TableCell>
                    <div className={cn("flex items-center gap-1.5 font-bold", urgColor)}>
                      <TrendingDown className="h-4 w-4" />
                      {s.days_to_rupture <= 0 ? "AGORA" : `${s.days_to_rupture}d`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground text-sm">{s.sku_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{s.sku_code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.store_name || "—"}</TableCell>
                  <TableCell className={cn("text-right font-medium", (s.current_stock ?? 0) <= 0 && "text-destructive")}>
                    {s.current_stock ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{s.reorder_point ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {format(parseISO(s.projected_rupture_date), "dd/MM/yy")}
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">{s.suggested_qty}</TableCell>
                  <TableCell>
                    {s.abc_curve && (
                      <Badge variant="outline" className={cn("text-xs",
                        s.abc_curve === "A" ? "bg-primary/10 text-primary border-primary/20" :
                        s.abc_curve === "B" ? "bg-warning/10 text-warning border-warning/20" :
                        "bg-muted text-muted-foreground border-border"
                      )}>{s.abc_curve}</Badge>
                    )}
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
