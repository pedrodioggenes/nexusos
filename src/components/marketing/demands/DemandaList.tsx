import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Calendar, Clock, MoreHorizontal, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MarketingDemand,
  DemandStatus,
  demandStatusConfig,
  demandPriorityConfig,
  demandTypeConfig,
  useUpdateDemand,
} from "@/hooks/useMarketingDemands";
import { TransitionReasonDialog } from "./TransitionReasonDialog";
import { transitionDemandStatus } from "@/services/demands/transitionDemandStatus";
import { isFeatureEnabled } from "@/config/features";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantProfiles } from "@/hooks/useTenantProfiles";

interface DemandaListProps {
  demands: MarketingDemand[];
  onDemandClick: (demand: MarketingDemand) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function DemandaList({
  demands,
  onDemandClick,
  selectedIds = [],
  onSelectionChange,
}: DemandaListProps) {
  const updateDemand = useUpdateDemand();
  const { user, tenant } = useAuth();
  const { resolveName, resolveInitials } = useTenantProfiles();
  const useGovernance = isFeatureEnabled("DEMANDS_GOVERNANCE_V1");

  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    demandId: string;
    fromStatus: DemandStatus;
    toStatus: DemandStatus;
  } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? demands.map(d => d.id) : []);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(
        checked
          ? [...selectedIds, id]
          : selectedIds.filter(i => i !== id)
      );
    }
  };

  const handleStatusChange = async (id: string, status: DemandStatus) => {
    const demand = demands.find((d) => d.id === id);
    if (!demand) return;

    if (!useGovernance) {
      updateDemand.mutate({ id, status });
      return;
    }

    if (!user?.id || !tenant?.id) {
      toast.error("Sessão inválida");
      return;
    }

    setReasonDialog({
      open: true,
      demandId: id,
      fromStatus: demand.status as DemandStatus,
      toStatus: status,
    });
  };

  const handleTransitionConfirm = async (reason: string) => {
    if (!reasonDialog || !user?.id || !tenant?.id) return;

    setIsTransitioning(true);
    try {
      const result = await transitionDemandStatus({
        demandId: reasonDialog.demandId,
        toStatus: reasonDialog.toStatus,
        source: "quickaction",
        reason,
        userId: user.id,
        tenantId: tenant.id,
      });

      if (result.success) {
        toast.success("Status atualizado com sucesso");
        updateDemand.mutate({
          id: reasonDialog.demandId,
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

  const isOverdue = (demand: MarketingDemand) => {
    if (!demand.due_date || ['completed', 'cancelled', 'approved'].includes(demand.status)) return false;
    return new Date(demand.due_date) < new Date();
  };

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {onSelectionChange && (
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.length === demands.length && demands.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="w-[35%]">Demanda</TableHead>
            <TableHead className="w-[80px]">Tipo</TableHead>
            <TableHead className="w-[80px]">Prioridade</TableHead>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead className="w-[90px]">Prazo</TableHead>
            <TableHead className="w-[120px]">Responsável</TableHead>
            <TableHead className="w-[100px]">Atualização</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {demands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                Nenhuma demanda encontrada
              </TableCell>
            </TableRow>
          ) : (
            demands.map((demand) => {
              const priorityConfig = demandPriorityConfig[demand.priority];
              const typeConfig = demandTypeConfig[demand.type];
              const statusConfig = demandStatusConfig[demand.status];
              const overdue = isOverdue(demand);
              const assigneeName = resolveName(demand.assigned_to);
              const assigneeInitials = resolveInitials(demand.assigned_to);

              return (
                <TableRow
                  key={demand.id}
                  className={cn(
                    "cursor-pointer group",
                    overdue && "bg-destructive/5"
                  )}
                  onClick={() => onDemandClick(demand)}
                >
                  {onSelectionChange && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(demand.id)}
                        onCheckedChange={(checked) => handleSelectOne(demand.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className={cn(
                        "font-medium text-sm group-hover:text-module-gestao transition-colors line-clamp-1",
                        overdue && "text-destructive"
                      )}>
                        {overdue && <Clock className="h-3 w-3 inline mr-1 text-destructive" />}
                        {demand.title}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-sm">{typeConfig.icon}</span>
                        </TooltipTrigger>
                        <TooltipContent><p>{typeConfig.label}</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", priorityConfig.bgColor, priorityConfig.color)}>
                      {priorityConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", statusConfig.bgColor, statusConfig.color)}>
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {demand.due_date ? (
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        overdue && "text-destructive font-medium"
                      )}>
                        <Calendar className="h-3 w-3" />
                        {format(new Date(demand.due_date), "dd/MM/yy", { locale: ptBR })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[8px] bg-module-gestao/15 text-module-gestao">
                          {assigneeInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                        {assigneeName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(demand.updated_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDemandClick(demand)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </DropdownMenuItem>
                        {!['completed', 'cancelled'].includes(demand.status) && (
                          <DropdownMenuItem onClick={() => handleStatusChange(demand.id, 'completed')}>
                            Marcar como concluído
                          </DropdownMenuItem>
                        )}
                        {demand.status === 'open' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(demand.id, 'in_progress')}>
                            Iniciar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

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
    </div>
  );
}
