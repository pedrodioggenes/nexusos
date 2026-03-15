import { useState } from "react";
import { Zap, Plus, ChevronRight, CheckCircle2 } from "lucide-react";
import { ReportButton } from "@/components/pmo/ReportGeneratorDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePMOSprints, useCreateSprint, useUpdateSprint, usePMOSprintItems, useCreateSprintItem, usePMOInitiatives } from "@/hooks/usePMO";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const statusBadge: Record<string, string> = { planning: "bg-amber-500/20 text-amber-700", active: "bg-emerald-500/20 text-emerald-700", completed: "bg-app-pmo/20 text-app-pmo" };

const PMOSprints = () => {
  const { data: sprints = [] } = usePMOSprints();
  const { data: initiatives = [] } = usePMOInitiatives();
  const createSprint = useCreateSprint();
  const updateSprint = useUpdateSprint();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [form, setForm] = useState({ name: "", goals: "", start_date: "", end_date: "" });

  const { data: sprintItems = [] } = usePMOSprintItems(selectedSprint || undefined);
  const createItem = useCreateSprintItem();

  const handleCreate = async () => {
    if (!form.name) return;
    await createSprint.mutateAsync({ ...form, status: "planning" });
    setCreateOpen(false);
    setForm({ name: "", goals: "", start_date: "", end_date: "" });
  };

  const handleAddItem = async (initiativeId: string) => {
    if (!selectedSprint) return;
    await createItem.mutateAsync({ sprint_id: selectedSprint, initiative_id: initiativeId });
    setAddItemOpen(false);
  };

  const sprint = sprints.find(s => s.id === selectedSprint);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Sprints & Construções</h1>
            <p className="text-sm text-muted-foreground">Acompanhamento de ciclos de desenvolvimento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ReportButton reportType="sprint_review" label="Relatório" />
          <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-app-pmo hover:bg-app-pmo/90 text-white">
            <Plus className="h-4 w-4 mr-1" /> Nova Sprint
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-3">
          {sprints.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhuma sprint criada. Comece organizando seu backlog em ciclos.</CardContent></Card>
          ) : sprints.map(s => (
            <Card
              key={s.id}
              className={cn("cursor-pointer transition-all hover:shadow-sm", selectedSprint === s.id && "ring-2 ring-app-pmo/50")}
              onClick={() => setSelectedSprint(s.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <Badge className={cn("text-[10px]", statusBadge[s.status || "planning"])}>
                    {s.status === "active" ? "Ativa" : s.status === "completed" ? "Concluída" : "Planejando"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.start_date || "—"} → {s.end_date || "—"}</p>
                {s.goals && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.goals}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!selectedSprint ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Selecione uma sprint para ver os detalhes.</CardContent></Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{sprint?.name} — Itens</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setAddItemOpen(true)}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Item
                    </Button>
                    {sprint?.status !== "completed" && (
                      <Button size="sm" variant="outline" onClick={() => updateSprint.mutate({ id: selectedSprint, status: sprint?.status === "planning" ? "active" : "completed" })}>
                        {sprint?.status === "planning" ? "Iniciar Sprint" : "Encerrar Sprint"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sprintItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum item na sprint. Adicione iniciativas do backlog.</p>
                ) : (
                  <div className="space-y-2">
                    {sprintItems.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <CheckCircle2 className={cn("h-4 w-4 shrink-0", item.status === "done" ? "text-emerald-500" : "text-muted-foreground")} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.pmo_initiatives?.title || "Iniciativa"}</p>
                          <p className="text-xs text-muted-foreground">{item.pmo_initiatives?.area || "—"} · {item.status || "pending"}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{item.status || "pending"}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Sprint</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Sprint 001" /></div>
            <div><Label>Metas</Label><Textarea value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Início</Label><Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
              <div><Label>Fim</Label><Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} /></div>
            </div>
            <Button onClick={handleCreate} disabled={!form.name || createSprint.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Criar Sprint</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Iniciativa à Sprint</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {initiatives.filter(i => i.status !== "archived" && i.status !== "completed").map(ini => (
              <div key={ini.id} className="flex items-center justify-between py-2 border-b border-border cursor-pointer hover:bg-muted/20 rounded px-2" onClick={() => handleAddItem(ini.id)}>
                <div>
                  <p className="text-sm font-medium text-foreground">{ini.title}</p>
                  <p className="text-xs text-muted-foreground">{ini.area || "—"} · Score {ini.calculated_score ?? "—"}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
            {initiatives.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma iniciativa disponível. Crie no Roadmap primeiro.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PMOSprints;