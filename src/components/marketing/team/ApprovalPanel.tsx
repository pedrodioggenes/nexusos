import { TeamTask, useApproveTask, useUpdateTaskStatus } from "@/hooks/useTeamTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";

interface ApprovalPanelProps {
  tasks: TeamTask[];
  onViewTask?: (task: TeamTask) => void;
  isLoading?: boolean;
}

export function ApprovalPanel({ tasks, onViewTask, isLoading }: ApprovalPanelProps) {
  const pendingTasks = tasks.filter(
    (task) => task.status === "review" && task.approval_status === "pending"
  );

  if (isLoading) {
    return (
      <Card className="card-base">
        <CardHeader className="p-4 pb-2">
          <div className="h-5 w-40 bg-muted/50 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (pendingTasks.length === 0) {
    return (
      <Card className="card-base">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4 text-warning" />
            Aprovações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhuma aprovação pendente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-base border-warning/20">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-warning" />
            Aprovações Pendentes
          </span>
          <Badge variant="secondary" className="bg-warning/10 text-warning">
            {pendingTasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        {pendingTasks.map((task) => (
          <ApprovalItem key={task.id} task={task} onView={() => onViewTask?.(task)} />
        ))}
      </CardContent>
    </Card>
  );
}

interface ApprovalItemProps {
  task: TeamTask;
  onView?: () => void;
}

function ApprovalItem({ task, onView }: ApprovalItemProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const approveTask = useApproveTask();
  const updateStatus = useUpdateTaskStatus();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleQuickApprove = async () => {
    setIsProcessing(true);
    try {
      await approveTask.mutateAsync({
        id: task.id,
        approved: true,
      });
      await updateStatus.mutateAsync({
        id: task.id,
        status: "done",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border hover:border-warning/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium line-clamp-1">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {task.description}
            </p>
          )}
        </div>
        <Badge variant="outline" className="text-[9px] shrink-0">
          {task.task_type === "social" && "Social"}
          {task.task_type === "traffic" && "Tráfego"}
          {task.task_type === "design" && "Design"}
          {task.task_type === "copy" && "Copy"}
        </Badge>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px] bg-secondary">
              {getInitials(task.assignee_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-muted-foreground">
            {task.assignee_name || "Não atribuído"}
          </span>
        </div>
        {task.deadline && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {format(new Date(task.deadline), "dd/MM", { locale: ptBR })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={onView}
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver
        </Button>
        <Button
          size="sm"
          className="flex-1 h-8 text-xs bg-success hover:bg-success/90"
          onClick={handleQuickApprove}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Aprovar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
