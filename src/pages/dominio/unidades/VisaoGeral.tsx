import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection, UnitRankingChart, SalesMarginScatter } from "@/components/dominio/ChartSection";
import { UnitDetailsDrawer } from "@/components/dominio/DetailsDrawer";
import { useGlobalFilters, useUnitsSummary } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { UNITS, formatCurrency, formatPercent } from "@/data/dominio/mock-data";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SparklineChart } from "@/components/dominio/SparklineChart";
import type { UnitSummary, KPICardData } from "@/data/dominio/types";
import { Eye } from "lucide-react";

export default function UnidadesVisaoGeral() {
  const { filters, updateFilter } = useGlobalFilters();
  const units = useUnitsSummary(filters);
  const { addPendencia } = usePendenciasStore();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitSummary | null>(null);

  const sorted = [...units].sort((a, b) => b.sales - a.sales);
  const bestSales = sorted[0];
  const worstSales = sorted[sorted.length - 1];
  const bestMargin = [...units].sort((a, b) => b.margin_pct - a.margin_pct)[0];
  const worstLosses = [...units].sort((a, b) => b.losses_value - a.losses_value)[0];
  const worstRupture = [...units].sort((a, b) => b.rupture_count - a.rupture_count)[0];

  const kpis: KPICardData[] = [
    { label: "Melhor Venda", value: bestSales?.sales || 0, formatted_value: `${bestSales?.name} — ${formatCurrency(bestSales?.sales || 0)}`, variation_type: "positive" },
    { label: "Pior Venda", value: worstSales?.sales || 0, formatted_value: `${worstSales?.name} — ${formatCurrency(worstSales?.sales || 0)}`, variation_type: "negative" },
    { label: "Melhor Margem", value: bestMargin?.margin_pct || 0, formatted_value: `${bestMargin?.name} — ${formatPercent(bestMargin?.margin_pct || 0)}`, variation_type: "positive" },
    { label: "Maior Perda", value: worstLosses?.losses_value || 0, formatted_value: `${worstLosses?.name} — ${formatCurrency(worstLosses?.losses_value || 0)}`, variation_type: "negative" },
    { label: "Maior Ruptura", value: worstRupture?.rupture_count || 0, formatted_value: `${worstRupture?.name} — ${worstRupture?.rupture_count || 0} itens`, variation_type: "negative" },
  ];

  const openDrawer = (u: UnitSummary) => {
    setSelectedUnit(u);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpis} columns={3} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartSection title="Ranking de Unidades" subtitle="Vendas por unidade">
          <UnitRankingChart data={units} />
        </ChartSection>
        <ChartSection title="Venda × Margem" subtitle="Bolha = perdas">
          <SalesMarginScatter data={units} />
        </ChartSection>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Venda</TableHead>
              <TableHead className="text-right">Margem</TableHead>
              <TableHead className="text-right">Perdas</TableHead>
              <TableHead className="text-right">Ruptura</TableHead>
              <TableHead className="text-right">Alertas</TableHead>
              <TableHead className="text-right">Tendência</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(u => (
              <TableRow key={u.id} className="cursor-pointer" onClick={() => openDrawer(u)}>
                <TableCell className="font-medium text-sm">{u.name}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(u.sales)}</TableCell>
                <TableCell className="text-right text-sm">{formatPercent(u.margin_pct)}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(u.losses_value)}</TableCell>
                <TableCell className="text-right text-sm">{u.rupture_count}</TableCell>
                <TableCell className="text-right">
                  {u.alerts_count > 0 ? (
                    <Badge variant={u.alerts_count >= 5 ? "destructive" : "secondary"} className="text-[10px]">{u.alerts_count}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-right"><SparklineChart data={u.trend} width={60} height={20} /></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={e => { e.stopPropagation(); openDrawer(u); }}>
                    <Eye className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UnitDetailsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} unit={selectedUnit} onCreatePendencia={addPendencia} />
    </div>
  );
}
