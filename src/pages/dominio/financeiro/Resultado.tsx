import { useNavigate } from "react-router-dom";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { DRE_RESUMO, DRE_BY_UNIT, MARGIN_TREND, formatCurrency, formatPercent } from "@/data/dominio/mock-data";
import type { KPICardData, DREByUnit, MarginTrend } from "@/data/dominio/types";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const currFmt = (v: number) => { if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`; if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`; return String(v); };

export default function FinanceiroResultado() {
  const { filters, updateFilter } = useGlobalFilters();
  const navigate = useNavigate();

  const dre = DRE_RESUMO;
  const vl = dre[0];
  const cmv = dre[1];
  const mb = dre[2];
  const desp = dre[3];
  const res = dre[4];

  const kpiItems: KPICardData[] = [
    { label: "Venda Líquida", value: vl.value, formatted_value: formatCurrency(vl.value), variation_pct: ((vl.value - vl.value_prev) / Math.abs(vl.value_prev)) * 100, variation_type: "positive" },
    { label: "CMV", value: cmv.value, formatted_value: formatCurrency(Math.abs(cmv.value)), variation_pct: ((Math.abs(cmv.value) - Math.abs(cmv.value_prev)) / Math.abs(cmv.value_prev)) * 100, variation_type: "negative" },
    { label: "Margem Bruta", value: mb.value, formatted_value: `${formatCurrency(mb.value)} (${mb.pct_sales}%)`, variation_pct: ((mb.value - mb.value_prev) / Math.abs(mb.value_prev)) * 100, variation_type: "positive" },
    { label: "Despesas", value: desp.value, formatted_value: formatCurrency(Math.abs(desp.value)), variation_pct: ((Math.abs(desp.value) - Math.abs(desp.value_prev)) / Math.abs(desp.value_prev)) * 100, variation_type: "negative" },
    { label: "Resultado", value: res.value, formatted_value: `${formatCurrency(res.value)} (${res.pct_sales}%)`, variation_pct: ((res.value - res.value_prev) / Math.abs(res.value_prev)) * 100, variation_type: "positive" },
  ];

  const unitColumns: ColumnDef<DREByUnit>[] = [
    { key: "unit_name", label: "Unidade" },
    { key: "venda_liquida", label: "Venda Líquida", render: (r) => formatCurrency(r.venda_liquida), getValue: (r) => r.venda_liquida },
    { key: "cmv", label: "CMV", render: (r) => formatCurrency(r.cmv), getValue: (r) => r.cmv },
    { key: "margem_pct", label: "Margem %", render: (r) => <span className={r.margem_pct >= 25 ? "text-green-500" : r.margem_pct < 20 ? "text-red-500" : "text-foreground"}>{formatPercent(r.margem_pct)}</span>, getValue: (r) => r.margem_pct },
    { key: "despesas", label: "Despesas", render: (r) => formatCurrency(r.despesas), getValue: (r) => r.despesas },
    { key: "resultado", label: "Resultado", render: (r) => <span className={r.resultado >= 0 ? "text-green-500" : "text-red-500"}>{formatCurrency(r.resultado)}</span>, getValue: (r) => r.resultado },
    { key: "resultado_pct", label: "Res. %", render: (r) => formatPercent(r.resultado_pct), getValue: (r) => r.resultado_pct },
  ];

  const marginChartData = MARGIN_TREND;
  const unitChartData = [...DRE_BY_UNIT].sort((a, b) => b.margem_pct - a.margem_pct).map(u => ({ name: u.unit_name, margem: u.margem_pct }));

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} columns={5} />

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("/app/dominio/problemas/preco-margem")}>
          <ExternalLink className="h-3 w-3 mr-1" /> Ver problemas de margem
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSection title="Margem no Tempo" subtitle="Evolução da margem bruta %">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={marginChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[20, 28]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="margin_pct" name="Margem %" stroke="hsl(150, 60%, 45%)" strokeWidth={2} />
              <Line type="monotone" dataKey="margin_pct_prev" name="Anterior %" stroke="hsl(150, 60%, 45%)" strokeWidth={1} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Margem por Unidade" subtitle="Ranking de margem bruta %">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={unitChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 40]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              <Bar dataKey="margem" fill="hsl(270, 60%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      <DataTablePro data={DRE_BY_UNIT} columns={unitColumns} />
    </div>
  );
}
