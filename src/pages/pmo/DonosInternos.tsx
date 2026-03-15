import { useState } from "react";
import { UserCheck, Plus, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePMOInternalOwners, useCreateInternalOwner } from "@/hooks/usePMO";

const maturityLevels: Record<string, { label: string; color: string }> = {
  iniciante: { label: "Iniciante", color: "bg-muted text-muted-foreground" },
  intermediario: { label: "Intermediário", color: "bg-amber-500/10 text-amber-600" },
  autonomo: { label: "Autônomo", color: "bg-green-500/10 text-green-600" },
};

const roleLabels: Record<string, { label: string; color: string }> = {
  bpo: { label: "BPO", color: "bg-app-pmo/10 text-app-pmo" },
  sponsor: { label: "Sponsor Executivo", color: "bg-blue-500/10 text-blue-600" },
  cto: { label: "Fractional CTO", color: "bg-purple-500/10 text-purple-600" },
};

const PMODonosInternos = () => {
  const { data: owners = [], isLoading } = usePMOInternalOwners();
  const createOwner = useCreateInternalOwner();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ person_name: "", area: "", role_title: "bpo", maturity_level: "iniciante" });

  const handleCreate = () => {
    if (!form.person_name) return;
    createOwner.mutate(form, { onSuccess: () => { setOpen(false); setForm({ person_name: "", area: "", role_title: "bpo", maturity_level: "iniciante" }); } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-app-pmo" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">BPOs & Responsáveis</h1>
            <p className="text-sm text-muted-foreground">BPOs, Sponsors e evolução de autonomia</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-app-pmo hover:bg-app-pmo/90 text-white"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Dono Interno</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.person_name} onChange={e => setForm(p => ({ ...p, person_name: e.target.value }))} /></div>
              <div><Label>Área</Label><Input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} /></div>
              <div><Label>Papel</Label>
                <Select value={form.role_title} onValueChange={v => setForm(p => ({ ...p, role_title: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Nível de Maturidade</Label>
                <Select value={form.maturity_level} onValueChange={v => setForm(p => ({ ...p, maturity_level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(maturityLevels).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createOwner.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
      ) : owners.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum dono interno registrado.</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owners.map((o: any) => {
            const ml = maturityLevels[o.maturity_level] || maturityLevels.iniciante;
            return (
              <Card key={o.id} className="border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{o.person_name}</CardTitle>
                    <Badge className={ml.color}>{ml.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  {o.area && <p>Área: {o.area}</p>}
                  {o.role_title && (
                    <div className="flex items-center gap-1">
                      <span>Papel:</span>
                      <Badge className={`text-[10px] ${roleLabels[o.role_title]?.color || "bg-muted text-muted-foreground"}`}>
                        {roleLabels[o.role_title]?.label || o.role_title}
                      </Badge>
                    </div>
                  )}
                  <div className="flex gap-0.5 pt-1">
                    {[1,2,3].map(i => (
                      <Star key={i} className={`h-3 w-3 ${i <= (Object.keys(maturityLevels).indexOf(o.maturity_level) + 1) ? "text-app-pmo fill-app-pmo" : "text-muted"}`} />
                    ))}
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

export default PMODonosInternos;
