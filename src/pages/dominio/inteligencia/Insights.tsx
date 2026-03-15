import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { InsightCard } from "@/components/dominio/InsightCard";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { INSIGHTS_FEED } from "@/data/dominio/inteligencia-mock";
import type { KPICardData } from "@/data/dominio/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DOMAIN_FILTERS = ["todos", "produtos", "vendas", "financeiro", "compras", "pessoas"] as const;
const domainLabels: Record<string, string> = {
  todos: "Todos",
  produtos: "Produtos",
  vendas: "Vendas",
  financeiro: "Financeiro",
  compras: "Compras",
  pessoas: "Pessoas",
};

export default function InteligenciaInsights() {
  const { filters, updateFilter } = useGlobalFilters();
  const [domainFilter, setDomainFilter] = useState<string>("todos");

  const filtered = domainFilter === "todos"
    ? INSIGHTS_FEED
    : INSIGHTS_FEED.filter((i) => i.domain === domainFilter);

  const critical = INSIGHTS_FEED.filter((i) => i.severity === "critical").length;
  const warning = INSIGHTS_FEED.filter((i) => i.severity === "warning").length;
  const info = INSIGHTS_FEED.filter((i) => i.severity === "info").length;

  const kpiItems: KPICardData[] = [
    { label: "Insights Ativos", value: INSIGHTS_FEED.length, formatted_value: INSIGHTS_FEED.length.toString() },
    { label: "Críticos", value: critical, formatted_value: critical.toString(), variation_type: "negative" as const },
    { label: "Atenção", value: warning, formatted_value: warning.toString() },
    { label: "Informativos", value: info, formatted_value: info.toString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Conclusões extraídas dos dados da rede — com evidência e ação sugerida</p>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />
      <KPIGrid items={kpiItems} columns={4} />

      {/* Domain filter */}
      <div className="flex flex-wrap gap-1.5">
        {DOMAIN_FILTERS.map((d) => (
          <Button
            key={d}
            variant={domainFilter === d ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setDomainFilter(d)}
          >
            {domainLabels[d]}
            {d !== "todos" && (
              <Badge variant="secondary" className="ml-1 h-4 text-[10px]">
                {INSIGHTS_FEED.filter((i) => i.domain === d).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum insight encontrado para este filtro.
          </div>
        )}
      </div>
    </div>
  );
}
