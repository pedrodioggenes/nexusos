import { PageHeader } from "@/components/ui/page-header";
import { useStoreFormulas } from "@/hooks/loja/useStoreFormulas";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Trophy, ArrowUpRight } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ComparativoPage() {
  const { calcReceitaM2, calcIP, calcIAP, calcMarkupReal, calcNormalizacaoKPI, calcIPC, calcDistanciaMelhorPratica, formatMoney, formatPercent } = useStoreFormulas();
  const { lojas, getSecoesForLoja, getSKUsForLoja, getPerdasForLoja, getReceitaTotalLoja, getPerdaTotalLoja, configIPC } = useStoreData();

  const lojaMetrics = useMemo(() => {
    return lojas.map(loja => {
      const secoes = getSecoesForLoja(loja.id);
      const skus = getSKUsForLoja(loja.id);
      const receitaTotal = getReceitaTotalLoja(loja.id);
      const perdaTotal = getPerdaTotalLoja(loja.id);
      const receitaM2 = calcReceitaM2(receitaTotal, loja.areaTotal) ?? 0;
      const ip = calcIP(perdaTotal, receitaTotal) ?? 0;

      const skusAderentes = skus.filter(sku => {
        const mk = calcMarkupReal(sku.precoVenda, sku.custoUnitario);
        return mk !== null && Math.abs(mk - sku.markupMeta) <= sku.tolerancia;
      }).length;
      const iap = calcIAP(skusAderentes, skus.length) ?? 0;

      const margemTotal = secoes.reduce((s, sec) => s + sec.margemBruta, 0);
      const margemM2 = loja.areaTotal > 0 ? margemTotal / loja.areaTotal : 0;

      return { id: loja.id, nome: loja.nome, receitaM2, margemM2, ip, iap, receitaTotal, perdaTotal };
    });
  }, [lojas]);

  // IPC calculation
  const ipcRanking = useMemo(() => {
    const kpiKeys = ["receita_m2", "margem_m2", "iap", "ip_pct", "ipe_medio"];
    const kpiValues: Record<string, number[]> = {};
    kpiKeys.forEach(k => { kpiValues[k] = []; });

    lojaMetrics.forEach(l => {
      kpiValues["receita_m2"].push(l.receitaM2);
      kpiValues["margem_m2"].push(l.margemM2);
      kpiValues["iap"].push(l.iap);
      kpiValues["ip_pct"].push(100 - l.ip); // Invertido: menor IP% é melhor
      kpiValues["ipe_medio"].push(1.0); // placeholder
    });

    return lojaMetrics.map(l => {
      const normalizedKpis = configIPC.map((cfg, i) => {
        const vals = kpiValues[cfg.kpiNome];
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const rawVal = [l.receitaM2, l.margemM2, l.iap, 100 - l.ip, 1.0][i];
        const normalized = calcNormalizacaoKPI(rawVal, min, max);
        return { peso: cfg.peso, valorNormalizado: normalized };
      });

      const ipc = calcIPC(normalizedKpis);
      return { ...l, ipc: ipc ?? 0 };
    }).sort((a, b) => b.ipc - a.ipc);
  }, [lojaMetrics, configIPC]);

  const bestReceitaM2 = Math.max(...ipcRanking.map(l => l.receitaM2));

  // Scatter data
  const scatterData = ipcRanking.map(l => ({
    x: l.receitaM2,
    y: l.ip,
    nome: l.nome,
    ipc: l.ipc,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comparativo entre Lojas"
        description="Ranking multidimensional, IPC e distância da melhor prática"
      />

      {/* IPC Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ipcRanking.map((l, i) => (
          <div key={l.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-bold text-lg",
                i === 0 ? "bg-app-loja/20 text-app-loja" : "bg-muted text-muted-foreground"
              )}>
                #{i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{l.nome}</p>
                <p className="text-[10px] text-muted-foreground">IPC: {l.ipc.toFixed(1)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">R$/m²</p>
                <p className="text-xs font-mono font-medium text-foreground">{formatMoney(l.receitaM2)}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">Margem/m²</p>
                <p className="text-xs font-mono font-medium text-foreground">{formatMoney(l.margemM2)}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">IAP</p>
                <p className="text-xs font-mono font-medium text-foreground">{formatPercent(l.iap)}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">IP%</p>
                <p className={cn("text-xs font-mono font-medium", l.ip <= 1.5 ? "text-success" : l.ip <= 2.5 ? "text-warning" : "text-destructive")}>{formatPercent(l.ip)}</p>
              </div>
            </div>
            {i > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-app-loja/5 flex items-center gap-2">
                <ArrowUpRight className="h-3 w-3 text-app-loja" />
                <span className="text-[10px] text-app-loja font-medium">
                  Distância da melhor prática: {formatMoney(calcDistanciaMelhorPratica(bestReceitaM2, l.receitaM2))} R$/m²
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scatter Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Dispersão: R$/m² vs IP%</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis type="number" dataKey="x" name="R$/m²" tick={{ fontSize: 10 }} label={{ value: "R$/m²", position: "bottom", fontSize: 10 }} />
            <YAxis type="number" dataKey="y" name="IP%" tick={{ fontSize: 10 }} label={{ value: "IP%", angle: -90, position: "left", fontSize: 10 }} />
            <ZAxis type="number" dataKey="ipc" range={[80, 200]} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "R$/m²") return formatMoney(value);
                if (name === "IP%") return formatPercent(value);
                return value.toFixed(1);
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.nome ?? ""}
            />
            <Scatter data={scatterData} fill="hsl(var(--app-loja))" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* IPC Pesos */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Pesos do IPC</h3>
        <div className="flex gap-2 flex-wrap">
          {configIPC.map(cfg => (
            <div key={cfg.kpiNome} className="px-3 py-2 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
              <p className="text-xs font-bold text-foreground">{(cfg.peso * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
