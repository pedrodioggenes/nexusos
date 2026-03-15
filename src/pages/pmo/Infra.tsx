import { useState } from "react";
import { Wrench, Plus, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePMOToolsCosts, useCreateToolCost } from "@/hooks/usePMO";

const statusMap: Record<string, { label: string; color: string }> = {
  proposto: { label: "Proposto", color: "bg-amber-500/10 text-amber-600" },
  aprovado: { label: "Aprovado", color: "bg-green-500/10 text-green-600" },
  ativo: { label: "Ativo", color: "bg-blue-500/10 text-blue-600" },
  cancelado: { label: "Cancelado", color: "bg-red-500/10 text-red-600" },
};

const PMOInfra = () => {
  const { data: tools = [], isLoading } = usePMOToolsCosts();
  const createTool = useCreateToolCost();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", vendor: "", estimated_cost: "", status: "proposto" });

  const handleCreate = () => {
    if (!form.name) return;
    createTool.mutate({ ...form, estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null }, { onSuccess: () => { setOpen(false); setForm({ name: "", vendor: "", estimated_cost: "", status: "proposto" }); } });
  };

  const totalCost = tools.reduce((sum: number, t: any) => sum + (Number(t.estimated_cost) || 0), 0);
  const approvedCost = tools.filter((t: any) => t.status === "aprovado" || t.status === "ativo").reduce((sum: number, t: any) => sum + (Number(t.estimated_cost) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Infra & Custos</h1>
            <p className="text-sm text-muted-foreground">Ferramentas, assinaturas e aprovações</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-app-pmo hover:bg-app-pmo/90 text-white"><Plus className="h-4 w-4 mr-1" />Nova Ferramenta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Ferramenta</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Fornecedor</Label><Input value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} /></div>
              <div><Label>Custo Estimado (R$)</Label><Input type="number" value={form.estimated_cost} onChange={e => setForm(p => ({ ...p, estimated_cost: e.target.value }))} /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(statusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createTool.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{tools.length}</p>
          <p className="text-xs text-muted-foreground">Ferramentas</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-app-pmo">R$ {totalCost.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground">Custo Total/Mês</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">R$ {approvedCost.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground">Aprovado/Mês</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : tools.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhuma ferramenta registrada.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {tools.map((t: any) => {
            const st = statusMap[t.status] || statusMap.proposto;
            return (
              <Card key={t.id} className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-app-pmo shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{t.name}</p>
                      <Badge className={st.color}>{st.label}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex gap-3">
                      {t.vendor && <span>{t.vendor}</span>}
                      {t.estimated_cost != null && <span className="font-medium">R$ {Number(t.estimated_cost).toLocaleString("pt-BR")}/mês</span>}
                    </div>
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

export default PMOInfra;