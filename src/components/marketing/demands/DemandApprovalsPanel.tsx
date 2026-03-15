import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Plus,
  Clock,
  Lock,
} from "lucide-react";
import {
  useDemandApprovals,
  useCreateDemandApproval,
  useDecideDemandApproval,
  type DemandApproval,
} from "@/hooks/useDemandWorkflow";
import { useUserDepartmentRole, isGestor } from "@/hooks/useUserDepartmentRole";
import { useAuth } from "@/contexts/AuthContext";
import { isFeatureEnabled } from "@/config/features";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DemandApprovalsPanelProps {
  demandId: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pendente", color: "text-amber-500", bgColor: "bg-amber-500/10" },
  approved: { label: "Aprovado", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  changes_requested: { label: "Ajustes", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  rejected: { label: "Rejeitado", color: "text-destructive", bgColor: "bg-destructive/10" },
};

/**
 * Check if the current user can decide on approvals.
 * Admin or gestor can decide; operador/leitura/colaborador cannot.
 */
function useCanDecideApprovals(): boolean {
  const { data: departmentRole } = useUserDepartmentRole();

  // When RBAC flag is off, everyone can decide (old behavior)
  if (!isFeatureEnabled("DEMANDS_APPROVALS_RBAC_V1")) {
    return true;
  }

  // Admin role is checked via department_role=gestor or app_role=admin
  // The RPC enforces this server-side, but we also hide UI
  return isGestor(departmentRole);
}

export function DemandApprovalsPanel({ demandId }: DemandApprovalsPanelProps) {
  const [open, setOpen] = useState(true);
  const { data: approvals = [], isLoading } = useDemandApprovals(demandId);
  const createApproval = useCreateDemandApproval();
  const canDecide = useCanDecideApprovals();
  const useRbac = isFeatureEnabled("DEMANDS_APPROVALS_RBAC_V1");

  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  if (isLoading) {
    return <div className="p-3 rounded-lg bg-muted/30 border border-border animate-pulse h-12" />;
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Aprovações</span>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 bg-amber-500/10 text-amber-500">
                {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-2">
        {approvals.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Nenhuma aprovação solicitada
          </div>
        ) : (
          approvals.map((approval) => (
            <ApprovalItem
              key={approval.id}
              approval={approval}
              demandId={demandId}
              canDecide={canDecide}
              useRpc={useRbac}
            />
          ))
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-8"
          onClick={() => createApproval.mutate({ demandId })}
          disabled={createApproval.isPending}
        >
          {createApproval.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Plus className="h-3 w-3 mr-1" />
          )}
          Solicitar Aprovação
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ApprovalItem({
  approval,
  demandId,
  canDecide,
  useRpc,
}: {
  approval: DemandApproval;
  demandId: string;
  canDecide: boolean;
  useRpc: boolean;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState("");
  const decide = useDecideDemandApproval();
  const config = statusConfig[approval.status] || statusConfig.pending;
  const isPending = approval.status === "pending";

  const handleDecide = (status: "approved" | "changes_requested" | "rejected") => {
    decide.mutate({
      id: approval.id,
      demandId,
      status,
      note: feedbackNote || undefined,
      useRpc,
    });
    setFeedbackNote("");
    setShowFeedback(false);
  };

  return (
    <div className="p-3 rounded-lg border border-border bg-card/50">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className={cn("text-[10px]", config.color, config.bgColor)}>
          {config.label}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(approval.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </span>
      </div>

      {approval.note && (
        <p className="text-xs text-muted-foreground mb-2 p-2 rounded bg-muted/30">
          {approval.note}
        </p>
      )}

      {isPending && canDecide && (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleDecide("approved")}
              disabled={decide.isPending}
            >
              {decide.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aprovar
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs border-orange-500/30 text-orange-500"
              onClick={() => setShowFeedback(!showFeedback)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Ajustes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-destructive/30 text-destructive"
              onClick={() => handleDecide("rejected")}
              disabled={decide.isPending}
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </div>

          {showFeedback && (
            <div className="space-y-1.5">
              <Textarea
                placeholder="Descreva os ajustes necessários..."
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                rows={2}
                className="text-xs"
              />
              <Button
                size="sm"
                variant="secondary"
                className="w-full h-7 text-xs"
                onClick={() => handleDecide("changes_requested")}
                disabled={!feedbackNote.trim() || decide.isPending}
              >
                Enviar Feedback
              </Button>
            </div>
          )}
        </div>
      )}

      {isPending && !canDecide && (
        <div className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Aguardando aprovador (gestor ou admin)</span>
        </div>
      )}

      {approval.decided_at && (
        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
          <Clock className="h-2.5 w-2.5" />
          Decidido{" "}
          {formatDistanceToNow(new Date(approval.decided_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </div>
      )}
    </div>
  );
}
