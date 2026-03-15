import { useState, useMemo } from "react";
import { GlobalFiltersBar } from "@/components/dominio/GlobalFiltersBar";
import { KPIGrid } from "@/components/dominio/KPIGrid";
import { DataTablePro, ColumnDef } from "@/components/dominio/DataTablePro";
import { CreatePendenciaModal } from "@/components/dominio/CreatePendenciaModal";
import { useGlobalFilters } from "@/hooks/useDominioData";
import { usePendenciasStore } from "@/stores/usePendenciasStore";
import type { KPICardData, Pendencia } from "@/data/dominio/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Clock, Download, Edit2, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const statusLabels: Record<string, string> = { open: "Aberta", in_progress: "Em andamento", resolved: "Resolvida", postponed: "Adiada" };
const statusColors: Record<string, string> = { open: "destructive", in_progress: "default", resolved: "secondary", postponed: "outline" };
const priorityLabels: Record<string, string> = { high: "Alta", medium: "Média", low: "Baixa" };

export default function ProblemasPendencias() {
  const { filters, updateFilter } = useGlobalFilters();
  const { pendencias, addPendencia, updateStatus } = usePendenciasStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [drawerItem, setDrawerItem] = useState<Pendencia | null>(null);

  const data = useMemo(() => {
    let items = [...pendencias];
    if (statusFilter !== "all") items = items.filter((p) => p.status === statusFilter);
    if (responsibleFilter) {
      const s = responsibleFilter.toLowerCase();
      items = items.filter((p) => p.responsible.toLowerCase().includes(s));
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(s) || p.responsible.toLowerCase().includes(s));
    }
    return items;
  }, [pendencias, statusFilter, responsibleFilter, filters.search]);

  const openCount = pendencias.filter((p) => p.status === "open").length;
  const overdueCount = pendencias.filter((p) => p.status === "open" && new Date(p.due_date) < new Date()).length;
  const inProgressCount = pendencias.filter((p) => p.status === "in_progress").length;
  const resolvedCount = pendencias.filter((p) => p.status === "resolved").length;

  const kpiItems: KPICardData[] = [
    { label: "Abertas", value: openCount, formatted_value: String(openCount), variation_type: openCount > 5 ? "negative" : "neutral" },
    { label: "Vencidas", value: overdueCount, formatted_value: String(overdueCount), variation_type: overdueCount > 0 ? "negative" : "neutral" },
    { label: "Em Andamento", value: inProgressCount, formatted_value: String(inProgressCount), variation_type: "neutral" },
    { label: "Resolvidas", value: resolvedCount, formatted_value: String(resolvedCount), variation_type: "positive" },
  ];

  const columns: ColumnDef<Pendencia>[] = [
    { key: "title", label: "Título", render: (r) => <span className="text-xs font-medium">{r.title}</span> },
    { key: "priority", label: "Prioridade", render: (r) => <Badge variant={r.priority === "high" ? "destructive" : r.priority === "medium" ? "default" : "secondary"} className="text-[10px]">{priorityLabels[r.priority]}</Badge>, getValue: (r) => r.priority === "high" ? 3 : r.priority === "medium" ? 2 : 1 },
    { key: "responsible", label: "Responsável" },
    { key: "due_date", label: "Prazo", render: (r) => {
      const overdue = r.status !== "resolved" && new Date(r.due_date) < new Date();
      return <span className={overdue ? "text-red-500 font-semibold text-xs" : "text-xs"}>{new Date(r.due_date).toLocaleDateString("pt-BR")}</span>;
    }, getValue: (r) => r.due_date },
    { key: "status", label: "Status", render: (r) => <Badge variant={statusColors[r.status] as "destructive" | "default" | "secondary" | "outline"} className="text-[10px]">{statusLabels[r.status]}</Badge> },
  ];

  const handleExport = () => {
    const csv = ["Título,Prioridade,Responsável,Prazo,Status", ...data.map((p) => `"${p.title}",${p.priority},${p.responsible},${p.due_date},${p.status}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "pendencias.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportado", description: "pendencias.csv baixado" });
  };

  return (
    <div className="space-y-4">
      <GlobalFiltersBar filters={filters} onFilterChange={updateFilter} />

      {/* Extra filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="resolved">Resolvidas</SelectItem>
            <SelectItem value="postponed">Adiadas</SelectItem>
          </SelectContent>
        </Select>
        <Input value={responsibleFilter} onChange={(e) => setResponsibleFilter(e.target.value)} placeholder="Responsável..." className="h-8 w-[150px] text-xs" />
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3 w-3 mr-1" /> Nova pendência
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleExport}>
          <Download className="h-3 w-3 mr-1" /> Exportar
        </Button>
      </div>

      <KPIGrid items={kpiItems} />

      <DataTablePro
        data={data}
        columns={columns}
        onRowClick={(r) => setDrawerItem(r)}
        actions={[
          { label: "Resolver", onClick: (r) => { updateStatus(r.id, "resolved"); toast({ title: "Resolvida", description: r.title }); }, show: (r) => r.status !== "resolved" },
          { label: "Adiar", onClick: (r) => { updateStatus(r.id, "postponed"); toast({ title: "Adiada", description: r.title }); }, show: (r) => r.status === "open", variant: "ghost" },
          { label: "Iniciar", onClick: (r) => { updateStatus(r.id, "in_progress"); toast({ title: "Em andamento", description: r.title }); }, show: (r) => r.status === "open", variant: "ghost" },
        ]}
      />

      {/* Detail Drawer */}
      <Sheet open={!!drawerItem} onOpenChange={(open) => !open && setDrawerItem(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {drawerItem && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge variant={statusColors[drawerItem.status] as "destructive" | "default" | "secondary" | "outline"} className="text-xs">
                    {statusLabels[drawerItem.status]}
                  </Badge>
                  <span className="truncate">{drawerItem.title}</span>
                </SheetTitle>
                <SheetDescription>{drawerItem.description}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <MiniKPI label="Responsável" value={drawerItem.responsible} />
                  <MiniKPI label="Prazo" value={new Date(drawerItem.due_date).toLocaleDateString("pt-BR")} />
                  <MiniKPI label="Prioridade" value={priorityLabels[drawerItem.priority]} />
                  <MiniKPI label="Criado por" value={drawerItem.created_by} />
                </div>

                <div className="text-xs text-muted-foreground">
                  Criado em: {new Date(drawerItem.created_at).toLocaleDateString("pt-BR")}
                  {drawerItem.resolved_at && ` • Resolvido em: ${new Date(drawerItem.resolved_at).toLocaleDateString("pt-BR")}`}
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs font-medium text-foreground mb-2">Histórico de Comentários</p>
                  <p className="text-xs text-muted-foreground italic">Funcionalidade de comentários em breve (placeholder)</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  {drawerItem.status !== "resolved" && (
                    <>
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => { updateStatus(drawerItem.id, "resolved"); setDrawerItem(null); toast({ title: "Resolvida" }); }}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Marcar Resolvida
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={() => { updateStatus(drawerItem.id, "postponed"); setDrawerItem(null); toast({ title: "Adiada" }); }}>
                        <Clock className="h-3 w-3 mr-1" /> Adiar
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={() => toast({ title: "Comentário", description: "Funcionalidade em breve (placeholder)" })}>
                    <MessageSquare className="h-3 w-3 mr-1" /> Comentar
                  </Button>
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
