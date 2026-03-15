import { useState, useMemo } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { COMPRAS } from "@/data/dominio/compras-mock";
import { formatCurrency } from "@/data/dominio/mock-data";
import type { KPICardData } from "@/data/dominio/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Flag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<string, string> = {
  confirmada: "Confirmada",
  pendente: "Pendente",
  em_transito: "Em Trânsito",
  cancelada: "Cancelada",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmada: "default",
  pendente: "secondary",
  em_transito: "outline",
  cancelada: "destructive",
};

export default function ComprasPeriodo() {
  const { filters, updateFilter } = useGlobalFilters();
  const [statusFilter, setStatusFilter] = useState("all");
  const [criticalIds, setCriticalIds] = useState<Set<string>>(new Set());

  const data = useMemo(() => {
    let items = [...COMPRAS];
    if (statusFilter !== "all") items = items.filter((c) => c.status === statusFilter);
    if (filters.unit_id !== "all" && typeof filters.unit_id === "string") {
      items = items.filter((c) => c.unit_id === filters.unit_id);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter((c) => c.supplier_name.toLowerCase().includes(s) || c.category.toLowerCase().includes(s) || c.nf.toLowerCase().includes(s));
    }
    return items;
  }, [statusFilter, filters.unit_id, filters.search]);

  const totalValor = data.reduce((s, c) => s + c.valor, 0);
  const pendentes = data.filter((c) => c.status === "pendente").length;
  const canceladas = data.filter((c) => c.status === "cancelada").length;

  const kpiItems: KPICardData[] = [
    { label: "Total Compras", value: data.length, formatted_value: data.length.toString(), variation_pct: 0, variation_type: "neutral" },
    { label: "Valor Total", value: totalValor, formatted_value: formatCurrency(totalValor), variation_pct: 3.8, variation_type: "positive" },
    { label: "Pendentes", value: pendentes, formatted_value: pendentes.toString(), variation_pct: pendentes > 5 ? -8 : 0, variation_type: pendentes > 5 ? "negative" : "neutral" },
    { label: "Canceladas", value: canceladas, formatted_value: canceladas.toString(), variation_pct: 0, variation_type: "neutral" },
  ];

  const toggleCritical = (id: string) => {
    setCriticalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast({ title: "Compra desmarcada" }); }
      else { next.add(id); toast({ title: "Compra marcada como crítica" }); }
      return next;
    });
  };

  const handleExport = () => {
    const csv = ["Data,Fornecedor,Categoria,Valor,Unidade,Status,NF", ...data.map((c) => `${c.date},${c.supplier_name},${c.category},${c.valor},${c.unit_name},${c.status},${c.nf}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "compras_periodo.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportado com sucesso" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compras do Período</h1>
          <p className="text-muted-foreground">Análise de compras realizadas no período selecionado</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Exportar
        </Button>
      </div>

      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      <div className="flex gap-2 items-center">
        <span className="text-xs text-muted-foreground">Status:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_transito">Em Trânsito</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <KPIGrid items={kpiItems} columns={4} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor (R$)</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>NF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((c) => (
            <TableRow key={c.id} className={criticalIds.has(c.id) ? "bg-destructive/5" : ""}>
              <TableCell>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleCritical(c.id)} title="Marcar como crítica">
                  <Flag className={`h-3 w-3 ${criticalIds.has(c.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                </Button>
              </TableCell>
              <TableCell className="text-sm">{c.date.replace("2026-02-", "02/").replace(/-/g, "/")}</TableCell>
              <TableCell className="font-medium">{c.supplier_name}</TableCell>
              <TableCell>{c.category}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(c.valor)}</TableCell>
              <TableCell>{c.unit_name}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABELS[c.status]}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{c.nf}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
