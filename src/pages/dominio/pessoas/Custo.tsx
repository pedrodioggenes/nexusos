import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { CUSTO_PESSOAL } from "@/data/dominio/pessoas-mock";
import { formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData } from "@/data/dominio/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SparklineChart } from "@/components/dominio/SparklineChart";

export default function PessoasCusto() {
  const { filters, updateFilter } = useGlobalFilters();

  const totalCusto = CUSTO_PESSOAL.reduce((s, c) => s + c.custo, 0);
  const totalCustoPrev = CUSTO_PESSOAL.reduce((s, c) => s + c.custo_prev, 0);
  const varPct = ((totalCusto - totalCustoPrev) / totalCustoPrev) * 100;
  const avgPctVenda = CUSTO_PESSOAL.reduce((s, c) => s + c.pct_venda, 0) / CUSTO_PESSOAL.length;
  const maiorCusto = [...CUSTO_PESSOAL].sort((a, b) => b.pct_venda - a.pct_venda)[0];

  const kpiItems: KPICardData[] = [
    { label: "Custo Total", value: totalCusto, formatted_value: formatCurrency(totalCusto), variation_pct: +varPct.toFixed(1), variation_type: varPct > 5 ? "negative" : "neutral" },
    { label: "% sobre Venda (média)", value: avgPctVenda, formatted_value: `${avgPctVenda.toFixed(1)}%`, variation_pct: 0, variation_type: "neutral" },
    { label: "Maior % Venda", value: maiorCusto.unit_name, formatted_value: maiorCusto.unit_name, impact_label: `${maiorCusto.pct_venda}%` },
    { label: "Variação vs Anterior", value: varPct, formatted_value: `${varPct >= 0 ? "+" : ""}${varPct.toFixed(1)}%`, variation_type: varPct > 5 ? "negative" : "positive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Custo de Pessoal</h1>
        <p className="text-muted-foreground">Quanto cada unidade gasta com folha de pagamento</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpiItems} columns={4} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unidade</TableHead>
            <TableHead className="text-right">Custo (R$)</TableHead>
            <TableHead className="text-right">Mês Anterior</TableHead>
            <TableHead className="text-center">% sobre Venda</TableHead>
            <TableHead>Tendência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...CUSTO_PESSOAL].sort((a, b) => b.custo - a.custo).map((c) => (
            <TableRow key={c.unit_id}>
              <TableCell className="font-semibold">{c.unit_name}</TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(c.custo)}</TableCell>
              <TableCell className="text-right text-muted-foreground">{formatCurrency(c.custo_prev)}</TableCell>
              <TableCell className="text-center">
                <Badge variant={c.pct_venda > 16 ? "destructive" : c.pct_venda > 14 ? "secondary" : "default"}>
                  {c.pct_venda}%
                </Badge>
              </TableCell>
              <TableCell>
                <SparklineChart data={c.trend} color="hsl(var(--primary))" height={28} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
