import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { ENTREGAS } from "@/data/dominio/compras-mock";
import { SparklineChart } from "@/components/dominio/SparklineChart";
import type { KPICardData } from "@/data/dominio/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle } from "lucide-react";

export default function ComprasEntregas() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<Record<string, string>>({});

  const sorted = [...ENTREGAS].sort((a, b) => a.on_time_pct - b.on_time_pct);
  const criticos = sorted.filter((e) => e.on_time_pct < 80);
  const avgAtraso = sorted.reduce((s, e) => s + e.atraso_medio_dias, 0) / sorted.length;
  const totalOcorrencias = sorted.reduce((s, e) => s + e.ocorrencias, 0);
  const avgFaltas = sorted.reduce((s, e) => s + e.pct_faltas, 0) / sorted.length;

  const kpiItems: KPICardData[] = [
    { label: "Fornecedores Críticos", value: criticos.length, formatted_value: criticos.length.toString(), variation_pct: criticos.length > 2 ? -15 : 5, variation_type: criticos.length > 2 ? "negative" : "positive" },
    { label: "Atraso Médio", value: avgAtraso, formatted_value: `${avgAtraso.toFixed(1)} dias`, variation_pct: -3.2, variation_type: "negative" },
    { label: "Ocorrências", value: totalOcorrencias, formatted_value: totalOcorrencias.toString(), variation_pct: -8, variation_type: "negative" },
    { label: "% Faltas (média)", value: avgFaltas, formatted_value: `${avgFaltas.toFixed(1)}%`, variation_pct: 2.1, variation_type: "negative" },
  ];

  const openPendencia = (supplierName: string) => {
    setCreateDefaults({ title: `Cobrar fornecedor: ${supplierName}`, description: `Pendência de performance de entrega para ${supplierName}`, priority: "high" });
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Entregas (Performance)</h1>
        <p className="text-muted-foreground">Performance de entregas dos fornecedores e pontualidade</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpiItems} columns={4} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fornecedor</TableHead>
            <TableHead className="text-center">On-Time (%)</TableHead>
            <TableHead className="text-center">Atraso Médio</TableHead>
            <TableHead className="text-center">% Faltas</TableHead>
            <TableHead className="text-center">Ocorrências</TableHead>
            <TableHead>Tendência</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((e) => {
            const isCritical = e.on_time_pct < 80;
            return (
              <TableRow key={e.id} className={isCritical ? "bg-destructive/5" : ""}>
                <TableCell className="font-semibold">
                  {e.supplier_name}
                  {isCritical && <AlertTriangle className="inline h-3 w-3 ml-1 text-destructive" />}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={e.on_time_pct >= 90 ? "default" : e.on_time_pct >= 80 ? "secondary" : "destructive"}>
                    {e.on_time_pct}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-medium">{e.atraso_medio_dias} dias</TableCell>
                <TableCell className="text-center">{e.pct_faltas}%</TableCell>
                <TableCell className="text-center">{e.ocorrencias}</TableCell>
                <TableCell>
                  <SparklineChart data={e.trend.map(Number)} color={isCritical ? "hsl(var(--destructive))" : "hsl(var(--primary))"} height={28} />
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openPendencia(e.supplier_name)}>
                    <Plus className="h-3 w-3 mr-1" /> Cobrar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <CreatePendenciaModal open={createOpen} onOpenChange={setCreateOpen} onSubmit={(p) => { addPendencia(p); setCreateOpen(false); }} defaults={createDefaults} />
    </div>
  );
}
