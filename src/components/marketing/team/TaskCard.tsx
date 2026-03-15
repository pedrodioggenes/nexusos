import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Paperclip, MessageSquare } from "lucide-react";
import { TeamTask } from "@/hooks/useTeamTasks";
import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: TeamTask;
  onClick?: () => void;
  isDragging?: boolean;
}

const priorityConfig = {
  low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  medium: { label: "Média", className: "bg-warning/10 text-warning border-warning/20" },
  high: { label: "Alta", className: "bg-destructive/10 text-destructive border-destructive/20" },
  urgent: { label: "Urgente", className: "bg-destructive text-destructive-foreground" },
};

const approvalConfig = {
  pending: { label: "Aguardando", className: "bg-warning/10 text-warning" },
  approved: { label: "Aprovado", className: "bg-success/10 text-success" },
  revision: { label: "Revisão", className: "bg-destructive/10 text-destructive" },
};

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done';
  const isDueToday = task.deadline && isToday(new Date(task.deadline));

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      style={{ willChange: 'transform' }}
      className="animate-safe text-render-fix"
    >
      <Card
        onClick={onClick}
        className={cn(
          "p-3 cursor-pointer transition-all duration-200",
          "bg-card hover:bg-card-elevated border-border hover:border-muted-foreground/20",
          isDragging && "shadow-lg ring-2 ring-primary/50 rotate-2",
          isOverdue && "border-destructive/50"
        )}
      >
        {/* Header: Title + Priority */}
        <div className="flex items-start justify-between gap-2 mb-2">
           <h4 className="text-sm font-medium line-clamp-2 flex-1 min-w-0 break-words">{task.title}</h4>
          <Badge variant="outline" className={cn("text-[10px] shrink-0", priority.className)}>
            {priority.label}
          </Badge>
        </div>

        {/* Description preview */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Platforms */}
        {task.platforms && task.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.platforms.slice(0, 3).map((platform) => (
              <Badge key={platform} variant="secondary" className="text-[9px] px-1.5 py-0">
                {platform}
              </Badge>
            ))}
            {task.platforms.length > 3 && (
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                +{task.platforms.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer: Assignee, Deadline, Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[9px] bg-secondary">
                {getInitials(task.assignee_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
              {task.assignee_name || "Não atribuído"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Estimated hours */}
            {task.estimated_hours && (
              <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.estimated_hours}h</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}

            {/* Deadline */}
            {task.deadline && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-[10px]",
                  isOverdue && "text-destructive",
                  isDueToday && !isOverdue && "text-warning",
                  !isOverdue && !isDueToday && "text-muted-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.deadline), "dd/MM", { locale: ptBR })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Approval status if in review */}
        {task.status === 'review' && task.approval_status && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <Badge 
              variant="outline" 
              className={cn("text-[10px]", approvalConfig[task.approval_status]?.className)}
            >
              {approvalConfig[task.approval_status]?.label}
            </Badge>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
