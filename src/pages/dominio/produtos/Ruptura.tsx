import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters, usePendencias } from "@/hooks/useDominioData";
import { useRuptures } from "@/hooks/useProductsData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import type { KPICardData } from "@/data/dominio/types";

export default function ProdutosRuptura() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendencias();
  const ruptures = useRuptures();
  const [selectedRuptures, setSelectedRuptures] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const totalRuptures = ruptures.length;
  const affectedUnits = new Set(ruptures.map(r => r.unit_id)).size;
  const totalImpact = ruptures.reduce((s, r) => s + r.impacto_estimado, 0);

  const kpiItems: KPICardData[] = [
    { label: "SKUs em Ruptura", value: totalRuptures, formatted_value: totalRuptures.toString(), variation_pct: -12.5, variation_type: "negative" },
    { label: "Unidades Afetadas", value: affectedUnits, formatted_value: affectedUnits.toString(), variation_pct: 0, variation_type: "neutral" },
    { label: "Impacto Estimado", value: totalImpact, formatted_value: `R$ ${(totalImpact / 1000).toFixed(0)}k`, variation_pct: -8.3, variation_type: "negative" },
    { label: "Prazo Médio", value: 3.1, formatted_value: "3.1 dias", variation_pct: 5.2, variation_type: "positive" },
  ];

  const handleSelectAll = () => {
    if (selectedRuptures.length === ruptures.length) {
      setSelectedRuptures([]);
    } else {
      setSelectedRuptures(ruptures.map(r => r.sku));
    }
  };

  const toggleRupture = (sku: string) => {
    setSelectedRuptures(prev => 
      prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]
    );
  };

  const handleCreatePendencia = (p: any) => {
    addPendencia({
      title: `Resolver ruptura (${selectedRuptures.length} SKUs)`,
      description: p.description,
      responsible: p.responsible,
      due_date: p.due_date,
      status: "open",
      priority: p.priority,
      created_by: "Sistema",
    });
    setShowModal(false);
    setSelectedRuptures([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ruptura</h1>
        <p className="text-muted-foreground">Monitoramento de rupturas de estoque e impacto nas vendas</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} columns={4} />

      {/* Actions */}
      {selectedRuptures.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowModal(true)}
          >
            Criar Pendência ({selectedRuptures.length})
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSelectedRuptures([])}
          >
            Limpar seleção
          </Button>
        </div>
      )}

      {/* Ruptures Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedRuptures.length === ruptures.length && ruptures.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead className="text-right">Dias s/ Estoque</TableHead>
            <TableHead className="text-right">Venda Média</TableHead>
            <TableHead className="text-right">Impacto (R$)</TableHead>
            <TableHead>Fornecedor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ruptures.map((rupture) => (
            <TableRow key={rupture.sku} className="hover:bg-muted/50">
              <TableCell>
                <Checkbox
                  checked={selectedRuptures.includes(rupture.sku)}
                  onCheckedChange={() => toggleRupture(rupture.sku)}
                />
              </TableCell>
              <TableCell className="font-mono text-xs font-semibold">{rupture.sku}</TableCell>
              <TableCell className="max-w-xs truncate">{rupture.name}</TableCell>
              <TableCell>{rupture.unit_name}</TableCell>
              <TableCell className="text-right font-semibold flex items-center justify-end gap-1">
                <AlertTriangle className="h-3 w-3" style={{ color: "hsl(var(--destructive))" }} />
                {rupture.dias_sem_estoque}
              </TableCell>
              <TableCell className="text-right">{rupture.venda_media} un/dia</TableCell>
              <TableCell className="text-right font-semibold">R$ {rupture.impacto_estimado.toLocaleString()}</TableCell>
              <TableCell>{rupture.fornecedor}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreatePendenciaModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={handleCreatePendencia}
        defaults={{
          title: `Resolver ruptura (${selectedRuptures.length} SKUs)`,
        }}
      />
    </div>
  );
}
