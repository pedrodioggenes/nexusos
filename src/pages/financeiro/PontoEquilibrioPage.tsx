import { PageHeader } from "@/components/ui/page-header";
import { useBreakevenData } from "@/hooks/financeiro/useFinancialData";
import { formatCurrency, formatPercent } from "@/hooks/financeiro/useFinancialFormulas";
import { Target, ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

export default function PontoEquilibrioPage() {
  const stores = useBreakevenData();
  const [simulPct, setSimulPct] = useState(0);

  return (
    <div className="space-y-6">
      <PageHeader title="Ponto de Equilíbrio por Loja" description="Break-even operacional e simulação" />

      {/* Store Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stores.map(store => {
          const receitaSim = store.receitaReal * (1 + simulPct / 100);
          const msSim = ((receitaSim - store.peo) / receitaSim) * 100;
          const acimaPE = receitaSim > store.peo;

          return (
            <div key={store.storeId} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{store.storeName}</h3>
                {acimaPE ? (
                  <ShieldCheck className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>

              {/* Gauge visual: PEO vs Receita */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>PEO</span>
                  <span>Receita</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-destructive/60 rounded-full absolute left-0 top-0"
                    style={{ width: `${Math.min((store.peo / receitaSim) * 100, 100)}%` }}
                  />
                  <div
                    className={cn("h-full rounded-full absolute left-0 top-0", acimaPE ? "bg-success/30" : "bg-destructive/30")}
                    style={{ width: "100%" }}
                  />
                  <div
                    className="h-full bg-destructive rounded-full absolute left-0 top-0"
                    style={{ width: `${Math.min((store.peo / Math.max(receitaSim, store.peo * 1.3)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-destructive font-medium">{formatCurrency(store.peo)}</span>
                  <span className="text-foreground font-medium">{formatCurrency(receitaSim)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Margem Seg.</p>
                  <p className={cn("text-lg font-bold", msSim > 10 ? "text-success" : msSim > 0 ? "text-warning" : "text-destructive")}>
                    {formatPercent(+msSim.toFixed(1))}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">GAO</p>
                  <p className="text-lg font-bold text-foreground">{store.gao.toFixed(2)}x</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-app-financeiro" />
          Simulador — Se a receita mudar {simulPct > 0 ? "+" : ""}{simulPct}%
        </h3>
        <div className="max-w-md">
          <Slider
            value={[simulPct]}
            onValueChange={([v]) => setSimulPct(v)}
            min={-30}
            max={30}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-30%</span>
            <span className="font-medium text-foreground">{simulPct > 0 ? "+" : ""}{simulPct}%</span>
            <span>+30%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
