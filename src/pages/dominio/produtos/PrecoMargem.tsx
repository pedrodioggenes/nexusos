import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters, usePendencias } from "@/hooks/useDominioData";
import { usePriceMarginBySKU, useProductCatalog } from "@/hooks/useProductsData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";
import type { KPICardData } from "@/data/dominio/types";

export default function ProdutosPrecoMargem() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendencias();
  const priceMarginData = usePriceMarginBySKU(filters);
  const catalog = useProductCatalog({ ...filters, search: "" });
  const [showModal, setShowModal] = useState(false);

  const skusBelowMin = catalog.filter(p => p.margin_pct! < 20).length;
  const avgMargin = catalog.length > 0 ? catalog.reduce((s, p) => s + p.margin_pct!, 0) / catalog.length : 0;
  const negativeVariation = priceMarginData.filter(p => p.variacao < -5).length;

  const kpiItems: KPICardData[] = [
    { label: "SKUs Abaixo do Mínimo", value: skusBelowMin, formatted_value: skusBelowMin.toString(), variation_pct: -8.5, variation_type: "negative" },
    { label: "Margem Média", value: avgMargin, formatted_value: `${avgMargin.toFixed(1)}%`, variation_pct: 1.2, variation_type: "positive" },
    { label: "Variações Negativas", value: negativeVariation, formatted_value: negativeVariation.toString(), variation_pct: -3.4, variation_type: "positive" },
    { label: "Impacto Negativo", value: 24500, formatted_value: "R$ 24.5k", variation_pct: -15.2, variation_type: "negative" },
  ];

  const handleCreatePendencia = (p: any) => {
    addPendencia({
      title: "Revisar Preço",
      description: p.description,
      responsible: p.responsible,
      due_date: p.due_date,
      status: "open",
      priority: p.priority,
      created_by: "Sistema",
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Preço & Margem</h1>
        <p className="text-muted-foreground">Análise de preços praticados e margens por produto/categoria</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} showCategory={true} />

      <KPIGrid items={kpiItems} columns={4} />

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowModal(true)}
        >
          Criar Pendência "Revisar Preço"
        </Button>
      </div>

      {/* Price & Margin Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-right">Custo</TableHead>
            <TableHead className="text-right">Margem %</TableHead>
            <TableHead className="text-right">Margem R$</TableHead>
            <TableHead className="text-right">Variação</TableHead>
            <TableHead>Unidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {priceMarginData.map((item) => (
            <TableRow key={`${item.sku}-${item.unit_id}`} className="hover:bg-muted/50">
              <TableCell className="font-mono text-xs font-semibold">{item.sku}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="text-right">R$ {item.preco.toFixed(2)}</TableCell>
              <TableCell className="text-right">R$ {item.custo.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Badge variant={item.margem_pct < 20 ? "destructive" : "default"}>
                  {item.margem_pct.toFixed(1)}%
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">R$ {item.margem_r.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {item.variacao < -5 && <TrendingDown className="h-4 w-4" style={{ color: "hsl(var(--destructive))" }} />}
                  <span className={item.variacao < 0 ? "font-semibold" : "text-green-600"} style={{ color: item.variacao < 0 ? "hsl(var(--destructive))" : undefined }}>
                    {item.variacao > 0 ? "+" : ""}{item.variacao.toFixed(1)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>{item.unit_name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreatePendenciaModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={handleCreatePendencia}
        defaults={{
          title: "Revisar Preço",
        }}
      />
    </div>
  );
}
