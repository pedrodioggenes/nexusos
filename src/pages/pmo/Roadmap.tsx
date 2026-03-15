import { useState } from "react";
import { Map, LayoutGrid, List, Plus, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePMOInitiatives, useCreateInitiative, useUpdateInitiative } from "@/hooks/usePMO";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Initiative = Record<string, any>;

const priorityLabels: Record<string, string> = { now: "Agora", later: "Depois", never: "Nunca" };
const statusLabels: Record<string, string> = { proposed: "Proposto", evaluating: "Em avaliação", approved: "Aprovado", in_progress: "Em execução", completed: "Concluído", archived: "Arquivado" };
const areas = ["TI", "Marketing", "Trade", "RH", "Operação", "Financeiro"];

const PMORoadmap = () => {
  const { data: initiatives = [], isLoading } = usePMOInitiatives();
  const createMutation = useCreateInitiative();
  const updateMutation = useUpdateInitiative();

  const [view, setView] = useState<"table" | "matrix">("table");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Initiative | null>(null);
  const [form, setForm] = useState({ title: "", description: "", area: "", impact_score: "3", effort_score: "3", priority: "later", status: "proposed", kpi_expected: "", risks: "", owner_name: "" });

  const resetForm = () => setForm({ title: "", description: "", area: "", impact_score: "3", effort_score: "3", priority: "later", status: "proposed", kpi_expected: "", risks: "", owner_name: "" });

  const handleCreate = async () => {
    if (!form.title) return;
    await createMutation.mutateAsync(form);
    setCreateOpen(false);
    resetForm();
  };

  const handleStatusChange = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
  };

  const active = initiatives.filter(i => i.status !== "archived");

  const getQuadrant = (impact: number, effort: number) => {
    if (impact >= 3 && effort <= 3) return "quick-wins";
    if (impact >= 3 && effort > 3) return "strategic";
    if (impact < 3 && effort <= 3) return "fill-ins";
    return "avoid";
  };

  const quadrants = {
    "quick-wins": { label: "Quick Wins", desc: "Alto impacto · Baixo esforço", color: "border-emerald-500/30 bg-emerald-500/5" },
    strategic: { label: "Estratégicos", desc: "Alto impacto · Alto esforço", color: "border-app-pmo/30 bg-app-pmo/5" },
    "fill-ins": { label: "Complementares", desc: "Baixo impacto · Baixo esforço", color: "border-amber-500/30 bg-amber-500/5" },
    avoid: { label: "Evitar", desc: "Baixo impacto · Alto esforço", color: "border-red-500/30 bg-red-500/5" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <Map className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Roadmap & Prioridades</h1>
            <p className="text-sm text-muted-foreground">Matriz de impacto financeiro vs esforço</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Tabs value={view} onValueChange={v => setView(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="table" className="h-7 text-xs"><List className="h-3.5 w-3.5 mr-1" /> Tabela</TabsTrigger>
              <TabsTrigger value="matrix" className="h-7 text-xs"><LayoutGrid className="h-3.5 w-3.5 mr-1" /> Matriz</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-app-pmo hover:bg-app-pmo/90 text-white">
            <Plus className="h-4 w-4 mr-1" /> Nova Iniciativa
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Iniciativa</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Área</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">Impacto</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">Esforço</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">Score</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">Prioridade</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Dono</th>
                  </tr>
                </thead>
                <tbody>
                  {active.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma iniciativa cadastrada. Clique em "Nova Iniciativa" para começar.</td></tr>
                  ) : active.map(ini => (
                    <tr key={ini.id} className="border-b border-border hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => setDetailItem(ini)}>
                      <td className="p-3 font-medium text-foreground max-w-[200px] truncate">{ini.title}</td>
                      <td className="p-3 text-muted-foreground">{ini.area || "—"}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{ini.impact_score ?? "—"}</Badge></td>
                      <td className="p-3 text-center"><Badge variant="outline" className="text-[10px]">{ini.effort_score ?? "—"}</Badge></td>
                      <td className="p-3 text-center font-semibold text-app-pmo">{ini.calculated_score ?? "—"}</td>
                      <td className="p-3 text-center">
                        <Badge className={cn("text-[10px]", ini.priority === "now" ? "bg-emerald-500/20 text-emerald-700" : ini.priority === "never" ? "bg-red-500/20 text-red-700" : "bg-amber-500/20 text-amber-700")}>
                          {priorityLabels[ini.priority] || "—"}
                        </Badge>
                      </td>
                      <td className="p-3 text-center"><Badge variant="secondary" className="text-[10px]">{statusLabels[ini.status] || ini.status}</Badge></td>
                      <td className="p-3 text-muted-foreground">{ini.owner_name || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(quadrants).map(([key, q]) => {
            const items = active.filter(i => getQuadrant(i.impact_score || 0, i.effort_score || 0) === key);
            return (
              <Card key={key} className={cn("border-2", q.color)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{q.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">{q.desc}</p>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">Nenhuma iniciativa neste quadrante.</p>
                  ) : items.map(i => (
                    <div key={i.id} className="flex items-center justify-between py-1 cursor-pointer hover:bg-muted/20 rounded px-2" onClick={() => setDetailItem(i)}>
                      <span className="text-sm text-foreground truncate">{i.title}</span>
                      <span className="text-xs text-app-pmo font-semibold shrink-0 ml-2">{i.calculated_score}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nova Iniciativa</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div><Label>Título *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Área</Label>
                <Select value={form.area} onValueChange={v => setForm(p => ({ ...p, area: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Dono</Label><Input value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Impacto (1-5)</Label><Input type="number" min={1} max={5} value={form.impact_score} onChange={e => setForm(p => ({ ...p, impact_score: e.target.value }))} /></div>
              <div><Label>Esforço (1-5)</Label><Input type="number" min={1} max={5} value={form.effort_score} onChange={e => setForm(p => ({ ...p, effort_score: e.target.value }))} /></div>
              <div><Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Agora</SelectItem>
                    <SelectItem value="later">Depois</SelectItem>
                    <SelectItem value="never">Nunca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>KPI esperado</Label><Input value={form.kpi_expected} onChange={e => setForm(p => ({ ...p, kpi_expected: e.target.value }))} /></div>
            <div><Label>Riscos</Label><Textarea value={form.risks} onChange={e => setForm(p => ({ ...p, risks: e.target.value }))} rows={2} /></div>
            <Button onClick={handleCreate} disabled={!form.title || createMutation.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">
              Criar Iniciativa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <SheetContent className="overflow-y-auto">
          {detailItem && (
            <>
              <SheetHeader>
                <SheetTitle>{detailItem.title}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted-foreground">Área</p><p className="text-sm font-medium">{detailItem.area || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Dono</p><p className="text-sm font-medium">{detailItem.owner_name || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Impacto</p><p className="text-sm font-medium">{detailItem.impact_score ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Esforço</p><p className="text-sm font-medium">{detailItem.effort_score ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Score</p><p className="text-sm font-semibold text-app-pmo">{detailItem.calculated_score ?? "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Prioridade</p><Badge className="text-xs">{priorityLabels[detailItem.priority] || "—"}</Badge></div>
                </div>
                {detailItem.description && <div><p className="text-xs text-muted-foreground">Descrição</p><p className="text-sm">{detailItem.description}</p></div>}
                {detailItem.kpi_expected && <div><p className="text-xs text-muted-foreground">KPI Esperado</p><p className="text-sm">{detailItem.kpi_expected}</p></div>}
                {detailItem.risks && <div><p className="text-xs text-muted-foreground">Riscos</p><p className="text-sm">{detailItem.risks}</p></div>}
                {detailItem.dependencies && <div><p className="text-xs text-muted-foreground">Dependências</p><p className="text-sm">{detailItem.dependencies}</p></div>}
                <div>
                  <Label className="text-xs text-muted-foreground">Alterar Status</Label>
                  <Select value={detailItem.status || "proposed"} onValueChange={v => { handleStatusChange(detailItem.id, v); setDetailItem({ ...detailItem, status: v }); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PMORoadmap;