import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, CalendarDays, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays, isAfter } from "date-fns";
import { STATUS_CONFIG, STATUS_COLORS } from "./CronogramaHeader";

interface CronogramaListViewProps {
  initiatives: any[];
}

export function CronogramaListView({ initiatives }: CronogramaListViewProps) {
  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-card/30">
      {/* Table Header */}
      <div className="grid grid-cols-[1fr_100px_100px_100px_80px_100px] gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Iniciativa</span>
        <span>Status</span>
        <span>Início</span>
        <span>Prazo</span>
        <span>Progresso</span>
        <span>Responsável</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/20">
        {initiatives.map((initiative: any) => {
          const cfg = STATUS_CONFIG[initiative.status] || STATUS_CONFIG.backlog;
          const color = STATUS_COLORS[initiative.status] || STATUS_COLORS.backlog;
          const isOverdue = isAfter(new Date(), parseISO(initiative.target_date)) && initiative.status !== "concluido";
          const daysRemaining = differenceInDays(parseISO(initiative.target_date), new Date());
          const totalDays = differenceInDays(parseISO(initiative.target_date), parseISO(initiative.start_date));

          return (
            <div
              key={initiative.id}
              className={cn(
                "grid grid-cols-[1fr_100px_100px_100px_80px_100px] gap-2 px-4 py-3 items-center hover:bg-muted/20 transition-colors",
                isOverdue && "bg-destructive/[0.03]"
              )}
            >
              {/* Title */}
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{initiative.title}</p>
                {initiative.area && (
                  <span className="text-[10px] text-muted-foreground">{initiative.area}</span>
                )}
              </div>

              {/* Status */}
              <div>
                <Badge variant="secondary" className={cn("text-[9px] px-1.5 py-0 h-4", cfg.bg, cfg.color)}>
                  {cfg.label}
                </Badge>
                {isOverdue && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
                    <span className="text-[9px] text-destructive font-medium">Atrasado</span>
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {format(parseISO(initiative.start_date), "dd/MM/yy")}
              </div>

              {/* End Date */}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className={cn(isOverdue && "text-destructive font-medium")}>
                  {format(parseISO(initiative.target_date), "dd/MM/yy")}
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-1.5">
                <Progress value={initiative.progress ?? 0} className="h-1.5 flex-1" />
                <span className="text-[10px] font-medium text-muted-foreground w-7 text-right">
                  {initiative.progress ?? 0}%
                </span>
              </div>

              {/* Owner */}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                {initiative.owner_name ? (
                  <>
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{initiative.owner_name}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
