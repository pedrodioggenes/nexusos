import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Play,
  Ban,
  Workflow,
} from "lucide-react";
import {
  WorkflowStep,
  useWorkflowSteps,
  useInitWorkflowSteps,
  useUpdateWorkflowStep,
  isStepOverdue,
} from "@/hooks/useDemandWorkflow";

interface WorkflowStepsPanelProps {
  demandId: string;
  demandType?: string;
  dueDate?: string | null;
}

const stepStatusConfig: Record<
  string,
  { icon: typeof Circle; color: string; label: string }
> = {
  pending: { icon: Circle, color: "text-muted-foreground", label: "Pendente" },
  in_progress: { icon: Clock, color: "text-blue-500", label: "Em andamento" },
  blocked: { icon: Ban, color: "text-destructive", label: "Bloqueado" },
  done: { icon: CheckCircle, color: "text-emerald-500", label: "Concluído" },
  skipped: { icon: Ban, color: "text-muted-foreground/50", label: "Pulado" },
};

export function WorkflowStepsPanel({
  demandId,
  demandType,
  dueDate,
}: WorkflowStepsPanelProps) {
  const [open, setOpen] = useState(true);
  const { data: steps = [], isLoading } = useWorkflowSteps(demandId);
  const initSteps = useInitWorkflowSteps();
  const updateStep = useUpdateWorkflowStep();

  const completedCount = steps.filter((s) => s.status === "done").length;
  const overdueCount = steps.filter(isStepOverdue).length;

  if (isLoading) {
    return (
      <div className="p-3 rounded-lg bg-muted/30 border border-border animate-pulse h-16" />
    );
  }

  // No steps yet — offer to create pipeline
  if (steps.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Workflow className="h-4 w-4" />
            <span>Pipeline de Produção</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() =>
              initSteps.mutate({
                demandId,
                demandType,
                dueDate: dueDate || undefined,
              })
            }
            disabled={initSteps.isPending}
          >
            {initSteps.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Play className="h-3 w-3 mr-1" />
            )}
            Criar Pipeline
          </Button>
        </div>
      </div>
    );
  }

  const handleAdvance = (step: WorkflowStep) => {
    const nextStatus: Record<string, WorkflowStep["status"]> = {
      pending: "in_progress",
      in_progress: "done",
      blocked: "in_progress",
    };
    const next = nextStatus[step.status];
    if (!next) return;
    updateStep.mutate({ id: step.id, status: next, demandId });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pipeline de Produção</span>
            <Badge variant="secondary" className="text-[10px] h-5">
              {completedCount}/{steps.length}
            </Badge>
            {overdueCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5">
                {overdueCount} atrasada{overdueCount > 1 ? "s" : ""}
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

      <CollapsibleContent className="mt-2">
        <div className="relative pl-4 space-y-0">
          {steps.map((step, idx) => {
            const config = stepStatusConfig[step.status] || stepStatusConfig.pending;
            const Icon = config.icon;
            const overdue = isStepOverdue(step);
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.id} className="relative flex items-start gap-3 pb-4">
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-[7px] top-5 bottom-0 w-px",
                      step.status === "done" ? "bg-emerald-500/30" : "bg-border"
                    )}
                  />
                )}

                {/* Icon */}
                <div className="relative z-10 mt-0.5">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      overdue ? "text-destructive" : config.color
                    )}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm",
                        step.status === "done" && "line-through text-muted-foreground"
                      )}
                    >
                      {step.step_label}
                    </span>

                    {step.status !== "done" && step.status !== "skipped" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => handleAdvance(step)}
                        disabled={updateStep.isPending}
                      >
                        {step.status === "pending"
                          ? "Iniciar"
                          : step.status === "in_progress"
                          ? "Concluir"
                          : "Desbloquear"}
                      </Button>
                    )}
                  </div>

                  {/* Meta line */}
                  <div className="flex items-center gap-2 mt-0.5">
                    {step.owner_role && (
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {step.owner_role}
                      </span>
                    )}
                    {overdue && (
                      <span className="text-[10px] text-destructive flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Atrasado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
