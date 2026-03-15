import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { TAX_OBLIGATIONS, formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData, TaxObligation } from "@/data/dominio/types";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function FinanceiroImpostos() {
  const { filters, updateFilter } = useGlobalFilters();
  const [drawerTax, setDrawerTax] = useState<TaxObligation | null>(null);

  const taxes = TAX_OBLIGATIONS;
  const totalObrigacoes = taxes.filter(t => t.status !== "pago").reduce((s, t) => s + t.value, 0);
  const proximos = taxes.filter(t => t.status === "proximo" || t.status === "aberto");
  const atrasados = taxes.filter(t => t.status === "atrasado");
  const totalAtrasado = atrasados.reduce((s, t) => s + t.value, 0);

  const kpiItems: KPICardData[] = [
    { label: "Obrigações do Período", value: totalObrigacoes, formatted_value: formatCurrency(totalObrigacoes) },
    { label: "Vencimentos Próximos", value: proximos.length, formatted_value: `${proximos.length} obrigações`, variation_type: "neutral" },
    { label: "Em Atraso", value: totalAtrasado, formatted_value: `${formatCurrency(totalAtrasado)} (${atrasados.length})`, variation_type: atrasados.length > 0 ? "negative" : "positive" },
    { label: "Total Pago", value: taxes.filter(t => t.status === "pago").reduce((s, t) => s + t.value, 0), formatted_value: formatCurrency(taxes.filter(t => t.status === "pago").reduce((s, t) => s + t.value, 0)), variation_type: "positive" },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
      em_dia: { label: "Em dia", variant: "default" },
      aberto: { label: "Aberto", variant: "outline" },
      proximo: { label: "Próximo", variant: "secondary" },
      atrasado: { label: "Atrasado", variant: "destructive" },
      pago: { label: "Pago", variant: "default" },
    };
    const s = map[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>;
  };

  const columns: ColumnDef<TaxObligation>[] = [
    { key: "type", label: "Tipo" },
    { key: "value", label: "Valor", render: (r) => formatCurrency(r.value), getValue: (r) => r.value },
    { key: "due_date", label: "Vencimento" },
    { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    { key: "reference_period", label: "Referência" },
    { key: "unit_name", label: "Unidade" },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} />

      <DataTablePro
        data={taxes}
        columns={columns}
        onRowClick={(row) => setDrawerTax(row)}
        actions={[
          { label: "Detalhes", onClick: (row) => setDrawerTax(row) },
        ]}
      />

      <Sheet open={!!drawerTax} onOpenChange={(open) => !open && setDrawerTax(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {drawerTax && (
            <>
              <SheetHeader>
                <SheetTitle>{drawerTax.type}</SheetTitle>
                <SheetDescription>Detalhes da obrigação fiscal</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Valor</p>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(drawerTax.value)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Vencimento</p>
                    <p className="text-sm font-semibold text-foreground">{drawerTax.due_date}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Status</p>
                    <p className="text-sm font-semibold">{statusBadge(drawerTax.status)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30">
                    <p className="text-[10px] text-muted-foreground">Referência</p>
                    <p className="text-sm font-semibold text-foreground">{drawerTax.reference_period}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Histórico</p>
                  <div className="p-3 rounded-lg bg-secondary/30 text-xs text-muted-foreground">
                    Histórico de pagamentos e guias disponível na integração ERP (placeholder)
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Anexos</p>
                  <div className="p-3 rounded-lg bg-secondary/30 text-xs text-muted-foreground">
                    Guias e comprovantes disponíveis na integração ERP (placeholder)
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
