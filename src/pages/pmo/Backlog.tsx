import { useState } from "react";
import { Columns3, Plus, AlertTriangle, FileText } from "lucide-react";
import { ReportButton } from "@/components/pmo/ReportGeneratorDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePMOInitiatives, useUpdateInitiative, useCreateInitiative } from "@/hooks/usePMO";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "backlog", label: "Backlog", color: "border-t-muted-foreground" },
  { key: "planejado", label: "Planejado", color: "border-t-app-pmo" },
  { key: "em_andamento", label: "Em Andamento", color: "border-t-blue-500" },
  { key: "bloqueado", label: "Bloqueado", color: "border-t-red-500" },
  { key: "em_validacao", label: "Em Validação", color: "border-t-amber-500" },
  { key: "concluido", label: "Concluído", color: "border-t-emerald-500" },
];

const priorityColors: Record<string, string> = { agora: "bg-emerald-500/20 text-emerald-700", depois: "bg-amber-500/20 text-amber-700", nunca: "bg-red-500/20 text-red-700" };

const PMOBacklog = () => {
  const { data: initiatives = [] } = usePMOInitiatives();
  const updateMutation = useUpdateInitiative();
  const createMutation = useCreateInitiative();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", area: "", priority: "depois", owner_name: "", description: "" });
  const [dragItem, setDragItem] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!form.title) return;
    await createMutation.mutateAsync({ ...form, stage: "backlog", status: "proposto" });
    setCreateOpen(false);
    setForm({ title: "", area: "", priority: "depois", owner_name: "", description: "" });
  };

  const handleDrop = (stage: string) => {
    if (!dragItem) return;
    const statusMap: Record<string, string> = { backlog: "proposto", planejado: "aprovado", em_andamento: "em_execucao", bloqueado: "em_execucao", em_validacao: "em_execucao", concluido: "concluido" };
    updateMutation.mutate({ id: dragItem, stage, status: statusMap[stage] || "proposto" });
    setDragItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <Columns3 className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Backlog</h1>
            <p className="text-sm text-muted-foreground">Kanban de execução — 6 colunas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ReportButton reportType="iniciativas" label="Relatório" />
          <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-app-pmo hover:bg-app-pmo/90 text-white">
            <Plus className="h-4 w-4 mr-1" /> Nova Tarefa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[60vh]">
        {STAGES.map(stage => {
          const items = initiatives.filter(i => (i.stage || "backlog") === stage.key);
          return (
            <div
              key={stage.key}
              className={cn("rounded-xl border border-border bg-muted/20 flex flex-col border-t-4", stage.color)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="p-2 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                  <Badge variant="secondary" className="text-[10px] h-5">{items.length}</Badge>
                </div>
              </div>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[50vh]">
                {items.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDragItem(item.id)}
                    className="p-2.5 rounded-lg bg-card border border-border cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                  >
                    <p className="text-xs font-medium text-foreground line-clamp-2">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {item.priority && (
                        <Badge className={cn("text-[9px] h-4", priorityColors[item.priority])}>
                          {item.priority === "agora" ? "Agora" : item.priority === "depois" ? "Depois" : "Nunca"}
                        </Badge>
                      )}
                      {item.area && <Badge variant="outline" className="text-[9px] h-4">{item.area}</Badge>}
                      {item.stage === "bloqueado" && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    </div>
                    {item.owner_name && <p className="text-[10px] text-muted-foreground mt-1">{item.owner_name}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Área</Label>
                <Select value={form.area} onValueChange={v => setForm(p => ({ ...p, area: v }))}>
                  <SelectTrigger><SelectValue placeholder="Área" /></SelectTrigger>
                  <SelectContent>{["TI", "Marketing", "Trade", "RH", "Operação"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agora">Agora</SelectItem>
                    <SelectItem value="depois">Depois</SelectItem>
                    <SelectItem value="nunca">Nunca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Dono</Label><Input value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))} /></div>
            <Button onClick={handleCreate} disabled={!form.title || createMutation.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Criar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMOBacklog;