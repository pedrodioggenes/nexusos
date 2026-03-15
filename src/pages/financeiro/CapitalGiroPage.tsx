import { PageHeader } from "@/components/ui/page-header";
import { useCapitalGiroData } from "@/hooks/financeiro/useFinancialData";
import { formatCurrency, formatDays, getSemaforo } from "@/hooks/financeiro/useFinancialFormulas";
import { DollarSign, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const METRICS = [
  { key: "dio" as const, label: "DIO", meta: 35, limA: 38, limV: 42, unit: "dias", lowerBetter: true },
  { key: "dso" as const, label: "DSO", meta: 5, limA: 6, limV: 8, unit: "dias", lowerBetter: true },
  { key: "dpo" as const, label: "DPO", meta: 30, limA: 25, limV: 20, unit: "dias", lowerBetter: false },
  { key: "ccc" as const, label: "CCC", meta: 10, limA: 12, limV: 15, unit: "dias", lowerBetter: true },
];

export default function CapitalGiroPage() {
  const { current, history } = useCapitalGiroData();

  return (
    <div className="space-y-6">
      <PageHeader title="Capital de Giro" description="Ciclo de Conversão de Caixa e NCG" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METRICS.map(m => {
          const val = current[m.key];
          const sem = getSemaforo(val, m.meta, m.limA, m.limV, !m.lowerBetter);
          return (
            <div key={m.key} className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
                <div className={cn("h-2.5 w-2.5 rounded-full", sem === "green" && "bg-success", sem === "yellow" && "bg-warning", sem === "red" && "bg-destructive")} />
              </div>
              <p className="text-xl font-bold text-foreground">{val} {m.unit}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Meta: {m.meta} {m.unit}</p>
            </div>
          );
        })}
      </div>

      {/* NCG + ICDF */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">NCG — Necessidade de Capital de Giro</p>
          <p className="text-xl font-bold text-foreground">{formatCurrency(current.ncg)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">ICDF — Cobertura de Disponibilidades</p>
            {current.icdf < 15 && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
          </div>
          <p className={cn("text-xl font-bold", current.icdf < 15 ? "text-destructive" : "text-foreground")}>{current.icdf} dias</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Alerta se &lt; 15 dias</p>
        </div>
      </div>

      {/* Chart: CCC Evolution */}
      <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-app-financeiro" />
          Evolução do CCC — 12 meses
        </h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 15]} className="text-muted-foreground" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="ccc" name="CCC (dias)" stroke="hsl(var(--app-financeiro))" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="dio" name="DIO" stroke="hsl(var(--chart-2))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="dpo" name="DPO" stroke="hsl(var(--chart-3))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NCG Evolution */}
      <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
        <h3 className="text-sm font-semibold text-foreground mb-4">NCG — Evolução 12 meses</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="ncg" name="NCG" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
