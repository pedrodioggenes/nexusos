import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { ENTRADAS_SAIDAS } from "@/data/dominio/pessoas-mock";
import type { KPICardData } from "@/data/dominio/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus } from "lucide-react";

export default function PessoasEntradasSaidas() {
  const { filters, updateFilter } = useGlobalFilters();

  const totalEntradas = ENTRADAS_SAIDAS.reduce((s, e) => s + e.entradas, 0);
  const totalSaidas = ENTRADAS_SAIDAS.reduce((s, e) => s + e.saidas, 0);
  const saldo = totalEntradas - totalSaidas;
  const unidadesComSaida = ENTRADAS_SAIDAS.filter((e) => e.saidas > 0);

  const kpiItems: KPICardData[] = [
    { label: "Entradas (admissões)", value: totalEntradas, formatted_value: totalEntradas.toString(), variation_type: "positive" },
    { label: "Saídas (desligamentos)", value: totalSaidas, formatted_value: totalSaidas.toString(), variation_type: "negative" },
    { label: "Saldo do Período", value: saldo, formatted_value: `${saldo >= 0 ? "+" : ""}${saldo}`, variation_type: saldo >= 0 ? "positive" : "negative" },
    { label: "Unidades com Saída", value: unidadesComSaida.length, formatted_value: unidadesComSaida.length.toString(), variation_type: "neutral" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Entradas & Saídas</h1>
        <p className="text-muted-foreground">Quem entrou e quem saiu da rede neste período</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpiItems} columns={4} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unidade</TableHead>
            <TableHead className="text-center">Entradas</TableHead>
            <TableHead className="text-center">Saídas</TableHead>
            <TableHead className="text-center">Saldo</TableHead>
            <TableHead>Mês</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ENTRADAS_SAIDAS.map((e) => (
            <TableRow key={e.unit_id}>
              <TableCell className="font-semibold">{e.unit_name}</TableCell>
              <TableCell className="text-center">
                {e.entradas > 0 ? (
                  <Badge variant="default" className="gap-1">
                    <UserPlus className="h-3 w-3" /> {e.entradas}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {e.saidas > 0 ? (
                  <Badge variant="destructive" className="gap-1">
                    <UserMinus className="h-3 w-3" /> {e.saidas}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-bold ${e.saldo > 0 ? "text-primary" : e.saldo < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {e.saldo >= 0 ? "+" : ""}{e.saldo}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{e.mes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
