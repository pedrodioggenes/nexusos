import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { FALTAS_ATRASOS } from "@/data/dominio/pessoas-mock";
import type { KPICardData } from "@/data/dominio/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SparklineChart } from "@/components/dominio/SparklineChart";
import { Plus, AlertTriangle } from "lucide-react";

export default function PessoasFaltasAtrasos() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<Record<string, string>>({});

  const totalFaltas = FALTAS_ATRASOS.reduce((s, f) => s + f.faltas, 0);
  const totalAtrasos = FALTAS_ATRASOS.reduce((s, f) => s + f.atrasos, 0);
  const criticas = FALTAS_ATRASOS.filter((f) => f.faltas > 12 || f.atrasos > 18);
  const pior = [...FALTAS_ATRASOS].sort((a, b) => (b.faltas + b.atrasos) - (a.faltas + a.atrasos))[0];

  const kpiItems: KPICardData[] = [
    { label: "Total de Faltas", value: totalFaltas, formatted_value: totalFaltas.toString(), variation_pct: -5.2, variation_type: "negative" },
    { label: "Total de Atrasos", value: totalAtrasos, formatted_value: totalAtrasos.toString(), variation_pct: -3.1, variation_type: "negative" },
    { label: "Unidades Críticas", value: criticas.length, formatted_value: criticas.length.toString(), variation_type: criticas.length > 2 ? "negative" : "positive" },
    { label: "Pior Unidade", value: pior.unit_name, formatted_value: pior.unit_name, impact_label: `${pior.faltas + pior.atrasos} ocorrências` },
  ];

  const openPendencia = (unitName: string) => {
    setCreateDefaults({
      title: `Tratar disciplina: ${unitName}`,
      description: `Verificar faltas e atrasos recorrentes na unidade ${unitName}. Conversar com líderes e aplicar medidas.`,
      priority: "medium",
    });
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Faltas & Atrasos</h1>
        <p className="text-muted-foreground">Quantas faltas e atrasos cada unidade teve no período</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpiItems} columns={4} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unidade</TableHead>
            <TableHead className="text-center">Faltas</TableHead>
            <TableHead className="text-center">Atrasos</TableHead>
            <TableHead>Tendência Faltas</TableHead>
            <TableHead>Tendência Atrasos</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...FALTAS_ATRASOS].sort((a, b) => (b.faltas + b.atrasos) - (a.faltas + a.atrasos)).map((f) => {
            const isCritical = f.faltas > 12 || f.atrasos > 18;
            return (
              <TableRow key={f.unit_id} className={isCritical ? "bg-destructive/5" : ""}>
                <TableCell className="font-semibold">
                  {f.unit_name}
                  {isCritical && <AlertTriangle className="inline h-3 w-3 ml-1 text-destructive" />}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={f.faltas > 12 ? "destructive" : "secondary"}>{f.faltas}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={f.atrasos > 18 ? "destructive" : "secondary"}>{f.atrasos}</Badge>
                </TableCell>
                <TableCell>
                  <SparklineChart data={f.trend_faltas} color="hsl(var(--destructive))" height={28} />
                </TableCell>
                <TableCell>
                  <SparklineChart data={f.trend_atrasos} color="hsl(var(--primary))" height={28} />
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openPendencia(f.unit_name)}>
                    <Plus className="h-3 w-3 mr-1" /> Pendência
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
