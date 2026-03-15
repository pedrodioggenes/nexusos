import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TeamTask, TaskType } from "@/hooks/useTeamTasks";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
} from "lucide-react";

interface TeamProductivityCardProps {
  tasks: TeamTask[];
  taskType?: TaskType;
  isLoading?: boolean;
}

export function TeamProductivityCard({ tasks, taskType, isLoading }: TeamProductivityCardProps) {
  const metrics = useMemo(() => {
    if (!tasks.length) {
      return {
        completed: 0,
        inProgress: 0,
        pending: 0,
        avgCompletionTime: 0,
        approvalRate: 0,
        overdueCount: 0,
        byAssignee: [] as { name: string; completed: number; total: number }[],
      };
    }

    const now = new Date();
    const completed = tasks.filter((t) => t.status === "done");
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const pending = tasks.filter((t) => t.status === "review" && t.approval_status === "pending");
    const overdue = tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < now && t.status !== "done"
    );

    // Calculate average completion time (estimated vs actual)
    const tasksWithTime = completed.filter((t) => t.estimated_hours && t.actual_hours);
    const avgCompletionTime = tasksWithTime.length
      ? tasksWithTime.reduce((acc, t) => acc + (t.actual_hours! / t.estimated_hours!) * 100, 0) / tasksWithTime.length
      : 0;

    // Approval rate on first try (tasks approved without revision)
    const reviewedTasks = tasks.filter((t) => t.approval_status === "approved" || t.revision_notes);
    const firstTryApproved = reviewedTasks.filter((t) => t.approval_status === "approved" && !t.revision_notes);
    const approvalRate = reviewedTasks.length ? (firstTryApproved.length / reviewedTasks.length) * 100 : 100;

    // Group by assignee
    const assigneeMap = new Map<string, { completed: number; total: number }>();
    tasks.forEach((task) => {
      const name = task.assignee_name || "Não atribuído";
      const current = assigneeMap.get(name) || { completed: 0, total: 0 };
      current.total++;
      if (task.status === "done") current.completed++;
      assigneeMap.set(name, current);
    });

    const byAssignee = Array.from(assigneeMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 4);

    return {
      completed: completed.length,
      inProgress: inProgress.length,
      pending: pending.length,
      avgCompletionTime,
      approvalRate,
      overdueCount: overdue.length,
      byAssignee,
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <Card className="card-base">
        <CardHeader className="p-4 pb-2">
          <div className="h-5 w-40 bg-muted/50 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const completionRate = tasks.length ? (metrics.completed / tasks.length) * 100 : 0;

  return (
    <Card className="card-base">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-success" />
          Produtividade da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        {/* Main Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Concluídas</span>
            </div>
            <p className="text-xl font-bold text-success">{metrics.completed}</p>
          </div>

          <div className="p-3 rounded-lg bg-app-gestao/10 border border-app-gestao/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-app-gestao" />
              <span className="text-xs text-muted-foreground">Em Produção</span>
            </div>
            <p className="text-xl font-bold text-app-gestao">{metrics.inProgress}</p>
          </div>

          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Aguardando</span>
            </div>
            <p className="text-xl font-bold text-warning">{metrics.pending}</p>
          </div>

          <div className={cn(
            "p-3 rounded-lg border",
            metrics.overdueCount > 0 
              ? "bg-destructive/10 border-destructive/20" 
              : "bg-muted/30 border-border"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className={cn(
                "h-4 w-4",
                metrics.overdueCount > 0 ? "text-destructive" : "text-muted-foreground"
              )} />
              <span className="text-xs text-muted-foreground">Atrasadas</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              metrics.overdueCount > 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {metrics.overdueCount}
            </p>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Taxa de Conclusão</span>
              <span className="text-xs font-medium">{completionRate.toFixed(0)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Aprovação 1ª Tentativa</span>
              <span className="text-xs font-medium">{metrics.approvalRate.toFixed(0)}%</span>
            </div>
            <Progress 
              value={metrics.approvalRate} 
              className={cn(
                "h-2",
                metrics.approvalRate >= 80 && "[&>div]:bg-success",
                metrics.approvalRate < 80 && metrics.approvalRate >= 50 && "[&>div]:bg-warning",
                metrics.approvalRate < 50 && "[&>div]:bg-destructive"
              )}
            />
          </div>
        </div>

        {/* By Assignee */}
        {metrics.byAssignee.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Por Responsável</span>
            </div>
            <div className="space-y-2">
              {metrics.byAssignee.map((assignee) => {
                const percentage = assignee.total ? (assignee.completed / assignee.total) * 100 : 0;
                return (
                  <div key={assignee.name} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-24 truncate">
                      {assignee.name}
                    </span>
                    <Progress value={percentage} className="flex-1 h-1.5" />
                    <span className="text-[10px] text-muted-foreground w-12 text-right">
                      {assignee.completed}/{assignee.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
