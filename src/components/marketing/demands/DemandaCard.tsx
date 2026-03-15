import { format, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, LinkIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  MarketingDemand,
  demandStatusConfig,
  demandPriorityConfig,
  demandTypeConfig,
} from "@/hooks/useMarketingDemands";

interface DemandaCardProps {
  demand: MarketingDemand;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
  assigneeName?: string;
}

export function DemandaCard({ demand, onClick, className, compact = false, assigneeName }: DemandaCardProps) {
  const priorityConfig = demandPriorityConfig[demand.priority];
  const typeConfig = demandTypeConfig[demand.type];
  const statusConfig = demandStatusConfig[demand.status];

  const isOverdue = demand.due_date && isPast(new Date(demand.due_date)) && 
    !['completed', 'cancelled', 'approved'].includes(demand.status);
  const isDueToday = demand.due_date && isToday(new Date(demand.due_date));

  const progress = demand.estimated_hours && demand.actual_hours
    ? Math.min(100, (demand.actual_hours / demand.estimated_hours) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-lg border bg-card p-3 cursor-pointer transition-all duration-200",
        "hover:border-app-gestao/50 hover:shadow-md hover:shadow-app-gestao/5",
        isOverdue && "border-destructive/50 bg-destructive/5",
        className
      )}
    >
      {/* Priority indicator bar */}
      <div className={cn(
        "absolute left-0 top-2 bottom-2 w-1 rounded-full",
        priorityConfig.bgColor.replace('/10', '')
      )} />

      <div className="pl-3 space-y-2">
        {/* Header: Type badge + Priority */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{typeConfig.icon}</span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priorityConfig.bgColor, priorityConfig.color)}>
              {priorityConfig.label}
            </Badge>
          </div>
          {isOverdue && (
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-medium text-sm leading-tight line-clamp-2 group-hover:text-app-gestao transition-colors",
          isOverdue && "text-destructive"
        )}>
          {demand.title}
        </h3>

        {/* Description (if not compact) */}
        {!compact && demand.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {demand.description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {demand.due_date && (
            <div className={cn(
              "flex items-center gap-1",
              isOverdue && "text-destructive",
              isDueToday && "text-yellow-500"
            )}>
              <Calendar className="h-3 w-3" />
              {format(new Date(demand.due_date), "dd/MM", { locale: ptBR })}
            </div>
          )}
          
          {demand.estimated_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {demand.actual_hours || 0}h / {demand.estimated_hours}h
            </div>
          )}

          {demand.campaign_id && (
            <div className="flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              Campanha
            </div>
          )}
        </div>

        {/* Progress bar (if has hours) */}
        {demand.estimated_hours && demand.actual_hours !== null && !compact && (
          <Progress value={progress} className="h-1" />
        )}

        {/* Footer: Assignee + Status */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar className="h-5 w-5 shrink-0">
              <AvatarFallback className="text-[9px] bg-muted">
                {assigneeName ? assigneeName.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
              {assigneeName || "Não atribuído"}
            </span>
          </div>
          
          <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", statusConfig.bgColor, statusConfig.color)}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}
