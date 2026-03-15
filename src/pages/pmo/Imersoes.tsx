import { useState } from "react";
import { Compass, Plus, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePMOImmersions, useCreateImmersion } from "@/hooks/usePMO";
import { format } from "date-fns";

const statusMap: Record<string, { label: string; color: string }> = {
  planned: { label: "Planejada", color: "bg-blue-500/10 text-blue-600" },
  in_progress: { label: "Em Andamento", color: "bg-amber-500/10 text-amber-600" },
  completed: { label: "Concluída", color: "bg-green-500/10 text-green-600" },
};

const PMOImersoes = () => {
  const { data: immersions = [], isLoading } = usePMOImmersions();
  const createImmersion = useCreateImmersion();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ area: "", objective: "", status: "planned" });

  const handleCreate = () => {
    if (!form.area) return;
    createImmersion.mutate(form, { onSuccess: () => { setOpen(false); setForm({ area: "", objective: "", status: "planned" }); } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <Compass className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Imersões Operacionais</h1>
            <p className="text-sm text-muted-foreground">Mapeamento profundo por área</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-app-pmo hover:bg-app-pmo/90 text-white"><Plus className="h-4 w-4 mr-1" />Nova Imersão</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Imersão</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Área</Label><Input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} /></div>
              <div><Label>Objetivo</Label><Textarea value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))} rows={3} /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createImmersion.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : immersions.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhuma imersão registrada.</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {immersions.map((im: any) => {
            const st = statusMap[im.status] || statusMap.planned;
            return (
              <Card key={im.id} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-app-pmo" />
                      <CardTitle className="text-sm font-medium">{im.area}</CardTitle>
                    </div>
                    <Badge className={st.color}>{st.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                  {im.objective && <p>{im.objective}</p>}
                  {im.created_at && <p className="text-[10px]">{format(new Date(im.created_at), "dd/MM/yyyy")}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PMOImersoes;
