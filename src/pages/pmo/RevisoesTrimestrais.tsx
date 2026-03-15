import { useState } from "react";
import { RotateCcw, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePMOQuarterlyReviews, useCreateQuarterlyReview } from "@/hooks/usePMO";

const PMORevisoesTrimestrais = () => {
  const { data: reviews = [], isLoading } = usePMOQuarterlyReviews();
  const createReview = useCreateQuarterlyReview();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ cycle: "", diagnosis: "", roadmap_changes: "" });

  const handleCreate = () => {
    if (!form.cycle) return;
    const payload: any = { cycle: form.cycle, diagnosis: form.diagnosis };
    if (form.roadmap_changes) {
      try { payload.roadmap_changes = JSON.parse(form.roadmap_changes); } catch { payload.roadmap_changes = { notes: form.roadmap_changes }; }
    }
    createReview.mutate(payload, { onSuccess: () => { setOpen(false); setForm({ cycle: "", diagnosis: "", roadmap_changes: "" }); } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-module-pmo/10 flex items-center justify-center">
            <RotateCcw className="h-5 w-5 text-module-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Revisões Trimestrais (QBR)</h1>
            <p className="text-sm text-muted-foreground">Diagnóstico, roadmap e governança por ciclo</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-module-pmo hover:bg-module-pmo/90 text-white"><Plus className="h-4 w-4 mr-1" />Nova Revisão</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Revisão Trimestral</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Ciclo (ex: Q1 2026)</Label><Input value={form.cycle} onChange={e => setForm(p => ({ ...p, cycle: e.target.value }))} placeholder="Q1 2026" /></div>
              <div><Label>Diagnóstico</Label><Textarea value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} rows={4} /></div>
              <div><Label>Mudanças no Roadmap</Label><Textarea value={form.roadmap_changes} onChange={e => setForm(p => ({ ...p, roadmap_changes: e.target.value }))} rows={3} placeholder="Descreva as mudanças..." /></div>
              <Button onClick={handleCreate} disabled={createReview.isPending} className="w-full bg-module-pmo hover:bg-module-pmo/90 text-white">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : reviews.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhuma revisão trimestral registrada.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => (
            <Card key={r.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">{r.cycle}</CardTitle>
                  <Badge className="bg-module-pmo/10 text-module-pmo">QBR</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {r.diagnosis && <div><p className="text-xs font-medium text-foreground mb-1">Diagnóstico</p><p className="text-xs">{r.diagnosis}</p></div>}
                {r.roadmap_changes && (
                  <div><p className="text-xs font-medium text-foreground mb-1">Mudanças no Roadmap</p>
                    <p className="text-xs">{typeof r.roadmap_changes === "string" ? r.roadmap_changes : JSON.stringify(r.roadmap_changes, null, 2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PMORevisoesTrimestrais;
