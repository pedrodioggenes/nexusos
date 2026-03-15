import { useState, useMemo } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { SeverityBadge, ImpactEstimate } from "@/components/dominio/SeverityBadge";
import { LinkToContext } from "@/components/dominio/LinkToContext";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import { ANOMALIES, type AnomalyItem } from "@/data/dominio/problemas-mock";
import { formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData } from "@/data/dominio/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Bell, BellOff, Plus, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { SparklineChart } from "@/components/dominio/SparklineChart";

export default function ProblemasRadar() {
  const { filters, updateFilter } = useGlobalFilters();
  const { addPendencia } = usePendenciasStore();
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning">("all");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [drawerItem, setDrawerItem] = useState<AnomalyItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<Record<string, string>>({});
  const [silencedIds, setSilencedIds] = useState<Set<string>>(new Set());

  const data = useMemo(() => {
    let items = [...ANOMALIES].filter((a) => !silencedIds.has(a.id));
    if (severityFilter !== "all") items = items.filter((a) => a.severity === severityFilter);
    if (domainFilter !== "all") items = items.filter((a) => a.domain === domainFilter);
    if (filters.unit_id !== "all" && typeof filters.unit_id === "string") {
      items = items.filter((a) => a.unit_id === filters.unit_id);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter((a) => a.title.toLowerCase().includes(s) || a.unit_name.toLowerCase().includes(s));
    }
    return items;
  }, [severityFilter, domainFilter, filters.unit_id, filters.search, silencedIds]);

  const critCount = ANOMALIES.filter((a) => a.severity === "critical" && !silencedIds.has(a.id)).length;
  const warnCount = ANOMALIES.filter((a) => a.severity === "warning" && !silencedIds.has(a.id)).length;
  const totalImpact = data.reduce((s, a) => s + a.impact_value, 0);

  const kpiItems: KPICardData[] = [
    { label: "Anomalias Ativas", value: data.length, formatted_value: String(data.length), variation_type: "negative" },
    { label: "Críticos", value: critCount, formatted_value: String(critCount), variation_type: critCount > 0 ? "negative" : "neutral" },
    { label: "Atenção", value: warnCount, formatted_value: String(warnCount), variation_type: "neutral" },
    { label: "Impacto Estimado", value: totalImpact, formatted_value: formatCurrency(totalImpact), variation_type: "negative" },
  ];

  const columns: ColumnDef<AnomalyItem>[] = [
    { key: "title", label: "Problema", render: (r) => <span className="text-xs">{r.title}</span> },
    { key: "severity", label: "Severidade", render: (r) => <SeverityBadge severity={r.severity} />, getValue: (r) => r.severity },
    { key: "impact_value", label: "Impacto", render: (r) => <ImpactEstimate value={r.impact_value} />, getValue: (r) => r.impact_value },
    { key: "unit_name", label: "Onde", render: (r) => <span className="text-xs">{r.unit_name}</span> },
    { key: "evidence", label: "Evidência", render: (r) => <span className="text-[10px] text-muted-foreground">{r.evidence}</span> },
    { key: "recurrence", label: "Recorrência", render: (r) => <span className="text-xs">{r.recurrence}</span> },
  ];

  const handleSilence = (item: AnomalyItem) => {
    setSilencedIds((prev) => new Set([...prev, item.id]));
    toast({ title: "Silenciado", description: `${item.title} não aparecerá mais no radar` });
  };

  const openCreate = (item: AnomalyItem) => {
    setCreateDefaults({ title: item.title, description: item.evidence, related_type: "anomaly", related_id: item.id, priority: item.severity === "critical" ? "high" : "medium" });
    setCreateOpen(true);
  };

  const domainPath: Record<string, string> = {
    vendas: "/app/dominio/vendas/visao-geral",
    produtos: "/app/dominio/produtos/catalogo",
    financeiro: "/app/dominio/financeiro/resultado",
    unidades: "/app/dominio/unidades/visao-geral",
  };

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      {/* Extra filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as typeof severityFilter)}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Severidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="warning">Atenção</SelectItem>
          </SelectContent>
        </Select>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Domínio" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="vendas">Vendas</SelectItem>
            <SelectItem value="produtos">Produtos</SelectItem>
            <SelectItem value="financeiro">Financeiro</SelectItem>
            <SelectItem value="unidades">Unidades</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <KPIGrid items={kpiItems} />

      <DataTablePro
        data={data}
        columns={columns}
        onRowClick={(r) => setDrawerItem(r)}
        actions={[
          { label: "Pendência", onClick: (r) => openCreate(r) },
          { label: "Silenciar", onClick: (r) => handleSilence(r), variant: "ghost" },
        ]}
      />

      {/* Detail Drawer */}
      <Sheet open={!!drawerItem} onOpenChange={(open) => !open && setDrawerItem(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {drawerItem && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <SeverityBadge severity={drawerItem.severity} />
                  <span className="truncate">{drawerItem.title}</span>
                </SheetTitle>
                <SheetDescription>{drawerItem.evidence}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <MiniKPI label="Impacto" value={formatCurrency(drawerItem.impact_value)} />
                  <MiniKPI label="Domínio" value={drawerItem.domain} />
                  <MiniKPI label="Unidade" value={drawerItem.unit_name} />
                  <MiniKPI label="Regra" value={drawerItem.rule_name} />
                  <MiniKPI label="Recorrência" value={drawerItem.recurrence} />
                  {drawerItem.category && <MiniKPI label="Categoria" value={drawerItem.category} />}
                </div>

                <div className="text-xs text-muted-foreground">
                  Detectado em: {new Date(drawerItem.created_at).toLocaleDateString("pt-BR")}
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <LinkToContext label="Ver no contexto" to={domainPath[drawerItem.domain] || "/app/dominio"} />
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setDrawerItem(null); openCreate(drawerItem); }}>
                      <Plus className="h-3 w-3 mr-1" /> Criar pendência
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { handleSilence(drawerItem); setDrawerItem(null); }}>
                      <BellOff className="h-3 w-3 mr-1" /> Silenciar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CreatePendenciaModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={addPendencia}
        defaults={createDefaults}
      />
    </div>
  );
}

function MiniKPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-secondary/30">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
