import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft, Plus, FileCheck, CheckCircle2, Trash2, Pencil, Link2, ExternalLink,
} from "lucide-react";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Empty } from "@/components/ui/empty";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  useDemandById, demandPriorityConfig, demandTypeConfig, demandStatusConfig,
} from "@/hooks/useMarketingDemands";
import {
  useExecutionsByDemand, useDeleteExecution, useUpdateExecution,
  executionCategoryConfig, type ExecutionChannel, type MarketingExecution,
} from "@/hooks/useMarketingExecutions";
import { EXECUTION_CATEGORIES, CATEGORY_GROUPS } from "@/config/demandRetailFields";

export default function ExecucaoDetalhe() {
  const { demandId } = useParams<{ demandId: string }>();
  const navigate = useNavigate();
  const [editingExec, setEditingExec] = useState<MarketingExecution | null>(null);

  const { data: demand, isLoading: demandLoading } = useDemandById(demandId);
  const { data: executions = [], isLoading: execLoading } = useExecutionsByDemand(demandId);
  const deleteExecution = useDeleteExecution();

  const isLoading = demandLoading || execLoading;

  if (isLoading) {
    return (
      <PageWrapper title="Carregando..." icon={<FileCheck className="h-6 w-6 text-module-gestao" />}>
        <div className="flex items-center justify-center h-48">
          <div className="h-5 w-5 border-2 border-module-gestao/30 border-t-module-gestao rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!demand) {
    return (
      <PageWrapper title="Demanda não encontrada" icon={<FileCheck className="h-6 w-6 text-module-gestao" />}>
        <Empty icon={<FileCheck className="h-8 w-8" />} title="Demanda não encontrada" description="Verifique o link ou volte para a lista de execuções" />
      </PageWrapper>
    );
  }

  const plannedChannels = demand.channels || [];
  const executedChannels = [...new Set(executions.map((e) => e.channel))] as string[];
  const progress =
    plannedChannels.length > 0
      ? Math.round((plannedChannels.filter((ch) => executedChannels.includes(ch)).length / plannedChannels.length) * 100)
      : executions.length > 0 ? 100 : 0;

  const priorityCfg = demandPriorityConfig[demand.priority];
  const typeCfg = demandTypeConfig[demand.type];
  const statusCfg = demandStatusConfig[demand.status];

  return (
    <PageWrapper
      title={demand.title}
      subtitle="Gestão de execução da demanda"
      icon={<FileCheck className="h-6 w-6 text-module-gestao" />}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/app/marketing/execucoes")} className="gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Button>
          <Button size="sm" onClick={() => navigate(`/app/marketing/execucoes/${demandId}/nova`)} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Registrar Execução
          </Button>
        </div>
      }
    >
      {/* Demand Info Card */}
      <BlurFade delay={0.05}>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn("text-[10px] h-5 border-0", statusCfg.bgColor, statusCfg.color)}>{statusCfg.label}</Badge>
            <Badge variant="secondary" className="text-[10px] h-5">{typeCfg.icon} {typeCfg.label}</Badge>
            <Badge className={cn("text-[10px] h-5 border-0", priorityCfg.bgColor, priorityCfg.color)}>{priorityCfg.label}</Badge>
          </div>
          {demand.description && <p className="text-xs text-muted-foreground">{demand.description}</p>}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Progresso de execução</span>
              <span className="text-xs text-muted-foreground">
                {executions.length} execuç{executions.length === 1 ? "ão" : "ões"}
                {plannedChannels.length > 0 && ` · ${executedChannels.length}/${plannedChannels.length} categorias`}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            {plannedChannels.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {plannedChannels.map((ch) => {
                  const executed = executedChannels.includes(ch);
                  const cfg = executionCategoryConfig[ch];
                  return (
                    <Badge key={ch} variant="outline" className={cn("text-[10px] h-5", executed ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "text-muted-foreground")}>
                      {executed && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                      {cfg?.icon || "📋"} {cfg?.label || ch}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </BlurFade>

      {/* Executions Table */}
      <BlurFade delay={0.1}>
        {executions.length === 0 ? (
          <Empty icon={<FileCheck className="h-8 w-8" />} title="Nenhuma execução registrada" description="Clique em 'Registrar Execução' para começar" />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Link</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Evidência</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notas</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((exec) => {
                    const ch = executionCategoryConfig[exec.channel] || executionCategoryConfig.outros;
                    const hasEvidence = exec.evidence_urls.length > 0;
                    return (
                      <tr key={exec.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-xs">{format(new Date(exec.execution_date), "dd/MM/yyyy", { locale: ptBR })}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{ch.icon} {ch.label}</Badge></td>
                        <td className="px-4 py-3">
                          {exec.link_url ? (
                            <a href={exec.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-module-gestao hover:underline">
                              <Link2 className="h-3 w-3" /> Ver link
                            </a>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {hasEvidence ? (
                            <Badge className="text-[10px] h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> {exec.evidence_urls.length} arquivo{exec.evidence_urls.length > 1 ? "s" : ""}
                            </Badge>
                          ) : <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">Sem evidência</Badge>}
                        </td>
                        <td className="px-4 py-3 max-w-[200px]"><span className="text-xs text-muted-foreground truncate block">{exec.notes || "—"}</span></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditingExec(exec)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Excluir execução?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteExecution.mutate(exec.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </BlurFade>

      {editingExec && (
        <EditExecutionDialog open={!!editingExec} onOpenChange={(open) => !open && setEditingExec(null)} execution={editingExec} plannedChannels={plannedChannels} />
      )}
    </PageWrapper>
  );
}


function EditExecutionDialog({ open, onOpenChange, execution, plannedChannels }: {
  open: boolean; onOpenChange: (open: boolean) => void; execution: MarketingExecution; plannedChannels: string[];
}) {
  const [channel, setChannel] = useState<ExecutionChannel>(execution.channel);
  const [linkUrl, setLinkUrl] = useState(execution.link_url || "");
  const [notes, setNotes] = useState(execution.notes || "");
  const [executionDate, setExecutionDate] = useState(execution.execution_date.split("T")[0]);
  const updateExecution = useUpdateExecution();

  const availableChannels: [string, { label: string; icon: string }][] =
    plannedChannels.length > 0
      ? (Object.entries(executionCategoryConfig) as [string, { label: string; icon: string }][]).filter(([k]) => plannedChannels.includes(k))
      : (Object.entries(executionCategoryConfig) as [string, { label: string; icon: string }][]);

  const handleSubmit = () => {
    updateExecution.mutate({ id: execution.id, channel, execution_date: executionDate, link_url: linkUrl || null, notes: notes || null }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar Execução</DialogTitle><DialogDescription>Atualize os dados desta execução.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as ExecutionChannel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{availableChannels.map(([k, v]) => <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data da Execução</Label>
              <Input type="date" value={executionDate} onChange={(e) => setExecutionDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Link (post, anúncio, drive)</Label><Input placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} /></div>
          <div className="space-y-1.5"><Label className="text-xs">Observações</Label><Textarea placeholder="Detalhes sobre a execução..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={updateExecution.isPending}>{updateExecution.isPending ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}