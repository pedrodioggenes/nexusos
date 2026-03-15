import { useState } from "react";
import { Headset, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePMOIncidents, useCreateIncident } from "@/hooks/usePMO";
import { format } from "date-fns";

const severityMap: Record<string, { label: string; color: string }> = {
  baixa: { label: "Baixa", color: "bg-green-500/10 text-green-600" },
  media: { label: "Média", color: "bg-amber-500/10 text-amber-600" },
  alta: { label: "Alta", color: "bg-orange-500/10 text-orange-600" },
  critica: { label: "Crítica", color: "bg-red-500/10 text-red-600" },
};

const statusMap: Record<string, { label: string; color: string }> = {
  aberto: { label: "Aberto", color: "bg-red-500/10 text-red-600" },
  em_andamento: { label: "Investigando", color: "bg-amber-500/10 text-amber-600" },
  resolvido: { label: "Resolvido", color: "bg-green-500/10 text-green-600" },
};

const PMOSuporte = () => {
  const { data: incidents = [], isLoading } = usePMOIncidents();
  const createIncident = useCreateIncident();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", severity: "media", affected_system: "", impact: "", status: "aberto" });

  const handleCreate = () => {
    if (!form.title) return;
    createIncident.mutate(form, { onSuccess: () => { setOpen(false); setForm({ title: "", severity: "media", affected_system: "", impact: "", status: "aberto" }); } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <Headset className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Suporte & SLA</h1>
            <p className="text-sm text-muted-foreground">Incidentes, resolução e postmortem</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-app-pmo hover:bg-app-pmo/90 text-white"><Plus className="h-4 w-4 mr-1" />Novo Incidente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Incidente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Severidade</Label>
                <Select value={form.severity} onValueChange={v => setForm(p => ({ ...p, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(severityMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Sistema Afetado</Label><Input value={form.affected_system} onChange={e => setForm(p => ({ ...p, affected_system: e.target.value }))} /></div>
              <div><Label>Impacto</Label><Textarea value={form.impact} onChange={e => setForm(p => ({ ...p, impact: e.target.value }))} rows={2} /></div>
              <Button onClick={handleCreate} disabled={createIncident.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Abertos", value: incidents.filter((i: any) => i.status === "aberto").length, color: "text-red-500" },
          { label: "Investigando", value: incidents.filter((i: any) => i.status === "em_andamento").length, color: "text-amber-500" },
          { label: "Resolvidos", value: incidents.filter((i: any) => i.status === "resolvido").length, color: "text-green-500" },
          { label: "Críticos", value: incidents.filter((i: any) => i.severity === "critica").length, color: "text-red-600" },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : incidents.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum incidente registrado.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc: any) => {
            const sev = severityMap[inc.severity] || severityMap.media;
            const st = statusMap[inc.status] || statusMap.aberto;
            return (
              <Card key={inc.id} className="border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${inc.severity === "critica" ? "text-red-500" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{inc.title}</p>
                      <Badge className={sev.color}>{sev.label}</Badge>
                      <Badge className={st.color}>{st.label}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex gap-3 flex-wrap">
                      {inc.affected_system && <span>Sistema: {inc.affected_system}</span>}
                      {inc.created_at && <span>{format(new Date(inc.created_at), "dd/MM/yyyy HH:mm")}</span>}
                    </div>
                    {inc.impact && <p className="text-xs text-muted-foreground mt-1">{inc.impact}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PMOSuporte;
