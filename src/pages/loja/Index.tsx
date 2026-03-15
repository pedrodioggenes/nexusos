import { PageHeader } from "@/components/ui/page-header";
import { Store, TrendingUp, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreFormulas } from "@/hooks/loja/useStoreFormulas";
import { useStoreData } from "@/hooks/loja/useStoreData";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const TIPO_LABELS: Record<string, string> = {
  operacional: "Operacional",
  vencimento: "Vencimento",
  furto_externo: "Furto Ext.",
  furto_interno: "Furto Int.",
};

export default function LojaDashboard() {
  const { calcReceitaM2, calcIP, calcIAP, calcMarkupReal, formatMoney, formatPercent } = useStoreFormulas();
  const { getSecoesForLoja, getSKUsForLoja, getPerdasForLoja, getAlertasForLoja, getReceitaTotalLoja, getPerdaTotalLoja, evolucaoPerdas } = useStoreData();

  const lojaId = "loja-a";
  const secoes = getSecoesForLoja(lojaId);
  const skus = getSKUsForLoja(lojaId);
  const perdas = getPerdasForLoja(lojaId);
  const alertas = getAlertasForLoja(lojaId);
  const receitaTotal = getReceitaTotalLoja(lojaId);
  const perdaTotal = getPerdaTotalLoja(lojaId);

  const kpis = useMemo(() => {
    const areaTotal = secoes.reduce((s, sec) => s + sec.area, 0);
    const receitaM2 = calcReceitaM2(receitaTotal, areaTotal);
    const ip = calcIP(perdaTotal, receitaTotal);

    const skusAderentes = skus.filter(sku => {
      const mk = calcMarkupReal(sku.precoVenda, sku.custoUnitario);
      return mk !== null && Math.abs(mk - sku.markupMeta) <= sku.tolerancia;
    }).length;
    const iap = calcIAP(skusAderentes, skus.length);
    const skusPAC = skus.filter(s => s.precoVenda < s.custoUnitario).length;

    return [
      { label: "R$/m² Mês", value: formatMoney(receitaM2), change: "+3.8%", trend: "up" as const },
      { label: "IAP", value: formatPercent(iap), change: "+1.2pp", trend: "up" as const },
      { label: "IP% Semana", value: formatPercent(ip), change: "-0.3pp", trend: "up" as const },
      { label: "IPC (Rede)", value: "72.5", change: "+4.1", trend: "up" as const },
      { label: "SKUs PAC", value: String(skusPAC), change: skusPAC > 0 ? `${skusPAC} ativos` : "0", trend: skusPAC > 0 ? "down" as const : "up" as const },
    ];
  }, [secoes, skus, receitaTotal, perdaTotal]);

  const topBottom = useMemo(() => {
    const ranked = secoes.map(s => ({
      secao: s.nome,
      receitaM2: calcReceitaM2(s.receita, s.area) ?? 0,
    })).sort((a, b) => b.receitaM2 - a.receitaM2);
    return {
      top: ranked.slice(0, 3),
      bottom: ranked.slice(-3).reverse(),
    };
  }, [secoes]);

  const perdasSemana = useMemo(() => {
    const last = evolucaoPerdas[evolucaoPerdas.length - 1];
    return [
      { tipo: "Operacional", valor: last.operacional, color: "hsl(var(--warning))" },
      { tipo: "Vencimento", valor: last.vencimento, color: "hsl(var(--destructive))" },
      { tipo: "Furto Ext.", valor: last.furto_externo, color: "hsl(var(--muted-foreground))" },
      { tipo: "Furto Int.", valor: last.furto_interno, color: "hsl(var(--accent-foreground))" },
    ];
  }, [evolucaoPerdas]);

  const activeAlerts = alertas.filter(a => a.status === "aberto");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel Executivo da Loja"
        description="Visão consolidada de rentabilidade, precificação e perdas"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 text-success" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-destructive" />
              )}
              <span className={cn("text-xs font-medium", kpi.trend === "up" ? "text-success" : "text-destructive")}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-app-loja" />
            <h3 className="text-sm font-semibold text-foreground">Alertas Ativos ({activeAlerts.length})</h3>
          </div>
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                <div className={cn(
                  "mt-0.5 h-2 w-2 rounded-full shrink-0",
                  alert.nivel === "critico" ? "bg-destructive" : "bg-warning"
                )} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground">{alert.titulo}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{alert.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top / Bottom Seções */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-app-loja" />
            <h3 className="text-sm font-semibold text-foreground">R$/m² por Seção</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-success font-semibold uppercase mb-2">Top 3</p>
              <div className="space-y-1.5">
                {topBottom.top.map((s, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-foreground">{s.secao}</span>
                    <span className="text-muted-foreground font-mono">{formatMoney(s.receitaM2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-destructive font-semibold uppercase mb-2">Bottom</p>
              <div className="space-y-1.5">
                {topBottom.bottom.map((s, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-foreground">{s.secao}</span>
                    <span className="text-muted-foreground font-mono">{formatMoney(s.receitaM2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perdas da Semana */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-app-loja" />
            <h3 className="text-sm font-semibold text-foreground">Perdas da Semana por Tipo</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={perdasSemana} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="tipo" tick={{ fontSize: 10 }} width={80} />
              <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {perdasSemana.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Position in Network */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <div className="flex items-center gap-2 mb-3">
            <Store className="h-4 w-4 text-app-loja" />
            <h3 className="text-sm font-semibold text-foreground">Posição na Rede (IPC)</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { loja: "Loja Centro", ipc: 82.4, pos: 1 },
              { loja: "Loja Leste", ipc: 72.5, pos: 2 },
            ].map((l) => (
              <div key={l.loja} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <span className="text-lg font-bold text-app-loja">#{l.pos}</span>
                <div>
                  <p className="text-xs font-medium text-foreground">{l.loja}</p>
                  <p className="text-[10px] text-muted-foreground">IPC: {l.ipc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
