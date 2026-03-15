import { useState, useMemo } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { AlertDetailsDrawer } from "@/components/dominio/DetailsDrawer";
import { PendenciaActions } from "@/components/dominio/PendenciaActions";
import { useGlobalFilters, useAlerts, usePendencias } from "@/hooks/useDominioData";
import { formatCurrency } from "@/data/dominio/mock-data";
import type { Alert, KPICardData } from "@/data/dominio/types";
import { AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AlertasNegocio() {
  const { filters, updateFilter } = useGlobalFilters();
  const allAlerts = useAlerts(filters);
  const { addPendencia } = usePendencias();

  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning">("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localAlerts, setLocalAlerts] = useState<Alert[]>(allAlerts);

  const filtered = useMemo(() => {
    let data = localAlerts;
    if (severityFilter !== "all") data = data.filter(a => a.severity === severityFilter);
    if (domainFilter !== "all") data = data.filter(a => a.domain === domainFilter);
    return data;
  }, [localAlerts, severityFilter, domainFilter]);

  const activeAlerts = filtered.filter(a => a.status === "active");
  const criticalCount = activeAlerts.filter(a => a.severity === "critical").length;
  const warningCount = activeAlerts.filter(a => a.severity === "warning").length;
  const resolvedToday = filtered.filter(a => a.status === "resolved").length;

  const kpis: KPICardData[] = [
    { label: "Total Alertas", value: activeAlerts.length, formatted_value: String(activeAlerts.length), variation_type: activeAlerts.length > 10 ? "negative" : "neutral" },
    { label: "Críticos", value: criticalCount, formatted_value: String(criticalCount), variation_type: criticalCount > 0 ? "negative" : "positive" },
    { label: "Atenção", value: warningCount, formatted_value: String(warningCount), variation_type: "neutral" },
    { label: "Resolvidos", value: resolvedToday, formatted_value: String(resolvedToday), variation_type: "positive" },
  ];

  const handleResolve = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "resolved" as const, resolved_at: new Date().toISOString() } : a));
    toast({ title: "Alerta resolvido" });
  };

  const handleIgnore = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "ignored" as const, ignored_reason: "Ignorado pelo usuário" } : a));
    toast({ title: "Alerta ignorado" });
  };

  return (
    <div className="space-y-4">
      <BlurFade delay={0}>
        <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      </BlurFade>

      <BlurFade delay={0.05}>
        <div className="flex flex-wrap gap-2">
          <Select value={severityFilter} onValueChange={v => setSeverityFilter(v as typeof severityFilter)}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Severidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
              <SelectItem value="warning">Atenção</SelectItem>
            </SelectContent>
          </Select>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Domínio" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="produtos">Produtos</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="unidades">Unidades</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </BlurFade>

      <BlurFade delay={0.1}>
        <KPIGrid items={kpis} columns={4} />
      </BlurFade>

      <BlurFade delay={0.15}>
        <div className="space-y-2">
          {activeAlerts.map(alert => (
            <Card key={alert.id} className="p-4 bg-card border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${alert.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{alert.title}</p>
                      <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">
                        {alert.severity === "critical" ? "Crítico" : "Atenção"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{alert.domain}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span>Impacto: {formatCurrency(alert.impact_value)}</span>
                      <span>•</span>
                      <span>{alert.unit_name}</span>
                      <span>•</span>
                      <span>{alert.rule_name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => { setSelectedAlert(alert); setDrawerOpen(true); }}>
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => handleResolve(alert.id)}>
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                  <PendenciaActions onCreatePendencia={addPendencia} relatedType="alert" relatedId={alert.id} compact />
                </div>
              </div>
            </Card>
          ))}
          {activeAlerts.length === 0 && (
            <Card className="p-8 bg-card border-border text-center">
              <p className="text-muted-foreground text-sm">Nenhum alerta ativo com os filtros selecionados</p>
            </Card>
          )}
        </div>
      </BlurFade>

      <AlertDetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        alert={selectedAlert}
        onCreatePendencia={addPendencia}
        onResolve={handleResolve}
      />
    </div>
  );
}
