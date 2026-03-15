import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { getDeliverableLabel, getDeliverableIcon, getCategoryLabel, getCategoryIcon } from "@/config/demandRetailFields";
import { useTenantProfiles } from "@/hooks/useTenantProfiles";
import {
  Calendar,
  Clock,
  User,
  Tag,
  FileText,
  Megaphone,
  Wallet,
  Trash2,
  Check,
  AlertTriangle,
  Pencil,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { DemandContentViewer } from "./DemandRichEditor";
import { TransitionReasonDialog } from "./TransitionReasonDialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MarketingDemand,
  DemandStatus,
  demandStatusConfig,
  demandPriorityConfig,
  demandTypeConfig,
  useUpdateDemand,
  useDeleteDemand,
} from "@/hooks/useMarketingDemands";
import { ResponseReviewSection } from "./ResponseReviewSection";
import { WorkflowStepsPanel } from "./WorkflowStepsPanel";
import { DemandApprovalsPanel } from "./DemandApprovalsPanel";
import { CompletionChecklist } from "./CompletionChecklist";
import { DemandDocumentsSection } from "./DemandDocumentsSection";
import { transitionDemandStatus } from "@/services/demands/transitionDemandStatus";
import { useCompleteDemand, useCompletionCriteria } from "@/hooks/useCompletionCriteria";
import { isFeatureEnabled } from "@/config/features";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DemandComments } from "./DemandComments";

interface DemandaDetailSheetProps {
  demand: MarketingDemand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DemandaDetailSheet({ demand, open, onOpenChange }: DemandaDetailSheetProps) {
  const navigate = useNavigate();
  const updateDemand = useUpdateDemand();
  const deleteDemand = useDeleteDemand();
  const { user, tenant } = useAuth();
  const { resolveName } = useTenantProfiles();
  const useGovernance = isFeatureEnabled("DEMANDS_GOVERNANCE_V1");
  const useCompletionCriteriaFlag = isFeatureEnabled("DEMANDS_COMPLETION_CRITERIA_V1");
  const completeDemand = useCompleteDemand();
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    fromStatus: DemandStatus;
    toStatus: DemandStatus;
  } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (!demand) return null;

  const priorityConfig = demandPriorityConfig[demand.priority];
  const typeConfig = demandTypeConfig[demand.type];
  const statusConfig = demandStatusConfig[demand.status];

  const isOverdue = demand.due_date && 
    new Date(demand.due_date) < new Date() && 
    !['completed', 'cancelled', 'approved'].includes(demand.status);

  const progress = demand.estimated_hours && demand.actual_hours
    ? Math.min(100, (demand.actual_hours / demand.estimated_hours) * 100)
    : 0;

  const handleStatusChange = async (status: DemandStatus) => {
    if (!useGovernance) {
      // Old behavior: direct update without validation
      updateDemand.mutate({ id: demand.id, status });
      return;
    }

    if (!user?.id || !tenant?.id) {
      toast.error("Sessão inválida");
      return;
    }

    // Open reason dialog if needed
    setReasonDialog({
      open: true,
      fromStatus: demand.status as DemandStatus,
      toStatus: status,
    });
  };

  const handleTransitionConfirm = async (reason: string) => {
    if (!reasonDialog || !user?.id || !tenant?.id) return;

    setIsTransitioning(true);
    try {
      const result = await transitionDemandStatus({
        demandId: demand.id,
        toStatus: reasonDialog.toStatus,
        source: "detailsheet",
        reason,
        userId: user.id,
        tenantId: tenant.id,
      });

      if (result.success) {
        toast.success("Status atualizado com sucesso");
        // Refetch demands
        updateDemand.mutate({
          id: demand.id,
          status: reasonDialog.toStatus,
        });
      } else if (result.validation?.requiresReason) {
        toast.error(result.validation.reasonPrompt || result.error);
      } else {
        toast.error(result.error || "Erro ao atualizar status");
      }
    } finally {
      setIsTransitioning(false);
      setReasonDialog(null);
    }
  };

