import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection, TrendChart, WaterfallChart } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { useGlobalFilters, useEvolutionDrivers, useTrendData } from "@/hooks/useDominioData";
import { formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData, EvolutionDriver } from "@/data/dominio/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

function generateSummary(drivers: EvolutionDriver[]): string {
  const positive = drivers.filter(d => d.delta > 0).sort((a, b) => b.delta - a.delta);
  const negative = drivers.filter(d => d.delta < 0).sort((a, b) => a.delta - b.delta);
  const totalDelta = drivers.reduce((s, d) => s + d.delta, 0);
  const totalPrev = drivers.reduce((s, d) => s + d.previous, 0);
  const pctGrowth = ((totalDelta / totalPrev) * 100).toFixed(1);

  const top1 = positive[0];
  const top2 = positive[1];
  const bot1 = negative[0];
  const bot2 = negative[1];
  const negTotal = negative.reduce((s, d) => s + Math.abs(d.delta), 0);
  const negPct = totalDelta !== 0 ? ((negTotal / Math.abs(totalDelta)) * 100).toFixed(0) : "0";

  return `A rede cresceu ${pctGrowth}% (${formatCurrency(totalDelta)}) no período. Os principais impulsionadores foram ${top1?.name || "N/A"} (+${formatCurrency(top1?.delta || 0)}) e ${top2?.name || "N/A"} (+${formatCurrency(top2?.delta || 0)}). Os maiores detratores foram ${bot1?.name || "N/A"} (${formatCurrency(bot1?.delta || 0)}) e ${bot2?.name || "N/A"} (${formatCurrency(bot2?.delta || 0)}), representando ${negPct}% da variação negativa.`;
}

export default function VendasEvolucao() {
  const { filters, updateFilter } = useGlobalFilters();
  const drivers = useEvolutionDrivers();
  const trendData = useTrendData();
  const [showSummary, setShowSummary] = useState(false);

  const totalDelta = drivers.reduce((s, d) => s + d.delta, 0);
  const totalPrev = drivers.reduce((s, d) => s + d.previous, 0);
  const growthPct = (totalDelta / totalPrev) * 100;

  const topUnitDriver = drivers.filter(d => d.type === "unit" && d.delta > 0).sort((a, b) => b.delta - a.delta)[0];
  const topCatDriver = drivers.filter(d => d.type === "category" && d.delta > 0).sort((a, b) => b.delta - a.delta)[0];
  const unitsDown = drivers.filter(d => d.type === "unit" && d.delta < 0).length;

  const kpiItems: KPICardData[] = [
    { label: "Variação Total", value: totalDelta, formatted_value: `${formatCurrency(totalDelta)} (${growthPct > 0 ? "+" : ""}${growthPct.toFixed(1)}%)`, variation_pct: growthPct, variation_type: growthPct >= 0 ? "positive" : "negative" },
    { label: "Top Unidade", value: topUnitDriver?.delta || 0, formatted_value: `+${formatCurrency(topUnitDriver?.delta || 0)}`, impact_label: topUnitDriver?.name, variation_pct: topUnitDriver?.contribution_pct, variation_type: "positive" },
    { label: "Top Categoria", value: topCatDriver?.delta || 0, formatted_value: `+${formatCurrency(topCatDriver?.delta || 0)}`, impact_label: topCatDriver?.name, variation_pct: topCatDriver?.contribution_pct, variation_type: "positive" },
    { label: "Unidades em Queda", value: unitsDown, formatted_value: `${unitsDown} unidade${unitsDown !== 1 ? "s" : ""}`, variation_type: unitsDown > 0 ? "negative" : "positive" },
  ];

  const columns: ColumnDef<EvolutionDriver>[] = [
    { key: "name", label: "Nome" },
    { key: "type", label: "Tipo", render: (r) => r.type === "unit" ? "Unidade" : "Categoria" },
    { key: "current", label: "Atual", render: (r) => formatCurrency(r.current), getValue: (r) => r.current },
    { key: "previous", label: "Anterior", render: (r) => formatCurrency(r.previous), getValue: (r) => r.previous },
    { key: "delta", label: "Delta R$", render: (r) => <span className={r.delta >= 0 ? "text-green-500" : "text-red-500"}>{r.delta >= 0 ? "+" : ""}{formatCurrency(r.delta)}</span>, getValue: (r) => r.delta },
    { key: "contribution_pct", label: "Contribuição %", render: (r) => `${r.contribution_pct > 0 ? "+" : ""}${r.contribution_pct.toFixed(1)}%`, getValue: (r) => r.contribution_pct },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSection title="Tendência Sobrepostas" subtitle="Período atual vs anterior">
          <TrendChart data={trendData} showComparison />
        </ChartSection>

        <ChartSection title="Waterfall do Delta" subtitle="Drivers ordenados por impacto">
          <WaterfallChart data={drivers} />
        </ChartSection>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowSummary(!showSummary)}>
          <FileText className="h-3 w-3 mr-1" /> Resumo em 1 minuto
        </Button>
      </div>

      {showSummary && (
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Resumo Executivo</p>
          <p className="text-sm text-foreground leading-relaxed">{generateSummary(drivers)}</p>
        </Card>
      )}

      <DataTablePro
        data={drivers}
        columns={columns}
      />
    </div>
  );
}
