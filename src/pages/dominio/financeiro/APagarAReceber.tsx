import { useState } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { ACCOUNTS_PR, formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData, AccountPayableReceivable } from "@/data/dominio/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function APagarAReceber() {
  const { filters, updateFilter } = useGlobalFilters();
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const data = statusFilter === "todos" ? ACCOUNTS_PR : ACCOUNTS_PR.filter(a => a.status === statusFilter);

  const totalPagar = ACCOUNTS_PR.filter(a => a.type === "pagar" && (a.status === "aberto" || a.status === "atrasado")).reduce((s, a) => s + a.value, 0);
  const totalReceber = ACCOUNTS_PR.filter(a => a.type === "receber" && (a.status === "aberto")).reduce((s, a) => s + a.value, 0);
  const atrasados = ACCOUNTS_PR.filter(a => a.status === "atrasado");
  const totalAtrasado = atrasados.reduce((s, a) => s + a.value, 0);

  const kpiItems: KPICardData[] = [
    { label: "A Pagar (30d)", value: totalPagar, formatted_value: formatCurrency(totalPagar), variation_type: "negative" },
    { label: "A Receber (30d)", value: totalReceber, formatted_value: formatCurrency(totalReceber), variation_type: "positive" },
    { label: "Atrasados", value: totalAtrasado, formatted_value: `${formatCurrency(totalAtrasado)} (${atrasados.length})`, variation_type: totalAtrasado > 0 ? "negative" : "neutral" },
    { label: "Saldo Líquido", value: totalReceber - totalPagar, formatted_value: formatCurrency(totalReceber - totalPagar), variation_type: totalReceber >= totalPagar ? "positive" : "negative" },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
      aberto: { label: "Aberto", variant: "outline" },
      atrasado: { label: "Atrasado", variant: "destructive" },
      pago: { label: "Pago", variant: "default" },
      recebido: { label: "Recebido", variant: "default" },
    };
    const s = map[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>;
  };

  const columns: ColumnDef<AccountPayableReceivable>[] = [
    { key: "due_date", label: "Vencimento" },
    { key: "counterpart", label: "Parte" },
    { key: "value", label: "Valor", render: (r) => <span className={r.type === "receber" ? "text-green-500" : "text-foreground"}>{formatCurrency(r.value)}</span>, getValue: (r) => r.value },
    { key: "type", label: "Tipo", render: (r) => r.type === "pagar" ? "A Pagar" : "A Receber" },
    { key: "status", label: "Status", render: (r) => statusBadge(r.status) },
    { key: "unit_name", label: "Unidade" },
    { key: "description", label: "Descrição" },
  ];

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <KPIGrid items={kpiItems} />

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Filtrar status:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="recebido">Recebido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTablePro data={data} columns={columns} />
    </div>
  );
}
