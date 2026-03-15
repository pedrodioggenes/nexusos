import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2, ClipboardCheck, Clock, CheckCircle2, AlertTriangle, Timer, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useReceivingRecords, useCreateReceivingRecord, useCompleteReceivingRecord, useReceivingSchedules } from "@/hooks/cd/useReceivingData";

const resultConfig: Record<string, { label: string; color: string }> = {
  approved: { label: "Aprovado", color: "bg-success/10 text-success border-success/20" },
  approved_partial: { label: "Aprovado Parcial", color: "bg-warning/10 text-warning border-warning/20" },
  rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function ConferenciaPage() {
  const { data: records = [], isLoading } = useReceivingRecords();
  const { data: schedules = [] } = useReceivingSchedules();
  const createMutation = useCreateReceivingRecord();
  const completeMutation = useCompleteReceivingRecord();

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "open" | "done">("all");
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form state
  const [newForm, setNewForm] = useState({ schedule_id: "", invoice_number: "", invoice_total: "" });
  const [completeForm, setCompleteForm] = useState({ result: "approved", notes: "" });

  const activeSchedules = useMemo(
    () => schedules.filter((s) => s.status === "confirmed" || s.status === "in_progress"),
    [schedules]
  );

  const filtered = useMemo(() => {
    let items = records;
    if (filterMode === "open") items = items.filter((r) => !r.completed_at);
    if (filterMode === "done") items = items.filter((r) => !!r.completed_at);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.invoice_number?.toLowerCase().includes(q) ||
          r.supplier_name?.toLowerCase().includes(q) ||
          r.po_number?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [records, filterMode, search]);

  const openCount = records.filter((r) => !r.completed_at).length;
  const doneCount = records.filter((r) => !!r.completed_at).length;

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      schedule_id: newForm.schedule_id || undefined,
      invoice_number: newForm.invoice_number || undefined,
      invoice_total: newForm.invoice_total ? Number(newForm.invoice_total) : undefined,
    });
    setNewDialogOpen(false);
    setNewForm({ schedule_id: "", invoice_number: "", invoice_total: "" });
  };

  const handleComplete = async () => {
    if (!selectedId) return;
    await completeMutation.mutateAsync({
      id: selectedId,
      result: completeForm.result,
      notes: completeForm.notes || undefined,
    });
    setCompleteDialogOpen(false);
    setSelectedId(null);
    setCompleteForm({ result: "approved", notes: "" });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Conferência de Recebimento"
        description="Conferência cega e validação de NF"
        actions={
          <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Iniciar Conferência
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conferência</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Agendamento vinculado</Label>
                  <Select value={newForm.schedule_id} onValueChange={(v) => setNewForm({ ...newForm, schedule_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                    <SelectContent>
                      {activeSchedules.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {format(parseISO(s.scheduled_date), "dd/MM")} — {s.supplier_name || "Fornecedor"} · {s.dock || "Sem doca"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nº NF</Label>
                    <Input value={newForm.invoice_number} onChange={(e) => setNewForm({ ...newForm, invoice_number: e.target.value })} placeholder="000123" />
                  </div>
                  <div>
                    <Label className="text-xs">Valor NF (R$)</Label>
                    <Input type="number" value={newForm.invoice_total} onChange={(e) => setNewForm({ ...newForm, invoice_total: e.target.value })} placeholder="0,00" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Iniciar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: `Todas (${records.length})` },
          { key: "open", label: `Em andamento (${openCount})` },
          { key: "done", label: `Finalizadas (${doneCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterMode(tab.key as any)}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium border transition-colors",
              filterMode === tab.key ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input className="pl-8 h-8 text-xs" placeholder="Buscar por NF, fornecedor, OC..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {records.length === 0 ? "Nenhuma conferência registrada" : "Nenhum resultado para os filtros"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((r) => {
            const isOpen = !r.completed_at;
            const resCfg = r.result ? resultConfig[r.result] : null;
            return (
              <div
                key={r.id}
                className={cn(
                  "rounded-xl border bg-card p-4 space-y-3 transition-colors",
                  isOpen ? "border-app-cd/30" : "border-border"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", isOpen ? "bg-app-cd/10" : "bg-muted")}>
                      {isOpen ? <Clock className="h-4 w-4 text-app-cd" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {r.invoice_number ? `NF ${r.invoice_number}` : "Conferência"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {r.started_at ? format(parseISO(r.started_at), "dd/MM HH:mm") : "—"}
                      </p>
                    </div>
                  </div>
                  {resCfg && (
                    <Badge variant="outline" className={cn("text-[10px]", resCfg.color)}>
                      {resCfg.label}
                    </Badge>
                  )}
                  {isOpen && (
                    <Badge variant="outline" className="text-[10px] bg-app-cd/10 text-app-cd border-app-cd/20">
                      Em andamento
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Fornecedor</span>
                    <p className="font-medium text-foreground">{r.supplier_name || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">OC</span>
                    <p className="font-medium text-foreground">{r.po_number || "—"}</p>
                  </div>
                  {r.invoice_total != null && (
                    <div>
                      <span className="text-muted-foreground">Valor NF</span>
                      <p className="font-medium text-foreground">R$ {r.invoice_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                  {r.dock_to_stock_minutes != null && (
                    <div>
                      <span className="text-muted-foreground">Dock-to-Stock</span>
                      <p className="font-medium text-foreground">{r.dock_to_stock_minutes} min</p>
                    </div>
                  )}
                </div>

                {isOpen && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      {r.started_at && formatDistanceToNow(parseISO(r.started_at), { locale: ptBR, addSuffix: false })}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] gap-1"
                      onClick={() => {
                        setSelectedId(r.id);
                        setCompleteDialogOpen(true);
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Finalizar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Conferência</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Resultado</Label>
              <Select value={completeForm.result} onValueChange={(v) => setCompleteForm({ ...completeForm, result: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="approved_partial">Aprovado Parcial</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Observações</Label>
              <Textarea value={completeForm.notes} onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })} rows={3} placeholder="Detalhes da conferência..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleComplete} disabled={completeMutation.isPending}>
              {completeMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Finalizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
