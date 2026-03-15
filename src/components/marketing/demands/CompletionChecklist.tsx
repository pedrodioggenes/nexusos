import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCompletionCriteria } from "@/hooks/useCompletionCriteria";
import type { DemandType } from "@/domain/demands/types";

interface CompletionChecklistProps {
  demandId: string;
  demandType: DemandType;
}

export function CompletionChecklist({ demandId, demandType }: CompletionChecklistProps) {
  const { data: validation, isLoading } = useCompletionCriteria({ demandId, demandType });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Requisitos para Concluir</h4>
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!validation) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">Requisitos para Concluir</h4>
        {validation.ok ? (
          <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
            ✓ Pronto
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600">
            {validation.missing.length} pendente{validation.missing.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {validation.all.map((criterion) => (
          <div
            key={criterion.key}
            className={cn(
              "flex items-start gap-2 p-2 rounded-md text-sm",
              criterion.met ? "bg-green-500/5" : "bg-orange-500/5"
            )}
          >
            {criterion.met ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium", criterion.met && "text-muted-foreground line-through")}>
                {criterion.label}
              </p>
              {!criterion.met && (
                <p className="text-xs text-muted-foreground mt-0.5">{criterion.hint}</p>
              )}
            </div>
            {!criterion.met && criterion.actionLabel && (
              <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0">
                <ExternalLink className="h-3 w-3 mr-1" />
                {criterion.actionLabel}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
