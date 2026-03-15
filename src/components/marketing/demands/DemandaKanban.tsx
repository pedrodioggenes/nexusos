import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { DemandaCard } from "./DemandaCard";
import { TransitionReasonDialog } from "./TransitionReasonDialog";
import {
  MarketingDemand,
  DemandStatus,
  demandStatusConfig,
  useUpdateDemand,
} from "@/hooks/useMarketingDemands";
import { transitionDemandStatus } from "@/services/demands/transitionDemandStatus";
import { isFeatureEnabled } from "@/config/features";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTenantProfiles } from "@/hooks/useTenantProfiles";

interface DemandaKanbanProps {
  demands: MarketingDemand[];
  onDemandClick: (demand: MarketingDemand) => void;
  onCreateClick: (status?: DemandStatus) => void;
}

const KANBAN_COLUMNS: DemandStatus[] = [
  'open',
  'in_progress',
  'review',
  'approved',
];

export function DemandaKanban({ demands, onDemandClick, onCreateClick }: DemandaKanbanProps) {
  const updateDemand = useUpdateDemand();
  const { user, tenant } = useAuth();
  const { resolveName } = useTenantProfiles();
  const useGovernance = isFeatureEnabled("DEMANDS_GOVERNANCE_V1");

  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    demandId: string;
    fromStatus: DemandStatus;
    toStatus: DemandStatus;
  } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const demandsByStatus = useMemo(() => {
    const grouped: Record<DemandStatus, MarketingDemand[]> = {
      open: [],
      in_progress: [],
      review: [],
      approved: [],
      completed: [],
      cancelled: [],
    };

    demands.forEach(demand => {
      if (grouped[demand.status]) {
        grouped[demand.status].push(demand);
      }
    });

    // Merge completed into approved for display
    grouped.approved = [...grouped.approved, ...grouped.completed];

    return grouped;
  }, [demands]);

  // Count overdue per column
  const overdueByStatus = useMemo(() => {
    const counts: Record<DemandStatus, number> = {
      open: 0, in_progress: 0, review: 0, approved: 0, completed: 0, cancelled: 0,
    };
    const now = new Date();
    demands.forEach(d => {
      if (d.due_date && new Date(d.due_date) < now && !['completed', 'cancelled', 'approved'].includes(d.status)) {
        counts[d.status]++;
      }
    });
    return counts;
  }, [demands]);

  const handleDragEnd = async (demandId: string, newStatus: DemandStatus) => {
    if (!useGovernance) {
      updateDemand.mutate({ id: demandId, status: newStatus });
      return;
    }

    if (!user?.id || !tenant?.id) {
      toast.error("Sessão inválida");
      return;
    }

    const demand = demands.find((d) => d.id === demandId);
    if (!demand) return;

    setReasonDialog({
      open: true,
      demandId,
      fromStatus: demand.status as DemandStatus,
      toStatus: newStatus,
    });
  };

  const handleTransitionConfirm = async (reason: string) => {
    if (!reasonDialog || !user?.id || !tenant?.id) return;

    setIsTransitioning(true);
    try {
      const result = await transitionDemandStatus({
        demandId: reasonDialog.demandId,
        toStatus: reasonDialog.toStatus,
        source: "kanban",
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

  return (
    <>
      <div className="w-full overflow-hidden">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4 px-1">
          {KANBAN_COLUMNS.map((status) => {
            const config = demandStatusConfig[status];
            const columnDemands = demandsByStatus[status];
            const overdueCount = overdueByStatus[status];

            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 min-w-[250px]"
              >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", config.bgColor.replace('/10', ''))} />
                  <h3 className="text-sm font-medium text-foreground">
                    {config.label}
                  </h3>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {columnDemands.length}
                  </span>
                  {overdueCount > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                      <Clock className="h-2.5 w-2.5" />
                      {overdueCount}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onCreateClick(status)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Column Content */}
              <div
                className={cn(
                  "min-h-[500px] max-h-[calc(100vh-280px)] overflow-y-auto rounded-lg border border-dashed p-2 space-y-2",
                  "bg-muted/30 border-border/50",
                  "transition-colors duration-200"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const demandId = e.dataTransfer.getData("demandId");
                  if (demandId) {
                    handleDragEnd(demandId, status);
                  }
                }}
              >
                {columnDemands.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                    Arraste demandas aqui
                  </div>
                ) : (
                  columnDemands.map((demand, index) => {
                    const isOverdue = demand.due_date &&
                      new Date(demand.due_date) < new Date() &&
                      !['completed', 'cancelled', 'approved'].includes(demand.status);

                    return (
                      <motion.div
                        key={demand.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        draggable
                        onDragStart={(e) => {
                          (e as unknown as DragEvent).dataTransfer?.setData("demandId", demand.id);
                        }}
                        className={cn(
                          "cursor-grab active:cursor-grabbing",
                          isOverdue && "ring-1 ring-destructive/40 rounded-lg"
                        )}
                      >
                        <DemandaCard
                          demand={demand}
                          onClick={() => onDemandClick(demand)}
                          assigneeName={resolveName(demand.assigned_to)}
                          compact
                        />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          );
        })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      </div>

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
    </>
  );
}
