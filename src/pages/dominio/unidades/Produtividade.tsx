import { useMemo } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection } from "@/components/dominio/ChartSection";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { UNITS, formatCurrency, formatNumber } from "@/data/dominio/mock-data";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SparklineChart } from "@/components/dominio/SparklineChart";
import { Badge } from "@/components/ui/badge";
import type { KPICardData } from "@/data/dominio/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const COLORS = [
  "hsl(270, 60%, 55%)", "hsl(200, 70%, 55%)", "hsl(150, 60%, 45%)",
  "hsl(40, 80%, 55%)", "hsl(350, 70%, 55%)", "hsl(180, 50%, 45%)",
  "hsl(290, 50%, 50%)"
];

interface ProdMetric {
  unit_id: string;
  unit_name: string;
  vendas_m2: number;
  vendas_func: number;
  cupons_hora: number;
  itens_func: number;
  trend: number[];
}

function generateProdData(): ProdMetric[] {
  return UNITS.map(u => {
    const area = u.id === "u1" ? 2200 : u.id === "u2" ? 1800 : u.id === "u3" ? 1500 : u.id === "u4" ? 1600 : u.id === "u5" ? 1400 : u.id === "u6" ? 1100 : 800;
    const funcs = u.id === "u1" ? 85 : u.id === "u2" ? 72 : u.id === "u3" ? 58 : u.id === "u4" ? 65 : u.id === "u5" ? 55 : u.id === "u6" ? 42 : 35;
    const cupons = Math.round(u.sales / u.avg_ticket);
    const horasOp = 14 * 30;
    return {
      unit_id: u.id,
      unit_name: u.name,
      vendas_m2: Math.round(u.sales / area),
      vendas_func: Math.round(u.sales / funcs),
      cupons_hora: Math.round((cupons / horasOp) * 10) / 10,
      itens_func: Math.round((cupons * 4.5) / funcs),
      trend: u.trend.map(v => Math.round(v / area)),
    };
  });
}

export default function UnidadesProdutividade() {
  const { filters, updateFilter } = useGlobalFilters();
  const data = useMemo(() => generateProdData(), []);

  const bestVendasM2 = [...data].sort((a, b) => b.vendas_m2 - a.vendas_m2)[0];
  const bestVendasFunc = [...data].sort((a, b) => b.vendas_func - a.vendas_func)[0];
  const bestCuponsHora = [...data].sort((a, b) => b.cupons_hora - a.cupons_hora)[0];
  const avgVendasM2 = Math.round(data.reduce((s, d) => s + d.vendas_m2, 0) / data.length);

  const kpis: KPICardData[] = [
    { label: "Melhor Venda/m²", value: bestVendasM2.vendas_m2, formatted_value: `${bestVendasM2.unit_name} — R$ ${formatNumber(bestVendasM2.vendas_m2)}/m²`, variation_type: "positive" },
    { label: "Melhor Venda/Func.", value: bestVendasFunc.vendas_func, formatted_value: `${bestVendasFunc.unit_name} — ${formatCurrency(bestVendasFunc.vendas_func)}/func`, variation_type: "positive" },
    { label: "Melhor Cupons/Hora", value: bestCuponsHora.cupons_hora, formatted_value: `${bestCuponsHora.unit_name} — ${bestCuponsHora.cupons_hora}/h`, variation_type: "positive" },
    { label: "Média Venda/m²", value: avgVendasM2, formatted_value: `R$ ${formatNumber(avgVendasM2)}/m²` },
  ];

  const chartData = [...data].sort((a, b) => b.vendas_m2 - a.vendas_m2).map(d => ({
    name: d.unit_name,
    vendas_m2: d.vendas_m2,
  }));

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpis} columns={4} />

      <ChartSection title="Vendas por m²" subtitle="Ranking de produtividade por unidade">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} stroke="hsl(var(--muted-foreground))" />
            <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString()}/m²`} />
            <Bar dataKey="vendas_m2" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Venda/m²</TableHead>
              <TableHead className="text-right">Venda/Func.</TableHead>
              <TableHead className="text-right">Cupons/h</TableHead>
              <TableHead className="text-right">Itens/Func.</TableHead>
              <TableHead className="text-right">Tendência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...data].sort((a, b) => b.vendas_m2 - a.vendas_m2).map(d => (
              <TableRow key={d.unit_id}>
                <TableCell className="font-medium text-sm">{d.unit_name}</TableCell>
                <TableCell className="text-right text-sm">R$ {d.vendas_m2.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(d.vendas_func)}</TableCell>
                <TableCell className="text-right text-sm">{d.cupons_hora}</TableCell>
                <TableCell className="text-right text-sm">{d.itens_func.toLocaleString()}</TableCell>
                <TableCell className="text-right"><SparklineChart data={d.trend} width={60} height={20} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground italic">
        Dados de área (m²) e funcionários são estimativas mock. Com integração ERP, serão valores reais.
      </p>
    </div>
  );
}
