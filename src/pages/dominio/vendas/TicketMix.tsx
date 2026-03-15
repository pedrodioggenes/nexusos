import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { ChartSection, TicketDistributionChart, ItemsPerCouponChart } from "@/components/dominio/ChartSection";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { useGlobalFilters, useTicketDistribution } from "@/hooks/useDominioData";
import { getSalesKPIs } from "@/data/dominio/mock-data";
import { ITEMS_PER_COUPON } from "@/data/dominio/mock-data";
import type { KPICardData, TicketDistribution } from "@/data/dominio/types";

export default function TicketMix() {
  const { filters, updateFilter } = useGlobalFilters();
  const ticketDist = useTicketDistribution();
  const kpis = getSalesKPIs();
  const itemsData = ITEMS_PER_COUPON;

  const currentItems = itemsData[itemsData.length - 1];
  const prevItems = itemsData[itemsData.length - 2];
  const ticketVariation = 1.8;
  const itemsVariation = ((currentItems.avg_items - currentItems.avg_items_prev) / currentItems.avg_items_prev) * 100;

  const kpiItems: KPICardData[] = [
    { label: "Ticket Médio", value: kpis.avgTicket, formatted_value: `R$ ${kpis.avgTicket}`, variation_pct: ticketVariation, variation_type: "positive" },
    { label: "Itens por Cupom", value: currentItems.avg_items, formatted_value: currentItems.avg_items.toFixed(1), variation_pct: itemsVariation, variation_type: itemsVariation >= 0 ? "positive" : "negative" },
    { label: "Variação Ticket", value: ticketVariation, formatted_value: `+${ticketVariation.toFixed(1)}%`, variation_pct: ticketVariation, variation_type: "positive" },
    { label: "Variação Itens", value: itemsVariation, formatted_value: `${itemsVariation > 0 ? "+" : ""}${itemsVariation.toFixed(1)}%`, variation_pct: itemsVariation, variation_type: itemsVariation >= 0 ? "positive" : "negative" },
  ];

  const columns: ColumnDef<TicketDistribution>[] = [
    { key: "range", label: "Faixa" },
    { key: "count", label: "Quantidade", render: (r) => r.count.toLocaleString(), getValue: (r) => r.count },
    { key: "pct", label: "Percentual %", render: (r) => `${r.pct.toFixed(1)}%`, getValue: (r) => r.pct },
    { key: "avg_ticket", label: "Ticket Médio", render: (r) => `R$ ${r.avg_ticket}`, getValue: (r) => r.avg_ticket },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartSection title="Distribuição de Ticket" subtitle="Por faixas de valor">
          <TicketDistributionChart data={ticketDist} />
        </ChartSection>

        <ChartSection title="Itens por Cupom" subtitle="Evolução no tempo">
          <ItemsPerCouponChart data={itemsData} />
        </ChartSection>
      </div>

      <DataTablePro
        data={ticketDist}
        columns={columns}
      />
    </div>
  );
}
