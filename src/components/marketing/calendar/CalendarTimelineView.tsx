import { useMemo, useRef } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/hooks/useUnifiedCalendarEvents";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CalendarTimelineViewProps {
  currentMonth: number;
  currentYear: number;
  events: CalendarEvent[];
  onEventEdit: (event: CalendarEvent) => void;
}

export function CalendarTimelineView({ currentMonth, currentYear, events, onEventEdit }: CalendarTimelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { days, dayWidth } = useMemo(() => {
    const start = startOfMonth(new Date(currentYear, currentMonth));
    const end = endOfMonth(new Date(currentYear, currentMonth));
    return { days: eachDayOfInterval({ start, end }), dayWidth: 40 };
  }, [currentMonth, currentYear]);

  const positionedEvents = useMemo(() => {
    const sorted = [...events].filter(e => e.start_date).sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime());
    const rows: CalendarEvent[][] = [];
    sorted.forEach(event => {
      const startDate = parseISO(event.start_date);
      const endDate = event.end_date ? parseISO(event.end_date) : startDate;
      let rowIndex = rows.findIndex(row => {
        const last = row[row.length - 1];
        const lastEnd = last.end_date ? parseISO(last.end_date) : parseISO(last.start_date);
        return startDate > lastEnd;
      });
      if (rowIndex === -1) { rowIndex = rows.length; rows.push([]); }
      rows[rowIndex].push(event);
    });
    return rows;
  }, [events]);

  const getEventPosition = (event: CalendarEvent) => {
    const startDate = parseISO(event.start_date);
    const endDate = event.end_date ? parseISO(event.end_date) : startDate;
    const monthStart = startOfMonth(new Date(currentYear, currentMonth));
    const startOffset = Math.max(0, differenceInDays(startDate, monthStart));
    const duration = differenceInDays(endDate, startDate) + 1;
    return { left: startOffset * dayWidth, width: Math.max(duration * dayWidth - 4, dayWidth - 4) };
  };

  return (
    <div className="bg-card/30 rounded-xl border border-border/50 overflow-hidden">
      <div className="flex">
        <div className="w-48 shrink-0 border-r border-border/50">
          <div className="h-14 border-b border-border/50 px-3 flex items-center">
            <span className="text-sm font-medium">Eventos</span>
          </div>
          {positionedEvents.map((row, rowIndex) => (
            <div key={rowIndex} className="h-12 border-b border-border/30 px-3 flex items-center">
              {row[0] && (() => {
                const SourceIcon = row[0].sourceIcon;
                return (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1 rounded shrink-0" style={{ backgroundColor: `${row[0].color}20` }}>
                      <SourceIcon className="h-3 w-3" style={{ color: row[0].color }} />
                    </div>
                    <span className="text-xs truncate">{row[0].title}</span>
                  </div>
                );
              })()}
            </div>
          ))}
          {positionedEvents.length === 0 && (
            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">Sem eventos</div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div style={{ width: days.length * dayWidth }}>
            <div className="h-14 border-b border-border/50 flex">
              {days.map((day) => (
                <div key={day.toISOString()} className={cn("shrink-0 flex flex-col items-center justify-center border-r border-border/20", isToday(day) && "bg-app-gestao/10")} style={{ width: dayWidth }}>
                  <span className="text-[10px] text-muted-foreground">{format(day, "EEE", { locale: ptBR })}</span>
                  <span className={cn("text-sm font-medium", isToday(day) && "text-app-gestao")}>{format(day, "d")}</span>
                </div>
              ))}
            </div>

            {positionedEvents.map((row, rowIndex) => (
              <div key={rowIndex} className="h-12 border-b border-border/30 relative">
                <div className="absolute inset-0 flex">
                  {days.map((day) => (
                    <div key={day.toISOString()} className={cn("shrink-0 border-r border-border/10", isToday(day) && "bg-app-gestao/5")} style={{ width: dayWidth }} />
                  ))}
                </div>
                {row.map((event) => {
                  const { left, width } = getEventPosition(event);
                  return (
                    <TooltipProvider key={event.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-1.5 h-9 rounded-md cursor-pointer transition-all hover:ring-2 hover:ring-white/20"
                            style={{ left: left + 2, width, backgroundColor: `${event.color}40`, borderLeft: `3px solid ${event.color}` }}
                            onClick={() => onEventEdit(event)}
                          >
                            <div className="px-2 py-1 overflow-hidden">
                              <span className="text-xs font-medium truncate block" style={{ color: event.color }}>{event.title}</span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <div className="space-y-1">
                            <p className="font-medium">{event.title}</p>
                            <p className="text-[10px] text-muted-foreground">{event.sourceLabel}</p>
                            {event.description && <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>}
                            <p className="text-[10px] text-muted-foreground">
                              {format(parseISO(event.start_date), "d MMM", { locale: ptBR })}
                              {event.end_date && event.end_date !== event.start_date && <> - {format(parseISO(event.end_date), "d MMM", { locale: ptBR })}</>}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}

            {days.some(isToday) && (
              <div className="absolute top-0 bottom-0 w-0.5 bg-app-gestao z-10" style={{ left: days.findIndex(isToday) * dayWidth + dayWidth / 2 }} />
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
