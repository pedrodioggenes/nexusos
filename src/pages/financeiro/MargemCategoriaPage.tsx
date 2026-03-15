import { PageHeader } from "@/components/ui/page-header";
import { useMargemCategoriaData } from "@/hooks/financeiro/useFinancialData";
import { formatCurrency, formatPercent } from "@/hooks/financeiro/useFinancialFormulas";
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function MargemCategoriaPage() {
  const data = useMargemCategoriaData();
  const maxIMC = Math.max(...data.map(d => d.imc));

  const trendIcon = (t: string) => {
    if (t === "up") return <ArrowUpRight className="h-3 w-3 text-success" />;
    if (t === "down") return <ArrowDownRight className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const chartData = data.map(d => ({ name: d.categoria.length > 12 ? d.categoria.substring(0, 12) + "…" : d.categoria, imc: d.imc, full: d.categoria }));

  return (
    <div className="space-y-6">
      <PageHeader title="Margem de Contribuição por Categoria" description="Ranking IMC e análise de rentabilidade" />

      {/* Horizontal Bar Chart */}
      <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-app-financeiro" />
          Ranking IMC por Categoria
        </h3>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 90, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 60]} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={85} />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="imc" name="IMC %" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={`hsl(var(--app-financeiro) / ${0.4 + (data[i].imc / maxIMC) * 0.6})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_90px_80px_80px_80px_60px] gap-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <div className="px-4 py-3">Categoria</div>
          <div className="px-3 py-3 text-right">Receita</div>
          <div className="px-3 py-3 text-right">IMC %</div>
          <div className="px-3 py-3 text-right">Part. %</div>
          <div className="px-3 py-3 text-right">MC Pond.</div>
          <div className="px-3 py-3 text-center">Tend.</div>
        </div>

        {data.map((cat) => {
          const declining = cat.tendencia === "down" && (cat.imc - cat.imcAnterior) < -1.5;
          return (
            <div key={cat.categoria} className={cn("grid grid-cols-[1fr_90px_80px_80px_80px_60px] gap-0 border-b border-border/50 last:border-0 items-center hover:bg-muted/20", declining && "bg-destructive/5")}>
              <div className="px-4 py-2.5 text-sm font-medium text-foreground flex items-center gap-2">
                {cat.categoria}
                {declining && <AlertTriangle className="h-3 w-3 text-destructive" />}
              </div>
              <div className="px-3 py-2.5 text-right text-sm tabular-nums text-muted-foreground">{formatCurrency(cat.receita)}</div>
              <div className={cn("px-3 py-2.5 text-right text-sm tabular-nums font-semibold", cat.imc < 0 ? "text-destructive" : "text-foreground")}>{formatPercent(cat.imc)}</div>
              <div className="px-3 py-2.5 text-right text-sm tabular-nums text-muted-foreground">{formatPercent(cat.participacao)}</div>
              <div className="px-3 py-2.5 text-right text-sm tabular-nums text-muted-foreground">{formatPercent(cat.mcPonderada)}</div>
              <div className="px-3 py-2.5 flex justify-center">{trendIcon(cat.tendencia)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
