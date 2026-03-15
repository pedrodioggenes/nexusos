import { useState } from "react";
import { FileBarChart, Plus, Eye, Pencil, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePMOWeeklyReports, useCreateWeeklyReport, useUpdateWeeklyReport } from "@/hooks/usePMO";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Report = Record<string, any>;

const PMODashboardSemanal = () => {
  const { data: reports = [] } = usePMOWeeklyReports();
  const createReport = useCreateWeeklyReport();
  const updateReport = useUpdateWeeklyReport();

  const [createOpen, setCreateOpen] = useState(false);
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ week_start: "", week_end: "" });
  const [editContent, setEditContent] = useState({ completed: "", in_progress: "", blockers: "", decisions_needed: "", next_steps: "" });

  const nextEdition = reports.length > 0 ? Math.max(...reports.map(r => r.edition)) + 1 : 1;

  const handleCreate = async () => {
    if (!form.week_start || !form.week_end) return;
    await createReport.mutateAsync({
      ...form,
      edition: nextEdition,
      status: "draft",
      content: { completed: "", in_progress: "", blockers: "", decisions_needed: "", next_steps: "" },
    });
    setCreateOpen(false);
    setForm({ week_start: "", week_end: "" });
  };

  const handleOpenView = (report: Report) => {
    setViewReport(report);
    const c = report.content as any || {};
    setEditContent({
      completed: c.completed || "",
      in_progress: c.in_progress || "",
      blockers: c.blockers || "",
      decisions_needed: c.decisions_needed || "",
      next_steps: c.next_steps || "",
    });
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!viewReport) return;
    await updateReport.mutateAsync({ id: viewReport.id, content: editContent });
    setEditMode(false);
  };

  const handlePublish = async () => {
    if (!viewReport) return;
    await updateReport.mutateAsync({ id: viewReport.id, content: editContent, status: "published" });
    setViewReport(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <FileBarChart className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Dashboard Semanal (WBR)</h1>
            <p className="text-sm text-muted-foreground">Relatório semanal de gestão</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-app-pmo hover:bg-app-pmo/90 text-white">
          <Plus className="h-4 w-4 mr-1" /> Gerar WBR #{String(nextEdition).padStart(3, "0")}
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Nenhum dashboard semanal criado. Gere o primeiro WBR para começar a consolidar o avanço.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(r => (
            <Card key={r.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => handleOpenView(r)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">WBR #{String(r.edition).padStart(3, "0")}</p>
                  <Badge className={cn("text-[10px]", r.status === "published" ? "bg-emerald-500/20 text-emerald-700" : "bg-amber-500/20 text-amber-700")}>
                    {r.status === "published" ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.week_start} → {r.week_end}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gerar Dashboard Semanal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Edição: <strong>WBR #{String(nextEdition).padStart(3, "0")}</strong></p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Início da Semana</Label><Input type="date" value={form.week_start} onChange={e => setForm(p => ({ ...p, week_start: e.target.value }))} /></div>
              <div><Label>Fim da Semana</Label><Input type="date" value={form.week_end} onChange={e => setForm(p => ({ ...p, week_end: e.target.value }))} /></div>
            </div>
            <Button onClick={handleCreate} disabled={!form.week_start || !form.week_end || createReport.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Criar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={!!viewReport} onOpenChange={() => setViewReport(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          {viewReport && (
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle>WBR #{String(viewReport.edition).padStart(3, "0")}</SheetTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditMode(!editMode)}>
                      {editMode ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => window.print()}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <p className="text-xs text-muted-foreground">{viewReport.week_start} → {viewReport.week_end}</p>
                {[
                  { key: "completed", label: "✅ Concluído na Semana" },
                  { key: "in_progress", label: "🔄 Em Andamento" },
                  { key: "blockers", label: "🚫 Bloqueios" },
                  { key: "decisions_needed", label: "❓ Decisões Necessárias" },
                  { key: "next_steps", label: "➡️ Próximos Passos" },
                ].map(section => (
                  <div key={section.key}>
                    <Label className="text-xs font-semibold">{section.label}</Label>
                    {editMode ? (
                      <Textarea
                        value={(editContent as any)[section.key]}
                        onChange={e => setEditContent(p => ({ ...p, [section.key]: e.target.value }))}
                        rows={3}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{(editContent as any)[section.key] || "—"}</p>
                    )}
                  </div>
                ))}
                {editMode && (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={updateReport.isPending} className="flex-1 bg-app-pmo hover:bg-app-pmo/90 text-white">Salvar</Button>
                    <Button onClick={handlePublish} variant="outline" disabled={updateReport.isPending} className="flex-1">Publicar</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PMODashboardSemanal;