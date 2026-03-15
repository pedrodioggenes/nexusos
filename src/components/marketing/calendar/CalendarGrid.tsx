import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CalendarEvent, CAMPAIGN_TYPE_COLORS } from "@/hooks/useUnifiedCalendarEvents";
import { CalendarEventHoverCard } from "./CalendarEventHoverCard";
import { resolveEventColor } from "./calendarUtils";
import { Plus } from "lucide-react";
import {
  format,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  parseISO,
  differenceInCalendarDays,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter,
  max as dateMax,
  min as dateMin,
} from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarGridProps {
  currentMonth: number;
  currentYear: number;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDayClick: (date: Date) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (event: CalendarEvent) => void;
  onEventDuplicate: (event: CalendarEvent) => void;
  onEventDrop: (event: CalendarEvent, newDate: Date) => void;
  onDayDoubleClick?: (date: Date) => void;
}

const WEEKDAYS = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
const MAX_VISIBLE_LANES = 3;
const LANE_HEIGHT = 22;
const LANE_GAP = 2;

interface EventSegment {
  event: CalendarEvent;
  startCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
}

export function CalendarGrid({
  currentMonth,
  currentYear,
  events,
  selectedDate,
  onDayClick,
  onEventEdit,
  onEventDelete,
  onEventDuplicate,
  onEventDrop,
  onDayDoubleClick,
}: CalendarGridProps) {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<Date | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

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

  const parsedEvents = useMemo(() => {
    return events
      .filter((e) => e.start_date)
      .map((e) => ({
        event: e,
        start: parseISO(e.start_date!),
        end: e.end_date ? parseISO(e.end_date) : parseISO(e.start_date!),
      }))
      .map((e) => ({
        ...e,
        isMultiDay: !isSameDay(e.start, e.end),
      }));
  }, [events]);

  const weekLayouts = useMemo(() => {
    return weeks.map((weekDays) => {
      const weekStart = weekDays[0];
      const weekEnd = weekDays[6];

      const overlapping = parsedEvents.filter(
        (e) => !isAfter(e.start, weekEnd) && !isBefore(e.end, weekStart)
      );

      const multiDay = overlapping
        .filter((e) => e.isMultiDay)
        .sort((a, b) => {
          const d = a.start.getTime() - b.start.getTime();
          if (d !== 0) return d;
          return differenceInCalendarDays(b.end, b.start) - differenceInCalendarDays(a.end, a.start);
        });

      const lanes: EventSegment[][] = [];

      multiDay.forEach(({ event, start, end }) => {
        const segStart = dateMax([start, weekStart]);
        const segEnd = dateMin([end, weekEnd]);
        const startCol = getDay(segStart);
        const endCol = getDay(segEnd);
        const span = endCol - startCol + 1;

        const segment: EventSegment = { event, startCol, span, isStart: isSameDay(start, segStart), isEnd: isSameDay(end, segEnd) };

        let placed = false;
        for (let i = 0; i < lanes.length; i++) {
          const canFit = lanes[i].every((s) => {
            const sEnd = s.startCol + s.span - 1;
            return startCol > sEnd || startCol + span - 1 < s.startCol;
          });
          if (canFit) { lanes[i].push(segment); placed = true; break; }
        }
        if (!placed) lanes.push([segment]);
      });

      const singleByCol: Record<number, CalendarEvent[]> = {};
      overlapping
        .filter((e) => !e.isMultiDay)
        .forEach(({ event, start }) => {
          const col = getDay(start);
          if (!singleByCol[col]) singleByCol[col] = [];
          singleByCol[col].push(event);
        });

      return { lanes, singleByCol };
    });
  }, [weeks, parsedEvents]);

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetDate(date);
  };
  const handleDragLeave = () => setDropTargetDate(null);
  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedEvent) onEventDrop(draggedEvent, date);
    setDraggedEvent(null);
    setDropTargetDate(null);
  };
  const handleDragEnd = () => { setDraggedEvent(null); setDropTargetDate(null); };

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden select-none">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20">
        {WEEKDAYS.map((day, i) => (
          <div key={day} className={cn("py-2 text-center text-[11px] font-medium uppercase tracking-wider", i === 0 || i === 6 ? "text-muted-foreground/50" : "text-muted-foreground/70")}>
            {day}
          </div>
        ))}
      </div>

      {weeks.map((weekDays, weekIndex) => {
        const layout = weekLayouts[weekIndex];
        const visibleLanes = Math.min(layout.lanes.length, MAX_VISIBLE_LANES);
        const barsAreaHeight = visibleLanes > 0 ? visibleLanes * (LANE_HEIGHT + LANE_GAP) + 2 : 0;

        return (
          <div key={weekIndex} className="border-b border-border/20 last:border-b-0">
            {visibleLanes > 0 && (
              <div className="grid grid-cols-7">
                <div className="col-span-7 relative" style={{ height: barsAreaHeight }}>
                  {layout.lanes.slice(0, MAX_VISIBLE_LANES).map((segments, laneIdx) =>
                    segments.map((seg) => {
                      const color = seg.event.color;
                      const leftPct = (seg.startCol / 7) * 100;
                      const widthPct = (seg.span / 7) * 100;
                      const SourceIcon = seg.event.sourceIcon;

                      return (
                        <CalendarEventHoverCard
                          key={`${seg.event.id}-${weekIndex}-${laneIdx}`}
                          event={seg.event}
                          onEdit={onEventEdit}
                          onDelete={onEventDelete}
                          onDuplicate={onEventDuplicate}
                        >
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, seg.event)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              "absolute flex items-center gap-1 px-2 text-[11px] font-medium truncate cursor-pointer transition-all hover:brightness-110 hover:shadow-sm",
                              seg.isStart ? "rounded-l-[4px]" : "rounded-l-none",
                              seg.isEnd ? "rounded-r-[4px]" : "rounded-r-none",
                              draggedEvent?.id === seg.event.id && "opacity-40"
                            )}
                            style={{
                              top: laneIdx * (LANE_HEIGHT + LANE_GAP) + 1,
                              left: `calc(${leftPct}% + 2px)`,
                              width: `calc(${widthPct}% - 4px)`,
                              height: LANE_HEIGHT,
                              backgroundColor: `${color}55`,
                              color: "#fff",
                              borderLeft: seg.isStart ? `3px solid ${color}` : undefined,
                            }}
                            onClick={(e) => { e.stopPropagation(); onEventEdit(seg.event); }}
                          >
                            <SourceIcon className="h-2.5 w-2.5 shrink-0 opacity-80" />
                            {seg.event.source === 'campaign' && CAMPAIGN_TYPE_COLORS[seg.event.type] && (
                              <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: CAMPAIGN_TYPE_COLORS[seg.event.type] }} />
                            )}
                            <span className="truncate">{seg.event.title}</span>
                          </div>
                        </CalendarEventHoverCard>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {layout.lanes.length > MAX_VISIBLE_LANES && (
              <div className="px-2 pb-1 text-[10px] text-muted-foreground">
                +{layout.lanes.length - MAX_VISIBLE_LANES} mais
              </div>
            )}

            <div className="grid grid-cols-7">
              {weekDays.map((date, colIndex) => {
                const isCurrentMonth = isSameMonth(date, monthDate);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isDropTarget = dropTargetDate && isSameDay(date, dropTargetDate);
                const today = isToday(date);
                const dayKey = format(date, "yyyy-MM-dd");
                const isHovered = hoveredDay === dayKey;
                const singleEvents = layout.singleByCol[colIndex] || [];
                const maxSingle = Math.max(0, MAX_VISIBLE_LANES - visibleLanes + 2);

                return (
                  <div
                    key={dayKey}
                    className={cn(
                      "relative min-h-[80px] border-r border-border/15 last:border-r-0 transition-colors cursor-pointer group/day",
                      !isCurrentMonth && "bg-muted/5",
                      isSelected && "bg-primary/5",
                      isDropTarget && "bg-primary/10 ring-1 ring-inset ring-primary/40",
                      today && "bg-primary/[0.02]"
                    )}
                    onClick={() => onDayClick(date)}
                    onDoubleClick={() => onDayDoubleClick?.(date)}
                    onDragOver={(e) => handleDragOver(e, date)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, date)}
                    onMouseEnter={() => setHoveredDay(dayKey)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="flex items-center justify-between px-1.5 pt-1 pb-0.5">
                      <span className={cn(
                        "text-xs h-6 w-6 flex items-center justify-center rounded-full transition-colors",
                        today && "bg-foreground text-background font-bold",
                        !today && isCurrentMonth && "text-foreground/80",
                        !today && !isCurrentMonth && "text-muted-foreground/30"
                      )}>
                        {date.getDate() === 1 ? format(date, "d MMM", { locale: ptBR }) : date.getDate()}
                      </span>
                      <button
                        className={cn("h-5 w-5 rounded flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-all", isHovered ? "opacity-100" : "opacity-0")}
                        onClick={(e) => { e.stopPropagation(); onDayDoubleClick?.(date); }}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="px-1 space-y-0.5 pb-1">
                      {singleEvents.slice(0, maxSingle).map((event) => {
                        const color = event.color;
                        const SourceIcon = event.sourceIcon;
                        return (
                          <CalendarEventHoverCard key={event.id} event={event} onEdit={onEventEdit} onDelete={onEventDelete} onDuplicate={onEventDuplicate}>
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, event)}
                              onDragEnd={handleDragEnd}
                              className={cn(
                                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium truncate cursor-pointer transition-all hover:brightness-110",
                                draggedEvent?.id === event.id && "opacity-40"
                              )}
                              style={{ backgroundColor: `${color}30`, color, borderLeft: `3px solid ${color}` }}
                              onClick={(e) => { e.stopPropagation(); onEventEdit(event); }}
                            >
                              <SourceIcon className="h-2.5 w-2.5 shrink-0 opacity-70" />
                              {event.source === 'campaign' && CAMPAIGN_TYPE_COLORS[event.type] && (
                                <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: CAMPAIGN_TYPE_COLORS[event.type] }} />
                              )}
                              <span className="truncate">{event.title}</span>
                            </div>
                          </CalendarEventHoverCard>
                        );
                      })}
                      {singleEvents.length > maxSingle && (
                        <span className="text-[10px] text-muted-foreground px-1">+{singleEvents.length - maxSingle} mais</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
