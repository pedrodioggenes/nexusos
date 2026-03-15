import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  format, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, parseISO, startOfWeek, endOfWeek, isWithinInterval, differenceInDays
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { STATUS_CONFIG, STATUS_COLORS } from "./CronogramaHeader";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface CronogramaCalendarViewProps {
  currentMonth: number;
  currentYear: number;
  initiatives: any[];
}

interface LaneEvent {
  initiative: any;
  startCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
}

export function CronogramaCalendarView({ currentMonth, currentYear, initiatives }: CronogramaCalendarViewProps) {
  const monthDate = new Date(currentYear, currentMonth);

  const weeks = useMemo(() => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const calStart = startOfWeek(start, { weekStartsOn: 0 });
    const calEnd = endOfWeek(end, { weekStartsOn: 0 });
    const allDays = eachDayOfInterval({ start: calStart, end: calEnd });
    const result: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      result.push(allDays.slice(i, i + 7));
    }
    return result;
  }, [currentMonth, currentYear]);

  // Compute multi-day event lanes per week
  const weekLanes = useMemo(() => {
    return weeks.map((weekDays) => {
      const weekStart = weekDays[0];
      const weekEnd = weekDays[6];
      
      // Find initiatives that overlap this week
      const overlapping = initiatives.filter((init: any) => {
        if (!init.start_date || !init.target_date) return false;
        const s = parseISO(init.start_date);
        const e = parseISO(init.target_date);
        return !(e < weekStart || s > weekEnd);
      }).sort((a: any, b: any) => {
        const da = differenceInDays(parseISO(a.target_date), parseISO(a.start_date));
        const db = differenceInDays(parseISO(b.target_date), parseISO(b.start_date));
        return db - da; // longer events first
      });

      // Assign lanes (rows) to avoid overlap
      const lanes: LaneEvent[][] = [];
      overlapping.forEach((init: any) => {
        const s = parseISO(init.start_date);
        const e = parseISO(init.target_date);
        const clampStart = s < weekStart ? weekStart : s;
        const clampEnd = e > weekEnd ? weekEnd : e;
        const startCol = weekDays.findIndex(d => isSameDay(d, clampStart));
        const endCol = weekDays.findIndex(d => isSameDay(d, clampEnd));
        const sc = startCol >= 0 ? startCol : 0;
        const ec = endCol >= 0 ? endCol : 6;
        const span = ec - sc + 1;

        const event: LaneEvent = {
          initiative: init,
          startCol: sc,
          span,
          isStart: s >= weekStart,
          isEnd: e <= weekEnd,
        };

        // Find first lane where this event fits
        let placed = false;
        for (const lane of lanes) {
          const conflict = lane.some(le => {
            const leEnd = le.startCol + le.span - 1;
            return !(ec < le.startCol || sc > leEnd);
          });
          if (!conflict) {
            lane.push(event);
            placed = true;
            break;
          }
        }
        if (!placed) {
          lanes.push([event]);
        }
      });

      return lanes;
    });
  }, [weeks, initiatives]);

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-card/30">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              "py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider",
              i === 0 || i === 6 ? "text-muted-foreground/40" : "text-muted-foreground/70"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {weeks.map((weekDays, weekIndex) => {
        const lanes = weekLanes[weekIndex];
        const laneHeight = 20;
        const laneGap = 2;
        const lanesSpace = Math.max(lanes.length, 0) * (laneHeight + laneGap);
        const minHeight = 80 + lanesSpace;

        return (
          <div key={weekIndex} className="border-b border-border/20 last:border-b-0">
            {/* Day numbers row */}
            <div className="grid grid-cols-7">
              {weekDays.map((date) => {
                const isCurrentMonth = isSameMonth(date, monthDate);
                const today = isToday(date);
                return (
                  <div
                    key={format(date, "yyyy-MM-dd")}
                    className={cn(
                      "border-r border-border/15 last:border-r-0 px-1.5 pt-1.5 pb-0",
                      !isCurrentMonth && "bg-muted/5",
                      today && "bg-module-pmo/[0.04]"
                    )}
                    style={{ minHeight }}
                  >
                    <span
                      className={cn(
                        "text-xs h-6 w-6 flex items-center justify-center rounded-full",
                        today && "bg-module-pmo text-white font-bold",
                        !today && isCurrentMonth && "text-foreground/80 font-medium",
                        !today && !isCurrentMonth && "text-muted-foreground/25"
                      )}
                    >
                      {date.getDate() === 1
                        ? format(date, "d MMM", { locale: ptBR })
                        : date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Event lanes overlay */}
            <div className="relative" style={{ height: lanesSpace > 0 ? lanesSpace + 4 : 0 }}>
              {lanes.map((lane, laneIndex) =>
                lane.map((le) => {
                  const color = STATUS_COLORS[le.initiative.status] || STATUS_COLORS.backlog;
                  const leftPct = (le.startCol / 7) * 100;
                  const widthPct = (le.span / 7) * 100;
                  const top = laneIndex * (laneHeight + laneGap) + 2;

                  return (
                    <Tooltip key={le.initiative.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "absolute cursor-default transition-all hover:brightness-110 hover:ring-1 hover:ring-ring/20 flex items-center px-1.5 overflow-hidden",
                            le.isStart && "rounded-l-md",
                            le.isEnd && "rounded-r-md"
                          )}
                          style={{
                            left: `calc(${leftPct}% + 4px)`,
                            width: `calc(${widthPct}% - 8px)`,
                            top,
                            height: laneHeight,
                            backgroundColor: `${color}25`,
                            borderLeft: le.isStart ? `3px solid ${color}` : undefined,
                            borderRight: le.isEnd ? `1px solid ${color}40` : undefined,
                          }}
                        >
                          <span className="text-[10px] font-semibold truncate" style={{ color }}>
                            {le.initiative.title}
                          </span>
                          {le.initiative.progress != null && le.span >= 2 && (
                            <span className="text-[9px] ml-auto shrink-0 font-medium" style={{ color: `${color}CC` }}>
                              {le.initiative.progress}%
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium text-xs">{le.initiative.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[9px] px-1.5 py-0 h-4",
                              (STATUS_CONFIG[le.initiative.status] || STATUS_CONFIG.backlog).bg,
                              (STATUS_CONFIG[le.initiative.status] || STATUS_CONFIG.backlog).color
                            )}
                          >
                            {(STATUS_CONFIG[le.initiative.status] || STATUS_CONFIG.backlog).label}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(parseISO(le.initiative.start_date), "dd MMM", { locale: ptBR })} → {format(parseISO(le.initiative.target_date), "dd MMM", { locale: ptBR })}
                        </p>
                        {le.initiative.progress != null && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <Progress value={le.initiative.progress} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-medium">{le.initiative.progress}%</span>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
