import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { HEADCOUNT } from "@/data/dominio/pessoas-mock";
import type { KPICardData } from "@/data/dominio/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function PessoasEquipe() {
  const { filters, updateFilter } = useGlobalFilters();

  const total = HEADCOUNT.reduce((s, h) => s + h.quantidade, 0);
  const totalPrev = HEADCOUNT.reduce((s, h) => s + h.quantidade_prev, 0);
  const variacao = total - totalPrev;
  const maiorUnidade = [...HEADCOUNT].sort((a, b) => b.quantidade - a.quantidade)[0];
  const menorUnidade = [...HEADCOUNT].sort((a, b) => a.quantidade - b.quantidade)[0];

  const kpiItems: KPICardData[] = [
    { label: "Total de Funcionários", value: total, formatted_value: total.toString(), variation_pct: +((variacao / totalPrev) * 100).toFixed(1) as unknown as number, variation_type: variacao >= 0 ? "positive" : "negative" },
    { label: "Variação no Período", value: variacao, formatted_value: `${variacao >= 0 ? "+" : ""}${variacao}`, variation_type: variacao >= 0 ? "positive" : "negative" },
    { label: "Maior Equipe", value: maiorUnidade.unit_name, formatted_value: maiorUnidade.unit_name, impact_label: `${maiorUnidade.quantidade} pessoas` },
    { label: "Menor Equipe", value: menorUnidade.unit_name, formatted_value: menorUnidade.unit_name, impact_label: `${menorUnidade.quantidade} pessoas` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Equipe (Quantidade)</h1>
        <p className="text-muted-foreground">Quantas pessoas trabalham em cada unidade da rede</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpiItems} columns={4} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unidade</TableHead>
            <TableHead className="text-right">Funcionários</TableHead>
            <TableHead className="text-right">Mês Anterior</TableHead>
            <TableHead className="text-center">Variação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {HEADCOUNT.map((h) => (
            <TableRow key={h.unit_id}>
              <TableCell className="font-semibold">{h.unit_name}</TableCell>
              <TableCell className="text-right text-lg font-bold">{h.quantidade}</TableCell>
              <TableCell className="text-right text-muted-foreground">{h.quantidade_prev}</TableCell>
              <TableCell className="text-center">
                <Badge variant={h.variacao > 0 ? "default" : h.variacao < 0 ? "destructive" : "secondary"} className="gap-1">
                  {h.variacao > 0 ? <TrendingUp className="h-3 w-3" /> : h.variacao < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {h.variacao >= 0 ? "+" : ""}{h.variacao}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
