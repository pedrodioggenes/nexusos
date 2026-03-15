import { PageHeader } from "@/components/ui/page-header";
import { useROICData } from "@/hooks/financeiro/useFinancialData";
import { formatCurrency, formatPercent } from "@/hooks/financeiro/useFinancialFormulas";
import { RefreshCw, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Legend } from "recharts";

const WACC = 10.0;

export default function ROICPage() {
  const data = useROICData();
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  const kpis = [
    { label: "ROIC", value: latest.roic, prev: prev.roic, unit: "%" },
    { label: "ROCE", value: latest.roce, prev: prev.roce, unit: "%" },
    { label: "Spread de Valor", value: latest.spreadValor, prev: prev.spreadValor, unit: "pp" },
    { label: "NOPAT", value: latest.nopat, prev: prev.nopat, unit: "R$", isCurrency: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="ROIC / ROCE" description="Retorno sobre capital investido e empregado" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => {
          const isUp = k.value > k.prev;
          const isPositive = k.label === "Spread de Valor" ? k.value > 0 : k.value > WACC;
          return (
            <div key={k.label} className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{k.label}</p>
              <p className={cn("text-xl font-bold", isPositive ? "text-success" : "text-foreground")}>
                {k.isCurrency ? formatCurrency(k.value) : `${k.value.toFixed(1)}${k.unit}`}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {isUp ? <ArrowUpRight className="h-3 w-3 text-success" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
                <span className={cn("text-xs font-medium", isUp ? "text-success" : "text-destructive")}>
                  {k.isCurrency ? formatCurrency(k.value - k.prev) : `${(k.value - k.prev) > 0 ? "+" : ""}${(k.value - k.prev).toFixed(1)}${k.unit}`}
                </span>
                <span className="text-[10px] text-muted-foreground">vs. trimestre ant.</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DuPont Decomposition */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Decomposição DuPont</h3>
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Margem NOPAT</p>
              <p className="text-lg font-bold text-foreground">{formatPercent(latest.margemNopat)}</p>
            </div>
            <span className="text-xl text-muted-foreground">×</span>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Giro do Capital</p>
              <p className="text-lg font-bold text-foreground">{latest.giroCapital.toFixed(2)}x</p>
            </div>
            <span className="text-xl text-muted-foreground">=</span>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">ROIC</p>
              <p className="text-lg font-bold text-app-financeiro">{formatPercent(latest.roic)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Benchmark Setorial</h3>
          <div className="space-y-3">
            {[
              { label: "Supermercados (média setor)", roic: 8.5, roce: 10.0 },
              { label: "Top quartil", roic: 14.0, roce: 17.0 },
              { label: "Sua empresa", roic: latest.roic, roce: latest.roce, highlight: true },
            ].map(b => (
              <div key={b.label} className={cn("flex items-center justify-between text-sm py-1.5 px-3 rounded-lg", b.highlight && "bg-app-financeiro/10")}>
                <span className={cn("text-muted-foreground", b.highlight && "text-app-financeiro font-medium")}>{b.label}</span>
                <div className="flex gap-4 tabular-nums">
                  <span className={cn("text-xs", b.highlight && "font-semibold text-app-financeiro")}>ROIC {b.roic}%</span>
                  <span className={cn("text-xs", b.highlight && "font-semibold text-app-financeiro")}>ROCE {b.roce}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-app-financeiro" />
          Evolução Trimestral
        </h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={WACC} stroke="hsl(var(--destructive))" strokeDasharray="6 3" label={{ value: `WACC ${WACC}%`, fontSize: 10, fill: "hsl(var(--destructive))" }} />
              <Line type="monotone" dataKey="roic" name="ROIC" stroke="hsl(var(--app-financeiro))" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="roce" name="ROCE" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
