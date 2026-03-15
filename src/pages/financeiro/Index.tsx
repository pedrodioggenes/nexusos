import { PageHeader } from "@/components/ui/page-header";
import { DollarSign, TrendingUp, BarChart3, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useKPIHistory } from "@/hooks/financeiro/useFinancialData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { cn } from "@/lib/utils";

const mockKPIs = [
  { label: "Receita Líquida", value: "R$ 18.2M", change: "+4.2%", trend: "up", color: "text-success" },
  { label: "Margem Bruta", value: "34.3%", change: "+0.5pp", trend: "up", color: "text-success" },
  { label: "Margem Operacional", value: "6.1%", change: "+0.8pp", trend: "up", color: "text-success" },
  { label: "EBITDA", value: "R$ 1.42M", change: "+15.0%", trend: "up", color: "text-success" },
  { label: "Lucro Líquido", value: "R$ 842K", change: "+21.5%", trend: "up", color: "text-success" },
];

const mockCCC = [
  { label: "DIO", value: "32 dias", status: "green" as const },
  { label: "DSO", value: "3 dias", status: "green" as const },
  { label: "DPO", value: "28 dias", status: "yellow" as const },
  { label: "CCC", value: "7 dias", status: "green" as const },
  { label: "NCG", value: "R$ 1.8M", status: "yellow" as const },
];

const mockAlerts = [
  { severity: "red" as const, text: "ML% abaixo de 3% na Loja Centro (2.1%)", link: "/app/financeiro/dre/loja" },
  { severity: "yellow" as const, text: "CCC aumentou 4 dias vs. mês anterior na Loja Leste", link: "/app/financeiro/capital-giro" },
  { severity: "yellow" as const, text: "Categoria Higiene com IMC em queda por 3 períodos", link: "/app/financeiro/margem-categoria" },
];

export default function FinanceiroDashboard() {
  const kpiHistory = useKPIHistory();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel Executivo C-Level"
        description="Visão consolidada dos indicadores financeiros da rede — Fev/2026"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {mockKPIs.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 text-success" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-destructive" />
              )}
              <span className={`text-xs font-medium ${kpi.color}`}>{kpi.change}</span>
              <span className="text-[10px] text-muted-foreground">vs. mês ant.</span>
            </div>
          </div>
        ))}
      </div>

      {/* Capital de Giro Row */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-app-financeiro" />
          Capital de Giro
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {mockCCC.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                <div className={cn("h-2 w-2 rounded-full",
                  item.status === "green" ? "bg-success" : item.status === "yellow" ? "bg-warning" : "bg-destructive"
                )} />
              </div>
              <p className="text-lg font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 12-month KPI Evolution Chart */}
      <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-app-financeiro" />
          Evolução 12 Meses — Margens e CCC
        </h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kpiHistory}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="pct" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 40]} />
              <YAxis yAxisId="dias" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => `${v}d`} domain={[0, 15]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="pct" type="monotone" dataKey="mb" name="MB%" stroke="hsl(var(--app-financeiro))" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="pct" type="monotone" dataKey="mo" name="MO%" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line yAxisId="pct" type="monotone" dataKey="ml" name="ML%" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line yAxisId="dias" type="monotone" dataKey="ccc" name="CCC (dias)" stroke="hsl(var(--chart-4))" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-app-financeiro" />
          Alertas Críticos
        </h2>
        <div className="space-y-2">
          {mockAlerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <div className={cn("h-2 w-2 rounded-full shrink-0",
                alert.severity === "red" ? "bg-destructive" : "bg-warning"
              )} />
              <p className="text-sm text-foreground flex-1">{alert.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            Top 3 Lojas — MO%
          </h3>
          <div className="space-y-2">
            {["Loja Matriz — 8.2%", "Loja Norte — 7.1%", "Loja Sul — 6.8%"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-xs font-bold text-app-financeiro w-5">{i + 1}.</span>
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.01]">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-destructive" />
            Bottom 3 Lojas — MO%
          </h3>
          <div className="space-y-2">
            {["Loja Centro — 3.2%", "Loja Leste — 4.1%", "Loja Oeste — 4.5%"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-xs font-bold text-destructive w-5">{i + 1}.</span>
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