  const handleDelete = async () => {
    await deleteDemand.mutateAsync(demand.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-lg pr-8 leading-tight">
                {demand.title}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <span>{typeConfig.icon}</span>
                {typeConfig.label}
              </SheetDescription>
            </div>
          </div>

          {/* Status & Priority badges */}
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className={cn("text-xs", statusConfig.bgColor, statusConfig.color)}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className={cn("text-xs", priorityConfig.bgColor, priorityConfig.color)}>
              {priorityConfig.label}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Atrasado
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Description */}
          {demand.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Descrição</h4>
              {(() => {
                try {
                  const parsed = JSON.parse(demand.description);
                  if (Array.isArray(parsed)) {
                    return <DemandContentViewer content={parsed} />;
                  }
                } catch { /* not JSON */ }
                return <p className="text-sm">{demand.description}</p>;
              })()}
            </div>
          )}


          {/* Notion-style properties table */}
          <div className="space-y-1 rounded-lg border border-border/50 overflow-hidden">
            {/* Status */}
            <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
              <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
                Status
              </span>
              <div className="flex-1">
                <Select value={demand.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-7 text-xs border-none shadow-none bg-transparent px-1 -ml-1">
                    <Badge variant="outline" className={cn("text-[10px]", statusConfig.bgColor, statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(demandStatusConfig) as [DemandStatus, { label: string }][]).map(
                      ([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
              <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                Prioridade
              </span>
              <Badge variant="outline" className={cn("text-[10px]", priorityConfig.bgColor, priorityConfig.color)}>
                {priorityConfig.label}
              </Badge>
            </div>

            {/* Type */}
            <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
              <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                <FileText className="h-3 w-3" />
                Tipo
              </span>
              <span className="text-xs">{typeConfig.icon} {typeConfig.label}</span>
            </div>

            {/* Responsible */}
            <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
              <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                <User className="h-3 w-3" />
                Responsável
              </span>
              <span className="text-xs">
                {demand.assigned_to ? resolveName(demand.assigned_to) : <span className="text-muted-foreground italic">Não atribuído</span>}
              </span>
            </div>

            {/* Created by */}
            {demand.created_by && (
              <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Criado por
                </span>
                <span className="text-xs">{resolveName(demand.created_by)}</span>
              </div>
            )}

            {/* Due date */}
            <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
              <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Prazo
              </span>
              <span className={cn("text-xs", isOverdue && "text-destructive font-medium")}>
                {demand.due_date
                  ? format(new Date(demand.due_date), "dd 'de' MMM, yyyy", { locale: ptBR })
                  : <span className="text-muted-foreground italic">Sem prazo</span>}
                {isOverdue && " ⚠️"}
              </span>
            </div>

            {/* Created at */}
            <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
              <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Criado em
              </span>
              <span className="text-xs">
                {format(new Date(demand.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>

            {/* Started at */}
            {demand.started_at && (
              <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Iniciado em
                </span>
                <span className="text-xs">
                  {format(new Date(demand.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}

            {/* Completed at */}
            {demand.completed_at && (
              <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  Concluído em
                </span>
                <span className="text-xs">
                  {format(new Date(demand.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            )}

            {/* Hours */}
            {demand.estimated_hours && (
              <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Horas
                </span>
                <span className="text-xs">
                  {demand.actual_hours || 0}h / {demand.estimated_hours}h ({Math.round(progress)}%)
                </span>
              </div>
            )}

            {/* Campaign */}
            {demand.campaign_id && (
              <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                  <Megaphone className="h-3 w-3" />
                  Campanha
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/app/marketing/campanhas/${demand.campaign_id}`);
                  }}
                >
                  Ver campanha →
                </Button>
              </div>
            )}

            {/* Deliverable / Channels / Scope */}
            {demand.deliverable_kind && (
              <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  Entregável
                </span>
                <span className="text-xs">{getDeliverableIcon(demand.deliverable_kind)} {getDeliverableLabel(demand.deliverable_kind)}</span>
              </div>
            )}

            {demand.destination_scope && (
              <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-xs text-muted-foreground w-28 shrink-0">Escopo</span>
                <span className="text-xs">
                  {(demand.destination_scope as any)?.scope === "rede" ? "🏢 Toda a Rede" : "📍 Lojas Específicas"}
                </span>
              </div>
            )}

            {demand.channels && (demand.channels as string[]).length > 0 && (
              <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-xs text-muted-foreground w-28 shrink-0">Canais</span>
                <div className="flex flex-wrap gap-1">
                  {(demand.channels as string[]).map((ch: string) => (
                    <Badge key={ch} variant="secondary" className="text-[10px] gap-1">
                      {getCategoryIcon(ch)} {getCategoryLabel(ch)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {demand.tags && demand.tags.length > 0 && (
              <div className="flex items-center px-3 py-2 hover:bg-muted/30 transition-colors">
                <span className="text-xs text-muted-foreground w-28 shrink-0 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  Tags
                </span>
                <div className="flex flex-wrap gap-1">
                  {demand.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {demand.estimated_hours && (
            <div className="space-y-2">
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <Separator />

          {/* Documents Section */}
          <DemandDocumentsSection demandId={demand.id} demandTitle={demand.title} />

          <Separator />

          {/* Quick actions */}
          <div className="flex gap-2">
            {!demand.campaign_id && (
              <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
                <Megaphone className="h-3 w-3 mr-1" />
                Vincular Campanha
              </Button>
            )}
            {!demand.budget_id && (
              <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
                <Wallet className="h-3 w-3 mr-1" />
                Vincular Orçamento
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                onOpenChange(false);
                navigate("/app/marketing/execucoes");
              }}
            >
              <FileCheck className="h-3 w-3 mr-1" />
              Execução
            </Button>
          </div>

          {/* Completion Criteria (when flag on) */}
          {useCompletionCriteriaFlag && !['completed', 'cancelled'].includes(demand.status) && (
            <>
              <Separator />
              <CompletionChecklist demandId={demand.id} demandType={demand.type} />
            </>
          )}

          {/* Workflow & Approvals */}
          <Separator />
          <WorkflowStepsPanel
            demandId={demand.id}
            demandType={demand.type}
            dueDate={demand.due_date}
          />
          <DemandApprovalsPanel demandId={demand.id} />

          {/* Response Review Section - Only show if demand has an assignee */}
          {demand.assigned_to && (
            <>
              <Separator />
              <ResponseReviewSection demandId={demand.id} />
            </>
          )}

          <Separator />

          {/* Comments */}
          <DemandComments demandId={demand.id} />

          <Separator />


          {/* Actions */}
          <div className="pt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                navigate(`/app/marketing/demandas/editar/${demand.id}`);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir demanda?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A demanda será permanentemente excluída.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {!['approved', 'cancelled', 'completed'].includes(demand.status) && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-green-600 border-green-600/30 hover:bg-green-600/10"
                onClick={() => handleStatusChange('approved')}
              >
                <Check className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
            )}

            {!['cancelled', 'completed'].includes(demand.status) && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => handleStatusChange('cancelled')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
            )}

            {demand.status !== 'completed' && demand.status !== 'cancelled' && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (useCompletionCriteriaFlag) {
                    completeDemand.mutate({ demandId: demand.id });
                  } else {
                    handleStatusChange('completed');
                  }
                }}
                disabled={completeDemand.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Concluir
              </Button>
            )}
          </div>
        </div>
      </SheetContent>

      {reasonDialog && (
        <TransitionReasonDialog
          open={reasonDialog.open}
          from={reasonDialog.fromStatus}
          to={reasonDialog.toStatus}
          onConfirm={handleTransitionConfirm}
          onCancel={() => setReasonDialog(null)}
          isLoading={isTransitioning}
        />
      )}
    </Sheet>
  );
}
