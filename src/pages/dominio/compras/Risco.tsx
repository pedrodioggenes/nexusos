import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { RISCOS } from "@/data/dominio/compras-mock";
import type { KPICardData } from "@/data/dominio/types";
import type { RiscoAbastecimento } from "@/data/dominio/compras-mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShieldAlert, AlertTriangle, RefreshCw } from "lucide-react";

const RISCO_VARIANT: Record<string, "destructive" | "secondary" | "outline"> = {
  alto: "destructive",
  medio: "secondary",
  baixo: "outline",
};

const RISCO_LABEL: Record<string, string> = {
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export default function ComprasRisco() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<Record<string, string>>({});

  const altos = RISCOS.filter((r) => r.risco === "alto");
  const medios = RISCOS.filter((r) => r.risco === "medio");
  const comRuptura = RISCOS.filter((r) => r.ruptura_recorrente);
  const fornecedorUnico = RISCOS.filter((r) => r.fornecedores_count === 1);

  const kpiItems: KPICardData[] = [
    { label: "Risco Alto", value: altos.length, formatted_value: altos.length.toString(), variation_pct: -20, variation_type: "negative", icon: "alert" },
    { label: "Risco Médio", value: medios.length, formatted_value: medios.length.toString(), variation_pct: 0, variation_type: "neutral" },
    { label: "Ruptura Recorrente", value: comRuptura.length, formatted_value: comRuptura.length.toString(), variation_pct: -10, variation_type: "negative" },
    { label: "Fornecedor Único", value: fornecedorUnico.length, formatted_value: fornecedorUnico.length.toString(), variation_pct: 0, variation_type: "neutral" },
  ];

  const openPendencia = (r: RiscoAbastecimento) => {
    setCreateDefaults({
      title: `Plano de contingência: ${r.item}`,
      description: `Risco ${r.risco} em ${r.category}. ${r.evidencia}. Dependência principal: ${r.dependencia_principal}.`,
      priority: r.risco === "alto" ? "high" : "medium",
    });
    setCreateOpen(true);
  };

  const filtered = filters.search
    ? RISCOS.filter((r) => r.item.toLowerCase().includes(filters.search.toLowerCase()) || r.category.toLowerCase().includes(filters.search.toLowerCase()))
    : RISCOS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Risco de Abastecimento</h1>
        <p className="text-muted-foreground">Análise de riscos na cadeia de suprimentos e dependência de fornecedores</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpiItems} columns={4} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item / Categoria</TableHead>
            <TableHead className="text-center">Risco</TableHead>
            <TableHead>Evidência</TableHead>
            <TableHead>Dependência Principal</TableHead>
            <TableHead className="text-center">Fornecedores</TableHead>
            <TableHead className="text-center">Ruptura</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id} className={r.risco === "alto" ? "bg-destructive/5" : ""}>
              <TableCell>
                <div>
                  <p className="font-semibold text-sm">{r.item}</p>
                  <p className="text-xs text-muted-foreground">{r.category}</p>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={RISCO_VARIANT[r.risco]}>{RISCO_LABEL[r.risco]}</Badge>
              </TableCell>
              <TableCell className="text-xs max-w-xs">{r.evidencia}</TableCell>
              <TableCell className="font-medium text-sm">{r.dependencia_principal}</TableCell>
              <TableCell className="text-center">
                <Badge variant={r.fornecedores_count === 1 ? "destructive" : "outline"}>
                  {r.fornecedores_count}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {r.ruptura_recorrente ? (
                  <RefreshCw className="h-4 w-4 text-destructive mx-auto" />
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm">{r.unit_name}</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openPendencia(r)}>
                  <Plus className="h-3 w-3 mr-1" /> Contingência
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreatePendenciaModal open={createOpen} onOpenChange={setCreateOpen} onSubmit={(p) => { addPendencia(p); setCreateOpen(false); }} defaults={createDefaults} />
    </div>
  );
}
