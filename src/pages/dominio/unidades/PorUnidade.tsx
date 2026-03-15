import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection, TrendChart } from "@/components/dominio/ChartSection";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { UNITS, CATEGORIES, ALERTS, TREND_DATA, formatCurrency, formatPercent } from "@/data/dominio/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SparklineChart } from "@/components/dominio/SparklineChart";
import { PendenciaActions } from "@/components/dominio/PendenciaActions";
import { LinkToContext } from "@/components/dominio/LinkToContext";
import { SeverityBadge, ImpactEstimate } from "@/components/dominio/SeverityBadge";
import type { KPICardData } from "@/data/dominio/types";
import { ExternalLink, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export default function UnidadesPorUnidade() {
  const { filters, updateFilter } = useGlobalFilters();
  const { pendencias, addPendencia } = usePendenciasStore();
  const navigate = useNavigate();

  const unitId = typeof filters.unit_id === "string" && filters.unit_id !== "all" ? filters.unit_id : "u1";
  const unit = UNITS.find(u => u.id === unitId) || UNITS[0];

  // Simulate unit-specific trend
  const unitTrend = useMemo(() => TREND_DATA.map(t => ({
    ...t,
    sales: Math.round(t.sales * (unit.sales / UNITS.reduce((s, u) => s + u.sales, 0))),
    margin: Math.round(t.margin * (unit.margin_value / UNITS.reduce((s, u) => s + u.margin_value, 0))),
  })), [unit]);

  const unitAlerts = ALERTS.filter(a => a.unit_id === unit.id && a.status === "active");
  const unitPendencias = pendencias.filter(p => p.related_id === unit.id || p.description?.includes(unit.name));

  // Simulate top categories for this unit
  const topCategories = useMemo(() => {
    const factor = unit.sales / UNITS.reduce((s, u) => s + u.sales, 0);
    return CATEGORIES.map(c => ({
      name: c.name,
      sales: Math.round(c.sales * factor * (0.8 + Math.random() * 0.4)),
      margin_pct: c.margin_pct + (Math.random() - 0.5) * 4,
      share_pct: c.share_pct,
    })).sort((a, b) => b.sales - a.sales);
  }, [unit]);

  const kpis: KPICardData[] = [
    { label: "Vendas", value: unit.sales, formatted_value: formatCurrency(unit.sales), trend: unit.trend },
    { label: "Margem", value: unit.margin_pct, formatted_value: formatPercent(unit.margin_pct), variation_type: unit.margin_pct > 23 ? "positive" : "negative", variation_pct: unit.margin_pct - 23 },
    { label: "Ticket Médio", value: unit.avg_ticket, formatted_value: `R$ ${unit.avg_ticket}` },
    { label: "Perdas", value: unit.losses_value, formatted_value: formatCurrency(unit.losses_value), variation_type: "negative" },
    { label: "Ruptura", value: unit.rupture_count, formatted_value: `${unit.rupture_count} itens`, variation_type: unit.rupture_count > 50 ? "negative" : "neutral" },
    { label: "Alertas Ativos", value: unitAlerts.length, formatted_value: String(unitAlerts.length), variation_type: unitAlerts.length > 3 ? "negative" : "neutral" },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={{ ...filters, unit_id: unitId }} onFilterChange={(k, v) => updateFilter(k, v)} />

      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">{unit.name}</h2>
        <Badge variant="outline" className="text-xs">{unit.city}</Badge>
      </div>

      <KPIGrid items={kpis} columns={3} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartSection title="Tendência" subtitle="Vendas e margem no tempo">
          <TrendChart data={unitTrend} showComparison />
        </ChartSection>

        <ChartSection title="Top Categorias" subtitle={`Na ${unit.name}`}>
          <div className="space-y-1.5">
            {topCategories.slice(0, 6).map(c => (
              <div key={c.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                <span className="text-xs text-foreground font-medium">{c.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{formatCurrency(c.sales)}</span>
                  <span className="text-xs text-muted-foreground">{c.margin_pct.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </ChartSection>
      </div>

      {/* Problemas abertos */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Problemas Abertos</h3>
            <p className="text-xs text-muted-foreground">{unitAlerts.length} alertas + {unitPendencias.filter(p => p.status !== "resolved").length} pendências</p>
          </div>
          <div className="flex gap-1.5">
            <LinkToContext label="Ver no Radar" to="/app/dominio/problemas/radar" />
            <LinkToContext label="Vendas" to="/app/dominio/vendas/por-unidade" />
          </div>
        </div>

        {unitAlerts.length > 0 ? (
          <div className="space-y-1.5 mb-3">
            {unitAlerts.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
                <SeverityBadge severity={a.severity} />
                <span className="text-xs text-foreground flex-1 truncate">{a.title}</span>
                <ImpactEstimate value={a.impact_value} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mb-3">Nenhum alerta ativo para esta unidade.</p>
        )}

        <PendenciaActions onCreatePendencia={addPendencia} relatedType="unit" relatedId={unit.id} />
      </Card>
    </div>
  );
}
