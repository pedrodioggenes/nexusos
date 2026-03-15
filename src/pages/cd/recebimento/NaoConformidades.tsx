import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Loader2, ShieldAlert, AlertTriangle, CheckCircle2, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNonConformities, useCreateNonConformity, useUpdateNCTreatment, useCDSuppliers } from "@/hooks/cd/useReceivingData";

const ncTypes: Record<string, string> = {
  qty_divergence: "Divergência de Quantidade",
  damaged: "Avaria / Dano",
  expired: "Produto Vencido",
  wrong_product: "Produto Errado",
  temperature: "Fora de Temperatura",
  packaging: "Embalagem Violada",
};

const severityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  medium: { label: "Média", color: "bg-warning/10 text-warning border-warning/20" },
  high: { label: "Alta", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  critical: { label: "Crítica", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const treatmentConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20" },
  analyzing: { label: "Em Análise", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  resolved: { label: "Resolvido", color: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function NaoConformidadesPage() {
  const { data: ncs = [], isLoading } = useNonConformities();
  const { data: suppliers = [] } = useCDSuppliers();
  const createMutation = useCreateNonConformity();
  const updateMutation = useUpdateNCTreatment();

  const [search, setSearch] = useState("");
  const [filterTreatment, setFilterTreatment] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [treatOpen, setTreatOpen] = useState(false);
  const [selectedNC, setSelectedNC] = useState<typeof ncs[0] | null>(null);

  const [form, setForm] = useState({
    type: "",
    severity: "medium",
    description: "",
    qty_affected: "",
    supplier_id: "",
  });

  const [treatForm, setTreatForm] = useState({ treatment_status: "", treatment_action: "" });

  const filtered = useMemo(() => {
    let items = ncs;
    if (filterTreatment !== "all") items = items.filter((n) => n.treatment_status === filterTreatment);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (n) =>
          n.description?.toLowerCase().includes(q) ||
          n.sku_name?.toLowerCase().includes(q) ||
          n.supplier_name?.toLowerCase().includes(q) ||
          ncTypes[n.type]?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [ncs, filterTreatment, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    ncs.forEach((n) => { c[n.treatment_status] = (c[n.treatment_status] || 0) + 1; });
    return c;
  }, [ncs]);

  const handleCreate = async () => {
    if (!form.type) return;
    await createMutation.mutateAsync({
      type: form.type,
      severity: form.severity,
      description: form.description || undefined,
      qty_affected: form.qty_affected ? Number(form.qty_affected) : undefined,
      supplier_id: form.supplier_id || undefined,
    });
    setCreateOpen(false);
    setForm({ type: "", severity: "medium", description: "", qty_affected: "", supplier_id: "" });
  };

  const handleTreat = async () => {
    if (!selectedNC || !treatForm.treatment_status) return;
    await updateMutation.mutateAsync({
      id: selectedNC.id,
      treatment_status: treatForm.treatment_status,
      treatment_action: treatForm.treatment_action || undefined,
    });
    setTreatOpen(false);
    setSelectedNC(null);
    setTreatForm({ treatment_status: "", treatment_action: "" });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Não Conformidades"
        description="Registro e tratamento de desvios no recebimento"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Registrar NC
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Não Conformidade</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Tipo *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ncTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Severidade</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(severityConfig).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Qtd Afetada</Label>
                  <Input type="number" value={form.qty_affected} onChange={(e) => setForm({ ...form, qty_affected: e.target.value })} placeholder="0" />
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
                <div className="col-span-2">
                  <Label className="text-xs">Descrição</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Descreva a não conformidade..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={!form.type || createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Registrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(treatmentConfig).map(([key, cfg]) => (
          <div key={key} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{cfg.label}</p>
            <p className="text-xl font-bold font-condensed text-foreground mt-1">{counts[key] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {["all", ...Object.keys(treatmentConfig)].map((key) => (
            <button
              key={key}
              onClick={() => setFilterTreatment(key)}
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-medium border transition-colors",
                filterTreatment === key ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {key === "all" ? "Todas" : treatmentConfig[key]?.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="pl-8 h-8 text-xs" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {ncs.length === 0 ? "Nenhuma NC registrada" : "Nenhum resultado para os filtros"}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((nc) => {
            const sevCfg = severityConfig[nc.severity] || severityConfig.medium;
            const treatCfg = treatmentConfig[nc.treatment_status] || treatmentConfig.pending;
            return (
              <div key={nc.id} className="rounded-xl border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                    nc.severity === "critical" || nc.severity === "high" ? "bg-destructive/10" : "bg-warning/10"
                  )}>
                    {nc.severity === "critical" || nc.severity === "high"
                      ? <AlertTriangle className="h-4 w-4 text-destructive" />
                      : <ShieldAlert className="h-4 w-4 text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{ncTypes[nc.type] || nc.type}</p>
                      <Badge variant="outline" className={cn("text-[9px]", sevCfg.color)}>{sevCfg.label}</Badge>
                      <Badge variant="outline" className={cn("text-[9px]", treatCfg.color)}>{treatCfg.label}</Badge>
                    </div>
                    {nc.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{nc.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>{format(parseISO(nc.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                      {nc.supplier_name && <span>Fornecedor: {nc.supplier_name}</span>}
                      {nc.sku_name && <span>SKU: {nc.sku_name}</span>}
                      {nc.qty_affected != null && <span>Qtd: {nc.qty_affected}</span>}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {nc.treatment_status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1"
                        onClick={() => {
                          setSelectedNC(nc);
                          setTreatForm({
                            treatment_status: nc.treatment_status === "pending" ? "analyzing" : "resolved",
                            treatment_action: nc.treatment_action || "",
                          });
                          setTreatOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3" /> Tratar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Treat Dialog */}
      <Dialog open={treatOpen} onOpenChange={setTreatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tratar Não Conformidade</DialogTitle>
          </DialogHeader>
          {selectedNC && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
                <p><strong>Tipo:</strong> {ncTypes[selectedNC.type] || selectedNC.type}</p>
                {selectedNC.description && <p><strong>Descrição:</strong> {selectedNC.description}</p>}
                {selectedNC.supplier_name && <p><strong>Fornecedor:</strong> {selectedNC.supplier_name}</p>}
              </div>
              <div>
                <Label className="text-xs">Novo Status</Label>
                <Select value={treatForm.treatment_status} onValueChange={(v) => setTreatForm({ ...treatForm, treatment_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyzing">Em Análise</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ação de Tratamento</Label>
                <Textarea
                  value={treatForm.treatment_action}
                  onChange={(e) => setTreatForm({ ...treatForm, treatment_action: e.target.value })}
                  rows={3}
                  placeholder="Descreva a ação tomada..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTreatOpen(false)}>Cancelar</Button>
            <Button onClick={handleTreat} disabled={!treatForm.treatment_status || updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
