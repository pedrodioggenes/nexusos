import { useNavigate } from "react-router-dom";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { EXPENSES_BY_CC, formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData, ExpenseByCostCenter } from "@/data/dominio/types";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const currFmt = (v: number) => { if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`; if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`; return String(v); };

export default function FinanceiroDespesas() {
  const { filters, updateFilter } = useGlobalFilters();
  const navigate = useNavigate();

  const expenses = EXPENSES_BY_CC;
  const totalExpenses = expenses.reduce((s, e) => s + e.value, 0);
  const totalPrev = expenses.reduce((s, e) => s + e.value_prev, 0);
  const variationTotal = ((totalExpenses - totalPrev) / totalPrev) * 100;
  const topCC = [...expenses].sort((a, b) => b.value - a.value)[0];
  const abnormalCount = expenses.filter(e => e.is_abnormal).length;

  const kpiItems: KPICardData[] = [
    { label: "Despesas do Período", value: totalExpenses, formatted_value: formatCurrency(totalExpenses), variation_pct: variationTotal, variation_type: variationTotal > 5 ? "negative" : "neutral" },
    { label: "Variação", value: variationTotal, formatted_value: `${variationTotal > 0 ? "+" : ""}${variationTotal.toFixed(1)}%`, variation_pct: variationTotal, variation_type: variationTotal > 5 ? "negative" : "positive" },
    { label: "Top Centro de Custo", value: topCC.value, formatted_value: formatCurrency(topCC.value), impact_label: topCC.center },
    { label: "Fora do Normal", value: abnormalCount, formatted_value: `${abnormalCount} centro${abnormalCount !== 1 ? "s" : ""}`, variation_type: abnormalCount > 0 ? "negative" : "positive" },
  ];

  const sortedPareto = [...expenses].sort((a, b) => b.value - a.value);
  let cumPct = 0;
  const paretoData = sortedPareto.map(e => {
    cumPct += (e.value / totalExpenses) * 100;
    return { name: e.center, value: e.value, cumulative: Math.round(cumPct) };
  });

  const trendData = [
    { period: "Set", despesas: totalPrev * 0.95 },
    { period: "Out", despesas: totalPrev * 0.97 },
    { period: "Nov", despesas: totalPrev * 0.99 },
    { period: "Dez", despesas: totalPrev * 1.02 },
    { period: "Jan", despesas: totalPrev },
    { period: "Fev", despesas: totalExpenses },
  ];

  const columns: ColumnDef<ExpenseByCostCenter>[] = [
    { key: "center", label: "Centro de Custo", render: (r) => <div className="flex items-center gap-1.5">{r.is_abnormal && <AlertTriangle className="h-3 w-3 text-red-500" />}{r.center}</div> },
    { key: "value", label: "Valor", render: (r) => formatCurrency(r.value), getValue: (r) => r.value },
    { key: "value_prev", label: "Anterior", render: (r) => formatCurrency(r.value_prev), getValue: (r) => r.value_prev },
    { key: "variation_pct", label: "Variação %", render: (r) => <span className={r.variation_pct > 10 ? "text-red-500" : r.variation_pct > 5 ? "text-yellow-500" : "text-green-500"}>{r.variation_pct > 0 ? "+" : ""}{r.variation_pct.toFixed(1)}%</span>, getValue: (r) => r.variation_pct },
    { key: "unit_name", label: "Unidade" },
    { key: "is_abnormal", label: "Status", render: (r) => r.is_abnormal ? <Badge variant="destructive" className="text-[10px]">Anormal</Badge> : <Badge variant="secondary" className="text-[10px]">Normal</Badge>, sortable: false, filterable: false },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} />

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("/app/dominio/problemas/radar")}>
          <ExternalLink className="h-3 w-3 mr-1" /> Ver Radar de Problemas
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSection title="Pareto de Despesas" subtitle="Por centro de custo">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={paretoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" angle={-30} textAnchor="end" height={50} />
              <YAxis yAxisId="left" tickFormatter={currFmt} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="value" name="Valor" fill="hsl(270, 60%, 55%)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="cumulative" name="% Acumulado" stroke="hsl(350, 70%, 55%)" strokeWidth={2} dot />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Tendência Mensal" subtitle="Evolução das despesas totais">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={currFmt} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => `R$ ${currFmt(v)}`} />
              <Line type="monotone" dataKey="despesas" name="Despesas" stroke="hsl(350, 70%, 55%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      <DataTablePro
        data={expenses}
        columns={columns}
        actions={[
          {
            label: "Marcar anormal",
            onClick: (row) => toast({ title: "Problema registrado", description: `"${row.center}" marcado como fora do normal no Radar (placeholder)` }),
            show: (row) => !row.is_abnormal,
          },
        ]}
      />
    </div>
  );
}
