import { PageHeader } from "@/components/ui/page-header";
import { useProjecaoData } from "@/hooks/financeiro/useFinancialData";
import { formatCurrency, formatPercent } from "@/hooks/financeiro/useFinancialFormulas";
import { TrendingUp, Target, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

export default function ProjecaoPage() {
  const data = useProjecaoData();

  return (
    <div className="space-y-6">
      <PageHeader title="Projeção Financeira" description="Resultado projetado para 30, 60 e 90 dias" />

      {/* Projection Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {data.map(p => (
          <div key={p.horizonte} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-app-financeiro">{p.horizonte}</span>
              <TrendingUp className="h-4 w-4 text-app-financeiro" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Receita Proj.</span>
                <span className="font-semibold text-foreground tabular-nums">{formatCurrency(p.receitaProj)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lucro Proj.</span>
                <span className="font-semibold text-foreground tabular-nums">{formatCurrency(p.lucroProj)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Margem Proj.</span>
                <span className="font-semibold text-foreground tabular-nums">{formatPercent(p.margemProj)}</span>
              </div>

              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" /> Gap vs Meta
                  </span>
                  <span className={cn("font-semibold tabular-nums flex items-center gap-0.5", p.gap < 0 ? "text-destructive" : "text-success")}>
                    {p.gap < 0 && <ArrowDownRight className="h-3 w-3" />}
                    {formatCurrency(p.gap)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
        <h3 className="text-sm font-semibold text-foreground mb-4">Receita Projetada vs Meta</h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="horizonte" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="receitaProj" name="Projetado" fill="hsl(var(--module-financeiro))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="metaReceita" name="Meta" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
