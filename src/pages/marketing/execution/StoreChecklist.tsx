import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExecutionEvidenceForRun, useExecutionEvidenceForItem } from "@/hooks/useExecutionEvidence";
import { EvidenceSection } from "@/components/marketing/execution/EvidenceSection";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChecklistItemCard } from "@/components/marketing/execution/ChecklistItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft, CheckCircle2, XCircle, MinusCircle, ChevronRight, Plus,
  Camera, AlertTriangle, Check, Loader2, MessageSquare
} from "lucide-react";
import {
  useExecutionRuns, useExecutionItems, useExecutionIssues, useRecalculateCompliance,
  EXECUTION_STATUSES, ITEM_CATEGORIES, ITEM_STATUS_OPTIONS, SEVERITY_OPTIONS, ISSUE_TYPES,
  ExecutionItem
} from "@/hooks/useRetailExecution";
import { useRetailActions } from "@/hooks/useRetailActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { buildComprovacaoUrl } from "@/utils/comprovacaoUrl";

export default function StoreChecklist() {
  const { retailActionId, storeId } = useParams<{ retailActionId: string; storeId: string }>();
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const { actions } = useRetailActions();
  const { runs } = useExecutionRuns(retailActionId);

  const action = actions.find(a => a.id === retailActionId);
  const run = runs.find(r => r.store_id === storeId);
  const runId = run?.id || null;

  const { items, updateItem } = useExecutionItems(runId);
  const { issues, createIssue, updateIssue } = useExecutionIssues(runId);
  const recalculate = useRecalculateCompliance(runId);
  const { runs: _r, updateRun } = useExecutionRuns(retailActionId);
  const { data: runEvidences = [], isLoading: runEvidencesLoading } = useExecutionEvidenceForRun(runId);

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [evidenceItemId, setEvidenceItemId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Fetch store name
  const { data: store } = useQuery({
    queryKey: ['unit-detail', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      const table: any = supabase.from('units');
      const { data } = await table.select('id, name').eq('id', storeId).single();
      return data as { id: string; name: string } | null;
    },
    enabled: !!storeId,
  });

  // Group items by category
  const grouped = useMemo(() => {
    const groups: Record<string, ExecutionItem[]> = {};
    items.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [items]);

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleStatusChange = async (itemId: string, status: string) => {
    await updateItem.mutateAsync({ id: itemId, status });
    recalculate.mutate();
  };

  const handleAddEvidence = async () => {
    if (!evidenceItemId || !evidenceUrl.trim()) return;
    const item = items.find(i => i.id === evidenceItemId);
    if (!item) return;
    const current = Array.isArray(item.evidence_urls) ? item.evidence_urls : [];
    await updateItem.mutateAsync({
      id: evidenceItemId,
      evidence_urls: [...current, evidenceUrl.trim()],
    });
    setEvidenceUrl("");
    setEvidenceItemId(null);
    toast.success('Evidência adicionada');
  };

  const handleCompleteExecution = async () => {
    if (!runId) return;
    const requiredPending = items.filter(i => i.required && i.status === 'pending');
    if (requiredPending.length > 0) {
      toast.error(`${requiredPending.length} item(ns) obrigatório(s) pendente(s)`);
      return;
    }
    await recalculate.mutateAsync();
    await updateRun.mutateAsync({
      id: runId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
    toast.success('Execução concluída!');
  };

  if (!run || !action) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">Execução não encontrada</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Voltar
        </Button>
      </div>
    );
  }

  const si = EXECUTION_STATUSES.find(s => s.value === run.status);
  const totalItems = items.length;
  const doneItems = items.filter(i => i.status !== 'pending').length;
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title={store?.name || 'Loja'}
        description={`Checklist: ${action.title}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/app/marketing/execucao/${retailActionId}`)}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Voltar
            </Button>
            {run.status !== 'completed' && (
              <Button size="sm" onClick={handleCompleteExecution}>
                <Check className="h-3.5 w-3.5 mr-1" /> Concluir
              </Button>
            )}
          </div>
        }
      />

      {/* Summary bar */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-4">
          {si && <Badge variant="outline" className={cn("text-xs", si.color)}>{si.label}</Badge>}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{doneItems}/{totalItems}</span>
          </div>
          <div className="text-sm font-bold">{run.compliance_score}% compliance</div>
          {issues.filter(i => !i.resolved).length > 0 && (
            <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive">
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> {issues.filter(i => !i.resolved).length} issues
            </Badge>
          )}
          <Button variant="outline" size="sm" className="h-7 text-[11px] ml-auto" onClick={() => setIssueDialogOpen(true)}>
            <AlertTriangle className="h-3 w-3 mr-1" /> Reportar Issue
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px]"
            onClick={() => navigate(buildComprovacaoUrl({
              actionName: action.title,
              storeName: store?.name || 'Loja',
              retailActionId: retailActionId!,
              storeId: storeId!,
            }))}
          >
            <MessageSquare className="h-3 w-3 mr-1" /> Comprovar
          </Button>
        </CardContent>
      </Card>

      {/* Run-level evidences */}
      {runEvidences.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <EvidenceSection evidences={runEvidences} isLoading={runEvidencesLoading} label="Evidências da Execução" />
          </CardContent>
        </Card>
      )}

      {/* Checklist by category */}
      {Object.entries(grouped).map(([category, categoryItems]) => {
        const catInfo = ITEM_CATEGORIES.find(c => c.value === category);
        const isOpen = openCategories[category] !== false; // default open
        const catDone = categoryItems.filter(i => i.status !== 'pending').length;

        return (
          <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
            <CollapsibleTrigger className="w-full">
              <Card>
                <CardContent className="p-2.5 flex items-center gap-2">
                  <ChevronRight className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                  <span className="text-xs font-semibold flex-1 text-left">{catInfo?.label || category}</span>
                  <span className="text-[10px] text-muted-foreground">{catDone}/{categoryItems.length}</span>
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-1 mt-1 ml-2">
                {categoryItems.map(item => (
                  <ChecklistItemCard
                    key={item.id}
                    item={item}
                    onStatusChange={handleStatusChange}
                    onAddEvidence={(id) => { setEvidenceItemId(id); setEvidenceUrl(""); }}
                    onComprovar={(itemId) => {
                      const catLabel = catInfo?.label || category;
                      navigate(buildComprovacaoUrl({
                        actionName: action.title,
                        storeName: store?.name || 'Loja',
                        retailActionId: retailActionId!,
                        storeId: storeId!,
                        itemId,
                        itemCategory: catLabel,
                        itemTitle: item.title,
                      }));
                    }}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {/* Issues list */}
      {issues.length > 0 && (
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs">Issues ({issues.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1">
            {issues.map(issue => {
              const sev = SEVERITY_OPTIONS.find(s => s.value === issue.severity);
              const it = ISSUE_TYPES.find(t => t.value === issue.issue_type);
              return (
                <div key={issue.id} className={cn("p-2 rounded-lg border border-border/50 flex items-start gap-2", issue.resolved && "opacity-50")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {sev && <Badge variant="outline" className={cn("text-[9px] px-1 py-0", sev.color)}>{sev.label}</Badge>}
                      {it && <span className="text-[10px] text-muted-foreground">{it.label}</span>}
                    </div>
                    <p className="text-xs">{issue.description}</p>
                  </div>
                  {!issue.resolved && (
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]"
                      onClick={() => { updateIssue.mutate({ id: issue.id, resolved: true }); recalculate.mutate(); }}>
                      Resolver
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Evidence URL dialog */}
      <Dialog open={!!evidenceItemId} onOpenChange={() => setEvidenceItemId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-sm">Adicionar Evidência</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">URL da foto/link</Label>
            <Input value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} placeholder="https://..." className="h-8 text-xs" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEvidenceItemId(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleAddEvidence} disabled={!evidenceUrl.trim()}>Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue creation dialog */}
      <CreateIssueDialog
        open={issueDialogOpen}
        onOpenChange={setIssueDialogOpen}
        runId={runId}
        tenantId={tenant?.id || ''}
        createIssue={createIssue}
        recalculate={recalculate}
      />
    </div>
  );
}

function CreateIssueDialog({ open, onOpenChange, runId, tenantId, createIssue, recalculate }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  runId: string | null;
  tenantId: string;
  createIssue: any;
  recalculate: any;
}) {
  const [severity, setSeverity] = useState("medium");
  const [issueType, setIssueType] = useState("outro");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!runId || !description.trim()) return;
    await createIssue.mutateAsync({
      tenant_id: tenantId,
      execution_run_id: runId,
      severity,
      issue_type: issueType,
      description: description.trim(),
      evidence_urls: [],
      resolved: false,
    });
    recalculate.mutate();
    setDescription("");
    setSeverity("medium");
    setIssueType("outro");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="text-sm">Reportar Issue</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Severidade</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ISSUE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="text-sm" placeholder="Descreva o problema..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSubmit} disabled={!description.trim() || createIssue.isPending}>
              {createIssue.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Registrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
