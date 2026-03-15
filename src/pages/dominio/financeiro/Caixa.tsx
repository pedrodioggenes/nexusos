import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { CASH_FLOW_PROJECTION, CASH_MOVEMENTS, formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData, CashMovement } from "@/data/dominio/types";
import { Badge } from "@/components/ui/badge";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";

const currFmt = (v: number) => { if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`; if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`; return String(v); };

export default function FinanceiroCaixa() {
  const { filters, updateFilter } = useGlobalFilters();

  const cashData = CASH_FLOW_PROJECTION;
  const currentSaldo = cashData[0]?.saldo || 0;
  const projectedSaldo = cashData[cashData.length - 1]?.saldo || 0;
  const totalEntradas = cashData.reduce((s, d) => s + d.entradas, 0);
  const totalSaidas = cashData.reduce((s, d) => s + d.saidas, 0);

  const kpiItems: KPICardData[] = [
    { label: "Saldo Atual", value: currentSaldo, formatted_value: formatCurrency(currentSaldo), variation_type: "positive" },
    { label: "Entradas Previstas", value: totalEntradas, formatted_value: formatCurrency(totalEntradas), variation_type: "positive" },
    { label: "Saídas Previstas", value: totalSaidas, formatted_value: formatCurrency(totalSaidas), variation_type: "negative" },
    { label: "Saldo Projetado", value: projectedSaldo, formatted_value: formatCurrency(projectedSaldo), variation_pct: ((projectedSaldo - currentSaldo) / currentSaldo) * 100, variation_type: projectedSaldo >= currentSaldo ? "positive" : "negative" },
  ];

  const movColumns: ColumnDef<CashMovement>[] = [
    { key: "date", label: "Data" },
    { key: "type", label: "Tipo", render: (r) => <Badge variant={r.type === "entrada" ? "default" : "secondary"} className="text-[10px]">{r.type === "entrada" ? "Entrada" : "Saída"}</Badge> },
    { key: "description", label: "Descrição" },
    { key: "value", label: "Valor", render: (r) => <span className={r.type === "entrada" ? "text-green-500" : "text-red-500"}>{r.type === "saida" ? "-" : "+"}{formatCurrency(r.value)}</span>, getValue: (r) => r.type === "entrada" ? r.value : -r.value },
    { key: "unit_name", label: "Unidade" },
    { key: "category", label: "Categoria" },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} />

      <ChartSection title="Projeção de Caixa" subtitle="Saldo projetado por dia (14 dias)">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={cashData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tickFormatter={currFmt} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip formatter={(v: number) => `R$ ${currFmt(v)}`} />
            <Legend />
            <Area type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(270, 60%, 55%)" fill="hsl(270, 60%, 55%)" fillOpacity={0.15} strokeWidth={2} />
            <Line type="monotone" dataKey="entradas" name="Entradas" stroke="hsl(150, 60%, 45%)" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="saidas" name="Saídas" stroke="hsl(350, 70%, 55%)" strokeWidth={1} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartSection>

      <DataTablePro data={CASH_MOVEMENTS} columns={movColumns} />
    </div>
  );
}
