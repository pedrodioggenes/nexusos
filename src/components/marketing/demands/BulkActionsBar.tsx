import { useState } from "react";
import { 
  Users, 
  ArrowUpDown, 
  Play, 
  CheckCircle2, 
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  DemandStatus,
  DemandPriority,
  demandStatusConfig,
  demandPriorityConfig,
  useUpdateDemand,
} from "@/hooks/useMarketingDemands";
import { transitionDemandStatus } from "@/services/demands/transitionDemandStatus";
import { isFeatureEnabled } from "@/config/features";
import { useAuth } from "@/contexts/AuthContext";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClear: () => void;
  /** Map of id -> current status (for governance) */
  demandStatuses?: Record<string, DemandStatus>;
}

export function BulkActionsBar({ selectedIds, onClear, demandStatuses = {} }: BulkActionsBarProps) {
  const updateDemand = useUpdateDemand();
  const { user, tenant } = useAuth();
  const useGovernance = isFeatureEnabled("DEMANDS_GOVERNANCE_V1");

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    action: string;
    value: string;
  } | null>(null);

  const count = selectedIds.length;
  if (count === 0) return null;

  const handleBulkPriority = async (priority: DemandPriority) => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedIds.map((id) => updateDemand.mutateAsync({ id, priority }))
      );
      toast.success(`Prioridade atualizada para ${count} demanda(s)`);
      onClear();
    } catch {
      toast.error("Erro ao atualizar prioridade");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkStatus = async (status: DemandStatus) => {
    setIsProcessing(true);
    try {
      if (useGovernance && user?.id && tenant?.id) {
        const results = await Promise.allSettled(
          selectedIds.map((id) =>
            transitionDemandStatus({
              demandId: id,
              toStatus: status,
              source: "quickaction",
              userId: user.id,
              tenantId: tenant.id,
            })
          )
        );
        const succeeded = results.filter(
          (r) => r.status === "fulfilled" && r.value.success
        ).length;
        const failed = count - succeeded;
        if (failed > 0) {
          toast.warning(
            `${succeeded} atualizada(s), ${failed} bloqueada(s) pela governança`
          );
        } else {
          toast.success(`Status atualizado para ${count} demanda(s)`);
        }
      } else {
        await Promise.all(
          selectedIds.map((id) => updateDemand.mutateAsync({ id, status }))
        );
        toast.success(`Status atualizado para ${count} demanda(s)`);
      }
      onClear();
    } catch {
      toast.error("Erro ao atualizar status");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Badge variant="secondary" className="font-semibold">
          {count} selecionada{count > 1 ? "s" : ""}
        </Badge>

        <div className="flex items-center gap-1.5 ml-2">
          <Select
            onValueChange={(v) =>
              setConfirmDialog({ action: "priority", value: v })
            }
            disabled={isProcessing}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <ArrowUpDown className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(demandPriorityConfig) as [
                  DemandPriority,
                  { label: string }
                ][]
              ).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(v) =>
              setConfirmDialog({ action: "status", value: v })
            }
            disabled={isProcessing}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <Play className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Mover status" />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(demandStatusConfig) as [
                  DemandStatus,
                  { label: string }
                ][]
              ).filter(([v]) => v !== "cancelled").map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isProcessing && <Loader2 className="h-4 w-4 animate-spin ml-2" />}

        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-7"
          onClick={onClear}
          disabled={isProcessing}
        >
          <X className="h-3 w-3 mr-1" />
          Limpar
        </Button>
      </div>

      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar ação em lote</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.action === "priority"
                ? `Alterar prioridade de ${count} demanda(s) para "${
                    demandPriorityConfig[
                      confirmDialog.value as DemandPriority
                    ]?.label
                  }"?`
                : `Mover ${count} demanda(s) para status "${
                    demandStatusConfig[confirmDialog?.value as DemandStatus]
                      ?.label
                  }"?${
                    useGovernance
                      ? " Transições bloqueadas pela governança serão ignoradas."
                      : ""
                  }`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirmDialog) return;
                if (confirmDialog.action === "priority") {
                  handleBulkPriority(
                    confirmDialog.value as DemandPriority
                  );
                } else {
                  handleBulkStatus(confirmDialog.value as DemandStatus);
                }
                setConfirmDialog(null);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
