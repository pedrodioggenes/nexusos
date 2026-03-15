import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { SparklineChart } from "@/components/dominio/SparklineChart";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { useGiroCobertura } from "@/hooks/useProductsData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { KPICardData } from "@/data/dominio/types";

export default function ProdutosGiroCobertura() {
  const { filters, updateFilter } = useGlobalFilters();
  const giroData = useGiroCobertura();

  const altoCobertura = giroData.filter(g => g.cobertura_dias > 40).length;
  const baixoGiro = giroData.filter(g => g.giro < 15).length;
  const capitalParado = giroData.reduce((s, g) => s + (g.giro * 100), 0);

  const kpiItems: KPICardData[] = [
    { label: "SKUs com Alta Cobertura", value: altoCobertura, formatted_value: altoCobertura.toString(), variation_pct: 0, variation_type: "neutral" },
    { label: "SKUs com Baixo Giro", value: baixoGiro, formatted_value: baixoGiro.toString(), variation_pct: -5, variation_type: "positive" },
    { label: "Capital Parado (est.)", value: capitalParado, formatted_value: `R$ ${(capitalParado / 1000).toFixed(0)}k`, variation_pct: 3.2, variation_type: "neutral" },
    { label: "Giro Médio", value: 28.5, formatted_value: "28.5 dias", variation_pct: 2.1, variation_type: "positive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Giro & Cobertura</h1>
        <p className="text-muted-foreground">Análise de giro de estoque e dias de cobertura por produto</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} columns={4} />

      {/* Giro & Cobertura Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="text-right">Cobertura (dias)</TableHead>
            <TableHead className="text-right">Giro (dias)</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tendência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {giroData.map((item) => (
            <TableRow key={item.sku} className="hover:bg-muted/50">
              <TableCell className="font-mono text-xs font-semibold">{item.sku}</TableCell>
              <TableCell className="max-w-xs truncate">{item.name}</TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={item.cobertura_dias > 40 ? "destructive" : item.cobertura_dias > 25 ? "secondary" : "default"}
                >
                  {item.cobertura_dias}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">{item.giro}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="w-20">
                <SparklineChart data={item.trend} width={60} height={24} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
