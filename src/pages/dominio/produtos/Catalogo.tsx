import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { SKUDetailsDrawer } from "@/components/dominio/SKUDetailsDrawer";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { useProductCatalog } from "@/hooks/useProductsData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { ProductDim, ProductMetrics } from "@/data/dominio/types";
import type { KPICardData } from "@/data/dominio/types";

export default function ProdutosCatalogo() {
  const { filters, updateFilter } = useGlobalFilters();
  const [selectedSKU, setSelectedSKU] = useState<(ProductDim & ProductMetrics) | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const products = useProductCatalog({ ...filters, search: filters.search });

  const totalSKUs = products.length;
  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + p.margin_pct, 0) / products.length
    : 0;
  const skusCritical = products.filter(p => p.margin_pct < 20).length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);

  const kpiItems: KPICardData[] = [
    { label: "SKUs Catalogados", value: totalSKUs, formatted_value: totalSKUs.toString(), variation_pct: 0, variation_type: "neutral" },
    { label: "Margem Média", value: avgMargin, formatted_value: `${avgMargin.toFixed(1)}%`, variation_pct: 2.3, variation_type: "positive" },
    { label: "SKUs Críticos", value: skusCritical, formatted_value: skusCritical.toString(), variation_pct: -15, variation_type: "positive" },
    { label: "Unidades em Estoque", value: totalStock, formatted_value: (totalStock / 1000).toFixed(0) + "k", variation_pct: 8.5, variation_type: "positive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catálogo (SKU)</h1>
        <p className="text-muted-foreground">Visão completa do catálogo de produtos e SKUs ativos</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} showCategory={true} />

      <KPIGrid items={kpiItems} columns={4} />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por SKU, nome ou marca..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Products Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-right">Margem %</TableHead>
            <TableHead className="text-right">Estoque</TableHead>
            <TableHead className="text-right">Giro</TableHead>
            <TableHead className="text-center">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.sku} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-mono text-xs font-semibold">{product.sku}</TableCell>
              <TableCell className="max-w-xs truncate">{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell className="text-right">R$ {product.price?.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <span className={product.margin_pct! < 20 ? "text-red-600 font-semibold" : "text-green-600"}>
                  {product.margin_pct?.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell className="text-right">{product.stock}</TableCell>
              <TableCell className="text-right">{product.giro} dias</TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSKU(product as ProductDim & ProductMetrics);
                    setDrawerOpen(true);
                  }}
                >
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SKUDetailsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} sku={selectedSKU} />
    </div>
  );
}
