import { PageHeader } from "@/components/ui/page-header";
import { useDRERedeData } from "@/hooks/financeiro/useFinancialData";
import { formatCurrency, formatPercent, getSemaforo } from "@/hooks/financeiro/useFinancialFormulas";
import { ArrowUpRight, ArrowDownRight, FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DRERedePage() {
  const { lines, period } = useDRERedeData();

  const fmt = (v: number, isPercent?: boolean) => isPercent ? formatPercent(v) : formatCurrency(v);

  const change = (curr: number, prev: number, isPercent?: boolean) => {
    if (isPercent) return `${(curr - prev) > 0 ? "+" : ""}${(curr - prev).toFixed(1)}pp`;
    const pct = prev !== 0 ? ((curr - prev) / Math.abs(prev)) * 100 : 0;
    return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="DRE Gerencial — Rede" description={`Consolidado ${period}`} />
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-3.5 w-3.5" /> Exportar
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_100px_80px] gap-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <div className="px-4 py-3">Linha</div>
          <div className="px-3 py-3 text-right">Atual</div>
          <div className="px-3 py-3 text-right">Mês Ant.</div>
          <div className="px-3 py-3 text-right">Var.</div>
          <div className="px-3 py-3 text-center">Status</div>
        </div>

        {lines.map((line) => {
          const chg = change(line.value, line.prevValue, line.isPercent);
          const isUp = line.isPercent ? line.value > line.prevValue : line.value > line.prevValue;
          const isNeg = line.value < 0;
          const sem = line.metaValue !== null
            ? getSemaforo(line.value, line.metaValue, line.metaValue * 0.95, line.metaValue * 0.85, line.isPercent ? true : line.value > 0)
            : "neutral";

          return (
            <div
              key={line.key}
              className={cn(
                "grid grid-cols-[1fr_120px_120px_100px_80px] gap-0 border-b border-border/50 last:border-0 items-center transition-colors hover:bg-muted/20",
                line.level === 0 && "bg-muted/10",
              )}
            >
              <div className={cn("px-4 py-2.5 text-sm", line.level === 2 && "pl-8", line.isBold && "font-semibold text-foreground", !line.isBold && "text-muted-foreground")}>
                {line.label}
              </div>
              <div className={cn("px-3 py-2.5 text-right text-sm tabular-nums", line.isBold && "font-semibold", isNeg && "text-destructive")}>
                {fmt(line.value, line.isPercent)}
              </div>
              <div className="px-3 py-2.5 text-right text-sm text-muted-foreground tabular-nums">
                {fmt(line.prevValue, line.isPercent)}
              </div>
              <div className="px-3 py-2.5 text-right">
                <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", isUp ? "text-success" : "text-destructive")}>
                  {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {chg}
                </span>
              </div>
              <div className="px-3 py-2.5 flex justify-center">
                {sem !== "neutral" && (
                  <div className={cn("h-2.5 w-2.5 rounded-full", sem === "green" && "bg-success", sem === "yellow" && "bg-warning", sem === "red" && "bg-destructive")} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground">
        <FileSpreadsheet className="inline h-3 w-3 mr-1" />
        Semáforo baseado na meta configurada. Verde = atingido · Amarelo = 95% · Vermelho = &lt;85%
      </p>
    </div>
  );
}
