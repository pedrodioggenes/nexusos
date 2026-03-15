import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { UNITS, ALERTS, formatCurrency } from "@/data/dominio/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SeverityBadge, ImpactEstimate } from "@/components/dominio/SeverityBadge";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { LinkToContext } from "@/components/dominio/LinkToContext";
import type { KPICardData } from "@/data/dominio/types";
import { AlertTriangle, Plus } from "lucide-react";

export default function UnidadesAtencoes() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaults, setModalDefaults] = useState<any>({});

  const activeAlerts = ALERTS.filter(a => a.status === "active");

  // Group alerts by unit
  const byUnit = UNITS.map(u => {
    const alerts = activeAlerts.filter(a => a.unit_id === u.id);
    const totalImpact = alerts.reduce((s, a) => s + a.impact_value, 0);
    const criticalCount = alerts.filter(a => a.severity === "critical").length;
    return { unit: u, alerts, totalImpact, criticalCount };
  }).filter(g => g.alerts.length > 0).sort((a, b) => b.totalImpact - a.totalImpact);

  const totalAlertsCount = activeAlerts.length;
  const criticalTotal = activeAlerts.filter(a => a.severity === "critical").length;
  const unitsWithIssues = byUnit.length;
  const totalImpact = activeAlerts.reduce((s, a) => s + a.impact_value, 0);

  const kpis: KPICardData[] = [
    { label: "Alertas Ativos", value: totalAlertsCount, formatted_value: String(totalAlertsCount), variation_type: "negative" },
    { label: "Críticos", value: criticalTotal, formatted_value: String(criticalTotal), variation_type: "negative" },
    { label: "Unidades com Problemas", value: unitsWithIssues, formatted_value: `${unitsWithIssues} de ${UNITS.length}` },
    { label: "Impacto Total", value: totalImpact, formatted_value: formatCurrency(totalImpact), variation_type: "negative" },
  ];

  const handleCreatePendencia = (unitName: string, unitId: string, alertTitle: string) => {
    setModalDefaults({
      title: `Resolver: ${alertTitle}`,
      description: `Atenção identificada na unidade ${unitName}`,
      related_type: "unit",
      related_id: unitId,
      priority: "high" as const,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpis} columns={4} />

      <div className="space-y-3">
        {byUnit.map(({ unit, alerts, totalImpact, criticalCount }) => (
          <Card key={unit.id} className="p-4 bg-card border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{unit.name}</h3>
                <Badge variant="outline" className="text-[10px]">{unit.city}</Badge>
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="text-[10px]">{criticalCount} crítico{criticalCount > 1 ? "s" : ""}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Impacto: </span>
                <ImpactEstimate value={totalImpact} />
              </div>
            </div>

            <div className="space-y-1.5">
              {alerts.map(a => (
                <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
                  <SeverityBadge severity={a.severity} />
                  <span className="text-xs text-foreground flex-1 truncate">{a.title}</span>
                  <ImpactEstimate value={a.impact_value} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => handleCreatePendencia(unit.name, unit.id, a.title)}
                  >
                    <Plus className="h-3 w-3 mr-0.5" /> Pendência
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 mt-3 pt-2 border-t border-border">
              <LinkToContext label="Ver Detalhes" to={`/app/dominio/unidades/por-unidade`} state={{ unit_id: unit.id }} />
              <LinkToContext label="Problemas" to="/app/dominio/problemas/radar" />
              <LinkToContext label="Vendas" to="/app/dominio/vendas/por-unidade" />
            </div>
          </Card>
        ))}

        {byUnit.length === 0 && (
          <Card className="p-8 bg-card border-border text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma atenção identificada no momento.</p>
          </Card>
        )}
      </div>

      <CreatePendenciaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={addPendencia}
        defaults={modalDefaults}
      />
    </div>
  );
}
