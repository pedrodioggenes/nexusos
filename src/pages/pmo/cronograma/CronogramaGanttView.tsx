import { useMemo, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format, parseISO, differenceInDays, startOfMonth, endOfMonth,
  eachMonthOfInterval, eachWeekOfInterval, isBefore, isAfter, isToday, startOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { STATUS_CONFIG, STATUS_COLORS } from "./CronogramaHeader";

const DAY_WIDTH = 28;
const ROW_HEIGHT = 44;
const LABEL_WIDTH = 220;

interface CronogramaGanttViewProps {
  initiatives: any[];
}

export function CronogramaGanttView({ initiatives }: CronogramaGanttViewProps) {
  const todayRef = useRef<HTMLDivElement>(null);

  const { months, timelineStart, timelineEnd, totalDays } = useMemo(() => {
    if (initiatives.length === 0) {
      const now = new Date();
      const s = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
      const e = endOfMonth(new Date(now.getFullYear(), now.getMonth() + 4));
      const ms = eachMonthOfInterval({ start: s, end: e });
      return { months: ms, timelineStart: s, timelineEnd: e, totalDays: differenceInDays(e, s) || 1 };
    }
    const dates = initiatives.flatMap((i: any) => [parseISO(i.start_date), parseISO(i.target_date)]);
    const minDate = startOfMonth(new Date(Math.min(...dates.map(d => d.getTime())) - 7 * 86400000));
    const maxDate = endOfMonth(new Date(Math.max(...dates.map(d => d.getTime())) + 14 * 86400000));
    const ms = eachMonthOfInterval({ start: minDate, end: maxDate });
    return { months: ms, timelineStart: minDate, timelineEnd: maxDate, totalDays: differenceInDays(maxDate, minDate) || 1 };
  }, [initiatives]);

  const weeks = useMemo(() => {
    return eachWeekOfInterval({ start: timelineStart, end: timelineEnd }, { weekStartsOn: 1 });
  }, [timelineStart, timelineEnd]);

  const gridWidth = totalDays * DAY_WIDTH;

  const todayOffset = useMemo(() => {
    const today = new Date();
    if (isBefore(today, timelineStart) || isAfter(today, timelineEnd)) return null;
    return differenceInDays(today, timelineStart) * DAY_WIDTH;
  }, [timelineStart, timelineEnd]);

  // Auto-scroll to today on mount
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ inline: "center", behavior: "auto" });
    }
  }, [todayOffset]);

  const getBar = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const cs = isBefore(start, timelineStart) ? timelineStart : start;
    const ce = isAfter(end, timelineEnd) ? timelineEnd : end;
    const left = differenceInDays(cs, timelineStart) * DAY_WIDTH;
    const width = Math.max((differenceInDays(ce, cs) + 1) * DAY_WIDTH - 4, DAY_WIDTH - 4);
    return { left, width };
  };

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-card/30">
      <div className="flex">
        {/* Left labels column */}
        <div className="shrink-0 z-20 bg-card border-r border-border/50" style={{ width: LABEL_WIDTH }}>
          {/* Month header spacer */}
          <div className="h-[30px] border-b border-border/50" />
          {/* Week header spacer */}
          <div className="h-[26px] border-b border-border/40 px-3 flex items-center">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Iniciativa</span>
          </div>
          {/* Rows */}
          {initiatives.map((init: any) => {
            const cfg = STATUS_CONFIG[init.status] || STATUS_CONFIG.backlog;
            const isOverdue = isAfter(new Date(), parseISO(init.target_date)) && init.status !== "concluido";
            return (
              <div
                key={init.id}
                className="border-b border-border/20 px-3 flex flex-col justify-center hover:bg-muted/20 transition-colors"
                style={{ height: ROW_HEIGHT }}
              >
                <p className="text-[11px] font-medium text-foreground truncate leading-tight">{init.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant="secondary" className={cn("text-[8px] px-1 py-0 h-3.5 leading-none", cfg.bg, cfg.color)}>
                    {cfg.label}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-[8px] px-1 py-0 h-3.5 leading-none">Atrasado</Badge>
                  )}
                  {init.owner_name && (
                    <span className="text-[8px] text-muted-foreground truncate flex items-center gap-0.5 ml-auto">
                      <User className="h-2.5 w-2.5" />
                      {init.owner_name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable timeline area */}
        <ScrollArea className="flex-1">
          <div style={{ width: gridWidth, position: "relative" }}>
            {/* Month headers */}
            <div className="h-[30px] border-b border-border/50 flex sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
              {months.map((month, i) => {
                const mStart = startOfMonth(month);
                const mEnd = endOfMonth(month);
                const clampStart = isBefore(mStart, timelineStart) ? timelineStart : mStart;
                const clampEnd = isAfter(mEnd, timelineEnd) ? timelineEnd : mEnd;
                const w = (differenceInDays(clampEnd, clampStart) + 1) * DAY_WIDTH;
                const left = differenceInDays(clampStart, timelineStart) * DAY_WIDTH;
                return (
                  <div
                    key={i}
                    className="absolute top-0 h-full flex items-center justify-center border-r border-border/30"
                    style={{ left, width: w }}
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {format(month, "MMMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Week numbers sub-header */}
            <div className="h-[26px] border-b border-border/40 flex relative bg-muted/10">
              {weeks.map((weekStart, i) => {
                const left = Math.max(differenceInDays(weekStart, timelineStart), 0) * DAY_WIDTH;
                return (
                  <div
                    key={i}
                    className="absolute top-0 h-full flex items-center justify-center border-r border-border/15"
                    style={{ left, width: 7 * DAY_WIDTH }}
                  >
                    <span className="text-[9px] text-muted-foreground/60">
                      S{format(weekStart, "w")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Rows with bars */}
            {initiatives.map((init: any) => {
              const { left, width } = getBar(init.start_date, init.target_date);
              const statusColor = STATUS_COLORS[init.status] || STATUS_COLORS.backlog;
              const isOverdue = isAfter(new Date(), parseISO(init.target_date)) && init.status !== "concluido";

              return (
                <div
                  key={init.id}
                  className="relative border-b border-border/10 hover:bg-muted/10 transition-colors"
                  style={{ height: ROW_HEIGHT }}
                >
                  {/* Week grid lines */}
                  {weeks.map((ws, wi) => {
                    const wl = Math.max(differenceInDays(ws, timelineStart), 0) * DAY_WIDTH;
                    return (
                      <div key={wi} className="absolute top-0 bottom-0 border-r border-border/8" style={{ left: wl }} />
                    );
                  })}

                  {/* Bar */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute top-2 rounded-md cursor-default transition-all hover:ring-2 hover:ring-ring/30 hover:brightness-110"
                        style={{
                          left: left + 2,
                          width,
                          height: ROW_HEIGHT - 16,
                          backgroundColor: `${statusColor}30`,
                          borderLeft: `3px solid ${statusColor}`,
                        }}
                      >
                        {/* Progress fill */}
                        {init.progress != null && init.progress > 0 && (
                          <div
                            className="absolute inset-y-0 left-0 rounded-l-md"
                            style={{
                              width: `${Math.min(init.progress, 100)}%`,
                              backgroundColor: `${statusColor}25`,
                            }}
                          />
                        )}
                        <div className="h-full flex items-center px-2 overflow-hidden relative z-10 gap-1.5">
                          <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: statusColor }}>
                            {init.progress != null ? `${init.progress}%` : ""}
                          </span>
                          <span className="text-[9px] text-foreground/60 truncate hidden sm:inline">
                            {init.title}
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="font-medium text-xs">{init.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(parseISO(init.start_date), "dd MMM yyyy", { locale: ptBR })} → {format(parseISO(init.target_date), "dd MMM yyyy", { locale: ptBR })}
                      </p>
                      {init.progress != null && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Progress value={init.progress} className="h-1.5 flex-1" />
                          <span className="text-[10px] font-medium">{init.progress}%</span>
                        </div>
                      )}
                      {isOverdue && <p className="text-[10px] text-destructive mt-1 font-medium">⚠ Prazo ultrapassado</p>}
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}

            {/* Today line */}
            {todayOffset !== null && (
              <div
                ref={todayRef}
                className="absolute z-30 pointer-events-none"
                style={{ left: todayOffset + DAY_WIDTH / 2, top: 0, bottom: 0 }}
              >
                <div className="w-0.5 h-full bg-app-pmo" />
                <div className="absolute top-0 -translate-x-1/2 bg-app-pmo text-white text-[7px] font-bold px-1.5 py-0.5 rounded-b-sm tracking-wide">
                  HOJE
                </div>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
