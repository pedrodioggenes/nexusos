import { useState } from "react";
import { Gavel, Plus, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePMOApprovals, useCreateApproval, useUpdateApproval, usePMODecisions, useCreateDecision } from "@/hooks/usePMO";
import { format } from "date-fns";

const approvalStatusMap: Record<string, { label: string; icon: any; color: string }> = {
  pendente: { label: "Pendente", icon: Clock, color: "bg-amber-500/10 text-amber-600" },
  aprovado: { label: "Aprovado", icon: CheckCircle2, color: "bg-green-500/10 text-green-600" },
  rejeitado: { label: "Rejeitado", icon: XCircle, color: "bg-red-500/10 text-red-600" },
  ajuste_solicitado: { label: "Ajuste", icon: Clock, color: "bg-blue-500/10 text-blue-600" },
};

const PMOGovernanca = () => {
  const { data: approvals = [], isLoading: loadingA } = usePMOApprovals();
  const createApproval = useCreateApproval();
  const updateApproval = useUpdateApproval();
  const { data: decisions = [], isLoading: loadingD } = usePMODecisions();
  const createDecision = useCreateDecision();

  const [approvalOpen, setApprovalOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [aForm, setAForm] = useState({ entity_type: "", title: "", comments: "" });
  const [dForm, setDForm] = useState({ title: "", justification: "", impact: "", responsible: "" });

  const handleCreateApproval = () => {
    if (!aForm.entity_type) return;
    createApproval.mutate(aForm, { onSuccess: () => { setApprovalOpen(false); setAForm({ entity_type: "", title: "", comments: "" }); } });
  };

  const handleCreateDecision = () => {
    if (!dForm.title) return;
    createDecision.mutate({ ...dForm, decision_date: new Date().toISOString().split("T")[0] }, { onSuccess: () => { setDecisionOpen(false); setDForm({ title: "", justification: "", impact: "", responsible: "" }); } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-app-pmo/10 flex items-center justify-center">
          <Gavel className="h-5 w-5 text-app-pmo" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Governança</h1>
          <p className="text-sm text-muted-foreground">Aprovações pendentes e log de decisões</p>
        </div>
      </div>

      <Tabs defaultValue="approvals">
        <TabsList>
          <TabsTrigger value="approvals">Aprovações ({approvals.length})</TabsTrigger>
          <TabsTrigger value="decisions">Decisões ({decisions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-app-pmo hover:bg-app-pmo/90 text-white"><Plus className="h-4 w-4 mr-1" />Solicitar</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova Aprovação</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Tipo</Label><Input value={aForm.entity_type} onChange={e => setAForm(p => ({ ...p, entity_type: e.target.value }))} placeholder="Ex: ferramenta, contrato..." /></div>
                  <div><Label>Título</Label><Input value={aForm.title} onChange={e => setAForm(p => ({ ...p, title: e.target.value }))} placeholder="Descrição da aprovação" /></div>
                  <div><Label>Comentários</Label><Textarea value={aForm.comments} onChange={e => setAForm(p => ({ ...p, comments: e.target.value }))} rows={2} /></div>
                  <Button onClick={handleCreateApproval} disabled={createApproval.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Solicitar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loadingA ? <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div> : approvals.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhuma aprovação pendente.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {approvals.map((a: any) => {
                const st = approvalStatusMap[a.status] || approvalStatusMap.pendente;
                const Icon = st.icon;
                return (
                  <Card key={a.id} className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{a.title || a.entity_type}</p>
                          <Badge className={st.color}>{st.label}</Badge>
                        </div>
                        {a.comments && <p className="text-xs text-muted-foreground mt-0.5">{a.comments}</p>}
                      </div>
                      {a.status === "pendente" && (
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs border-green-500/30 text-green-600 hover:bg-green-500/10" onClick={() => updateApproval.mutate({ id: a.id, status: "aprovado" })}>Aprovar</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/30 text-red-600 hover:bg-red-500/10" onClick={() => updateApproval.mutate({ id: a.id, status: "rejeitado" })}>Rejeitar</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={decisionOpen} onOpenChange={setDecisionOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-app-pmo hover:bg-app-pmo/90 text-white"><Plus className="h-4 w-4 mr-1" />Registrar</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova Decisão</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Título</Label><Input value={dForm.title} onChange={e => setDForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div><Label>Justificativa</Label><Textarea value={dForm.justification} onChange={e => setDForm(p => ({ ...p, justification: e.target.value }))} rows={2} /></div>
                  <div><Label>Impacto</Label><Input value={dForm.impact} onChange={e => setDForm(p => ({ ...p, impact: e.target.value }))} /></div>
                  <div><Label>Responsável</Label><Input value={dForm.responsible} onChange={e => setDForm(p => ({ ...p, responsible: e.target.value }))} /></div>
                  <Button onClick={handleCreateDecision} disabled={createDecision.isPending} className="w-full bg-app-pmo hover:bg-app-pmo/90 text-white">Registrar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loadingD ? <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div> : decisions.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhuma decisão registrada.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {decisions.map((d: any) => (
                <Card key={d.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{d.title}</p>
                      {d.decision_date && <span className="text-[10px] text-muted-foreground">{format(new Date(d.decision_date), "dd/MM/yyyy")}</span>}
                    </div>
                    {d.justification && <p className="text-xs text-muted-foreground">{d.justification}</p>}
                    <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                      {d.impact && <span>Impacto: {d.impact}</span>}
                      {d.responsible && <span>Resp: {d.responsible}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PMOGovernanca;
