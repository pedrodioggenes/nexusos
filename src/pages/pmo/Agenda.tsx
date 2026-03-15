import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePMOWorkAgenda, useCreateWorkAgenda } from "@/hooks/usePMO";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeMap: Record<string, { label: string; color: string }> = {
  presencial: { label: "Presencial", color: "bg-green-500/10 text-green-600" },
  remoto: { label: "Remoto", color: "bg-blue-500/10 text-blue-600" },
  rito: { label: "Rito", color: "bg-purple-500/10 text-purple-600" },
  imersao: { label: "Imersão", color: "bg-amber-500/10 text-amber-600" },
  build: { label: "Build", color: "bg-app-pmo/10 text-app-pmo" },
};

const PMOAgenda = () => {
  const { data: events = [], isLoading } = usePMOWorkAgenda();
  const createEvent = useCreateWorkAgenda();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", event_type: "presencial", event_date: "", results: "" });

  const handleCreate = () => {
    if (!form.title || !form.event_date) return;
    createEvent.mutate(form, { onSuccess: () => { setOpen(false); setForm({ title: "", event_type: "presencial", event_date: "", results: "" }); } });
  };

  // Group by month
  const grouped = events.reduce((acc: Record<string, any[]>, ev: any) => {
    const month = ev.event_date ? format(new Date(ev.event_date), "yyyy-MM") : "sem-data";
    if (!acc[month]) acc[month] = [];
    acc[month].push(ev);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Agenda de Atuação</h1>
            <p className="text-sm text-muted-foreground">Presencial, remoto, ritos e imersões</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-app-pmo hover:bg-app-pmo/90 text-white"><Plus className="h-4 w-4 mr-1" />Novo Evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Evento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Data</Label><Input type="date" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))} /></div>
              <div><Label>Tipo</Label>
                <Select value={form.event_type} onValueChange={v => setForm(p => ({ ...p, event_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(typeMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Resultados/Notas</Label><Textarea value={form.results} onChange={e => setForm(p => ({ ...p, results: e.target.value }))} rows={2} /></div>
              <Button onClick={handleCreate} disabled={createEvent.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : events.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum evento na agenda.</CardContent></Card>
      ) : (
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([month, evts]) => (
          <div key={month}>
            <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              {month !== "sem-data" ? format(new Date(month + "-01"), "MMMM yyyy", { locale: ptBR }) : "Sem data"}
            </h2>
            <div className="space-y-2">
              {(evts as any[]).map((ev: any) => {
                const tp = typeMap[ev.event_type] || typeMap.presencial;
                return (
                  <Card key={ev.id} className="border-border">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="text-center shrink-0 w-12">
                        <p className="text-lg font-bold text-foreground">{ev.event_date ? format(new Date(ev.event_date), "dd") : "--"}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{ev.event_date ? format(new Date(ev.event_date), "EEE", { locale: ptBR }) : ""}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{ev.title}</p>
                          <Badge className={tp.color}>{tp.label}</Badge>
                        </div>
                        {ev.results && <p className="text-xs text-muted-foreground mt-0.5 truncate">{ev.results}</p>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PMOAgenda;
