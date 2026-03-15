import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, MoreHorizontal, CalendarCheck, Clock, Truck, CheckCircle2, XCircle, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useReceivingSchedules, useCreateSchedule, useUpdateScheduleStatus, useCDSuppliers } from "@/hooks/cd/useReceivingData";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  scheduled: { label: "Agendado", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <CalendarCheck className="h-3 w-3" /> },
  confirmed: { label: "Confirmado", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  in_progress: { label: "Em Curso", color: "bg-warning/10 text-warning border-warning/20", icon: <Clock className="h-3 w-3" /> },
  completed: { label: "Concluído", color: "bg-success/10 text-success border-success/20", icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <XCircle className="h-3 w-3" /> },
};

const statusTransitions: Record<string, string[]> = {
  scheduled: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
};

const docks = ["Doca 1", "Doca 2", "Doca 3", "Doca 4"];

export default function AgendaRecebimento() {
  const { data: schedules = [], isLoading } = useReceivingSchedules();
  const { data: suppliers = [] } = useCDSuppliers();
  const createMutation = useCreateSchedule();
  const statusMutation = useUpdateScheduleStatus();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    scheduled_date: "",
    time_window_start: "",
    time_window_end: "",
    dock: "",
    supplier_id: "",
    vehicle_plate: "",
    driver_name: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    let items = schedules;
    if (filterStatus !== "all") items = items.filter((s) => s.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.supplier_name?.toLowerCase().includes(q) ||
          s.po_number?.toLowerCase().includes(q) ||
          s.dock?.toLowerCase().includes(q) ||
          s.vehicle_plate?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [schedules, filterStatus, search]);

  const handleCreate = async () => {
    if (!form.scheduled_date) return;
    await createMutation.mutateAsync({
      scheduled_date: form.scheduled_date,
      time_window_start: form.time_window_start || undefined,
      time_window_end: form.time_window_end || undefined,
      dock: form.dock || undefined,
      supplier_id: form.supplier_id || undefined,
      vehicle_plate: form.vehicle_plate || undefined,
      driver_name: form.driver_name || undefined,
      notes: form.notes || undefined,
    });
    setDialogOpen(false);
    setForm({ scheduled_date: "", time_window_start: "", time_window_end: "", dock: "", supplier_id: "", vehicle_plate: "", driver_name: "", notes: "" });
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    schedules.forEach((s) => { c[s.status] = (c[s.status] || 0) + 1; });
    return c;
  }, [schedules]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda de Recebimento"
        description="Agendamento de docas e janelas de entrega"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">Data *</Label>
                  <Input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">Doca</Label>
                  <Select value={form.dock} onValueChange={(v) => setForm({ ...form, dock: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {docks.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Janela Início</Label>
                  <Input type="time" value={form.time_window_start} onChange={(e) => setForm({ ...form, time_window_start: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Janela Fim</Label>
                  <Input type="time" value={form.time_window_end} onChange={(e) => setForm({ ...form, time_window_end: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Fornecedor</Label>
                  <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Placa</Label>
                  <Input value={form.vehicle_plate} onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })} placeholder="ABC-1234" />
                </div>
                <div>
                  <Label className="text-xs">Motorista</Label>
                  <Input value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Observações</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!form.scheduled_date || createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={cn(
            "px-3 py-1 rounded-full text-[11px] font-medium border transition-colors",
            filterStatus === "all" ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Todos ({schedules.length})
        </button>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium border transition-colors",
              filterStatus === key ? cfg.color : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {cfg.label} ({counts[key] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          className="pl-8 h-8 text-xs"
          placeholder="Buscar por fornecedor, OC, doca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {schedules.length === 0 ? "Nenhum agendamento cadastrado" : "Nenhum resultado para os filtros aplicados"}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Data</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Janela</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Doca</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Fornecedor</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Veículo</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Status</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => {
                  const cfg = statusConfig[s.status] || statusConfig.scheduled;
                  const transitions = statusTransitions[s.status] || [];
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                        {format(parseISO(s.scheduled_date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                        {s.time_window_start && s.time_window_end
                          ? `${s.time_window_start.slice(0, 5)} – ${s.time_window_end.slice(0, 5)}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">{s.dock || "—"}</td>
                      <td className="px-3 py-2.5 text-foreground">{s.supplier_name || "—"}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {s.vehicle_plate ? (
                          <span>
                            {s.vehicle_plate}
                            {s.driver_name && <span className="ml-1 text-muted-foreground/70">· {s.driver_name}</span>}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="outline" className={cn("text-[10px] gap-1", cfg.color)}>
                          {cfg.icon} {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5">
                        {transitions.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {transitions.map((t) => {
                                const tCfg = statusConfig[t];
                                return (
                                  <DropdownMenuItem
                                    key={t}
                                    onClick={() => statusMutation.mutate({ id: s.id, status: t })}
                                  >
                                    {tCfg?.icon}
                                    <span className="ml-2">Marcar como {tCfg?.label}</span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
