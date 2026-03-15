import { PageHeader } from "@/components/ui/page-header";
import { useCustosData, useCustosEvolutionData } from "@/hooks/financeiro/useFinancialData";
import { formatCurrency, formatPercent } from "@/hooks/financeiro/useFinancialFormulas";
import { PieChart as PieChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export default function CustosPage() {
  const { naturezas, totalRL, total } = useCustosData();
  const evolution = useCustosEvolutionData();

  const pieData = naturezas.map(n => ({ name: n.natureza, value: n.valor }));
  const COLORS = naturezas.map(n => n.color);

  return (
    <div className="space-y-6">
      <PageHeader title="Análise de Custos Operacionais" description="Composição e evolução por natureza" />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Custo Operacional Total</p>
          <p className="text-xl font-bold text-foreground">{formatCurrency(total)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">% da Receita Líquida</p>
          <p className="text-xl font-bold text-foreground">{formatPercent((total / totalRL) * 100)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Receita Líquida</p>
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalRL)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-app-financeiro" />
            Composição por Natureza
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_60px_60px_60px] gap-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
            <div className="px-4 py-3">Natureza</div>
            <div className="px-2 py-3 text-right">Valor</div>
            <div className="px-2 py-3 text-right">%RL</div>
            <div className="px-2 py-3 text-right">Meta</div>
            <div className="px-2 py-3 text-right">Bench</div>
          </div>
          {naturezas.map(n => (
            <div key={n.natureza} className="grid grid-cols-[1fr_80px_60px_60px_60px] gap-0 border-b border-border/50 last:border-0 items-center hover:bg-muted/20">
              <div className="px-4 py-2 text-sm text-foreground flex items-center gap-2">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: n.color }} />
                {n.natureza}
              </div>
              <div className="px-2 py-2 text-right text-xs tabular-nums text-foreground">{formatCurrency(n.valor)}</div>
              <div className={cn("px-2 py-2 text-right text-xs tabular-nums font-medium", n.percentualRL > n.meta ? "text-destructive" : "text-foreground")}>{formatPercent(n.percentualRL)}</div>
              <div className="px-2 py-2 text-right text-xs tabular-nums text-muted-foreground">{formatPercent(n.meta)}</div>
              <div className="px-2 py-2 text-right text-xs tabular-nums text-muted-foreground">{formatPercent(n.benchmark)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution */}
      <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
        <h3 className="text-sm font-semibold text-foreground mb-4">Evolução %RL por Natureza</h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="folha" name="Folha" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ocupacao" name="Ocupação" stroke="hsl(var(--chart-2))" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="utilidades" name="Utilidades" stroke="hsl(var(--chart-3))" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="perdas" name="Perdas" stroke="hsl(var(--chart-4))" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
