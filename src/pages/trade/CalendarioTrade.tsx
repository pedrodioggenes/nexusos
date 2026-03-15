import { useState, useMemo, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Package, FileCheck, Image, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday,
  startOfWeek,
  endOfWeek,
  getDay,
  isWithinInterval,
  isBefore,
  isAfter,
  max as dateMax,
  min as dateMin,
  differenceInCalendarDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  type: 'package_start' | 'package_end' | 'deadline' | 'proof';
  supplier?: string;
  color: string;
}

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Campanha Páscoa', startDate: '2026-01-27', endDate: '2026-02-05', type: 'package_start', supplier: 'Nestlé', color: '#10B981' },
  { id: '2', title: 'Prazo Display Coca', startDate: '2026-01-28', type: 'deadline', supplier: 'Coca-Cola', color: '#F59E0B' },
  { id: '3', title: 'Limpeza Q1', startDate: '2026-01-25', endDate: '2026-01-30', type: 'package_end', supplier: 'P&G', color: '#EF4444' },
  { id: '4', title: 'Comprovação Pendente', startDate: '2026-01-27', type: 'proof', supplier: 'Ambev', color: '#8B5CF6' },
  { id: '5', title: 'Verão 2026', startDate: '2026-02-01', endDate: '2026-02-15', type: 'package_start', supplier: 'Coca-Cola', color: '#10B981' },
  { id: '6', title: 'Prazo Checklist', startDate: '2026-02-05', type: 'deadline', supplier: 'Nestlé', color: '#F59E0B' },
  { id: '7', title: 'Campanha Carnaval', startDate: '2026-02-10', endDate: '2026-02-18', type: 'package_end', supplier: 'Ambev', color: '#EF4444' },
  { id: '8', title: 'Display Páscoa', startDate: '2026-01-29', type: 'deadline', supplier: 'Nestlé', color: '#F59E0B' },
  { id: '9', title: 'Montagem Ponta VS10', startDate: '2026-02-03', endDate: '2026-02-07', type: 'package_start', supplier: 'P&G', color: '#10B981' },
  { id: '10', title: 'Revisão Contrato Q2', startDate: '2026-02-10', type: 'deadline', supplier: 'Nestlé', color: '#F59E0B' },
];

const getEventIcon = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'package_start':
    case 'package_end':
      return Package;
    case 'deadline':
      return FileCheck;
    case 'proof':
      return Image;
    default:
      return Calendar;
  }
};

const getTypeLabel = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'package_start': return 'Início Pacote';
    case 'package_end': return 'Fim Pacote';
    case 'deadline': return 'Prazo';
    case 'proof': return 'Comprovação';
    default: return type;
  }
};

const WEEKDAYS = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
const MAX_EVENT_ROWS = 3;

interface EventSegment {
  event: CalendarEvent;
  startCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
}

export default function CalendarioTrade() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar weeks
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const allDays = eachDayOfInterval({ start: calStart, end: calEnd });

    const result: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      result.push(allDays.slice(i, i + 7));
    }
    return result;
  }, [currentDate]);

  // Compute multi-day event layout per week
  const weekLayouts = useMemo(() => {
    const parsedEvents = mockEvents.map(e => ({
      event: e,
      start: new Date(e.startDate),
      end: e.endDate ? new Date(e.endDate) : new Date(e.startDate),
    })).map(e => ({
      ...e,
      isMultiDay: !isSameDay(e.start, e.end),
    }));

    return weeks.map(weekDays => {
      const weekStart = weekDays[0];
      const weekEnd = weekDays[6];

      const overlapping = parsedEvents.filter(
        e => !isAfter(e.start, weekEnd) && !isBefore(e.end, weekStart)
      );

      const multiDay = overlapping
        .filter(e => e.isMultiDay)
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

        const segment: EventSegment = {
          event,
          startCol,
          span,
          isStart: isSameDay(start, segStart),
          isEnd: isSameDay(end, segEnd),
        };

        let placed = false;
        for (const lane of lanes) {
          const canFit = lane.every(existing => {
            const eEnd = existing.startCol + existing.span - 1;
            return startCol > eEnd || startCol + span - 1 < existing.startCol;
          });
          if (canFit) { lane.push(segment); placed = true; break; }
        }
        if (!placed) lanes.push([segment]);
      });

      const singleDayByCol: Record<number, CalendarEvent[]> = {};
      overlapping.filter(e => !e.isMultiDay).forEach(({ event, start }) => {
        const col = getDay(start);
        if (!singleDayByCol[col]) singleDayByCol[col] = [];
        singleDayByCol[col].push(event);
      });

      return { lanes, singleDayByCol };
    });
  }, [currentDate, weeks]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return mockEvents.filter(e => {
      const start = new Date(e.startDate);
      const end = e.endDate ? new Date(e.endDate) : start;
      return isWithinInterval(selectedDate, { start, end }) || isSameDay(start, selectedDate);
    });
  }, [selectedDate]);

  const navigatePrevious = () => setCurrentDate(subMonths(currentDate, 1));
  const navigateNext = () => setCurrentDate(addMonths(currentDate, 1));
  const navigateToday = () => setCurrentDate(new Date());

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Calendário Trade" 
        description="Visão geral de prazos e eventos de trade marketing"
        actions={
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-module-trade hover:bg-module-trade/90">
            <Plus className="h-3.5 w-3.5" />
            Novo Evento
          </Button>
        }
      />

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* Calendar */}
        <Card className="card-base">
          <CardHeader className="p-4 pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold lowercase first-letter:uppercase">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <div className="flex items-center border border-border/50 rounded-md">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-none" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-3 rounded-none border-x border-border/50" onClick={navigateToday}>
                  Hoje
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-none" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Week headers */}
            <div className="grid grid-cols-7 border-b border-border/40">
              {WEEKDAYS.map((day, idx) => (
                <div 
                  key={day} 
                  className={cn(
                    "text-center text-xs font-medium py-2 uppercase tracking-wider text-muted-foreground/70",
                    (idx === 0 || idx === 6) && "text-destructive/50"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid with multi-day bars */}
            {weeks.map((weekDays, weekIndex) => {
              const layout = weekLayouts[weekIndex];
              const laneCount = Math.min(layout.lanes.length, MAX_EVENT_ROWS);
              const multiDayHeight = laneCount * 22;

              return (
                <div key={weekIndex} className="grid grid-cols-7 border-b border-border/30 last:border-b-0">
                  {weekDays.map((day, colIndex) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);
                    const singleEvents = layout.singleDayByCol[colIndex] || [];

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "relative min-h-[90px] p-1.5 text-left transition-all border-r border-border/20 last:border-r-0 group/day",
                          isSelected && "bg-module-trade/5",
                          !isCurrentMonth && "bg-muted/10"
                        )}
                      >
                        {/* Day number */}
                        <span className={cn(
                          "inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium",
                          isCurrentDay && "bg-foreground text-background font-semibold",
                          !isCurrentDay && isCurrentMonth && "text-foreground/80",
                          !isCurrentDay && !isCurrentMonth && "text-muted-foreground/40",
                          isSelected && !isCurrentDay && "text-module-trade font-semibold"
                        )}>
                          {day.getDate() === 1
                            ? format(day, "d MMM", { locale: ptBR })
                            : day.getDate()}
                        </span>

                        {/* Multi-day bars */}
                        {colIndex === 0 && layout.lanes.length > 0 && (
                          <div className="absolute left-0 right-0 pointer-events-none" style={{ top: 28 }}>
                            {layout.lanes.slice(0, MAX_EVENT_ROWS).map((segments, laneIndex) =>
                              segments.map(segment => {
                                const leftPct = (segment.startCol / 7) * 100;
                                const widthPct = (segment.span / 7) * 100;
                                return (
                                  <div
                                    key={`${segment.event.id}-${laneIndex}`}
                                    className="absolute pointer-events-auto"
                                    style={{
                                      top: laneIndex * 22,
                                      left: `calc(${leftPct}% + 2px)`,
                                      width: `calc(${widthPct}% - 4px)`,
                                      height: 18,
                                    }}
                                  >
                                    <HoverCard openDelay={300} closeDelay={100}>
                                      <HoverCardTrigger asChild>
                                        <div
                                          className={cn(
                                            "h-full flex items-center gap-1 px-1.5 text-[10px] font-medium truncate cursor-pointer hover:brightness-110",
                                            segment.isStart ? "rounded-l-sm" : "",
                                            segment.isEnd ? "rounded-r-sm" : "",
                                          )}
                                          style={{
                                            backgroundColor: `${segment.event.color}25`,
                                            color: segment.event.color,
                                            borderLeft: segment.isStart ? `2px solid ${segment.event.color}` : undefined,
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {segment.isStart && <span className="truncate">{segment.event.title}</span>}
                                          {!segment.isStart && <span className="truncate opacity-60">{segment.event.title}</span>}
                                        </div>
                                      </HoverCardTrigger>
                                      <HoverCardContent side="right" className="w-56 p-3">
                                        <div className="space-y-2">
                                          <p className="font-medium text-sm">{segment.event.title}</p>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Badge variant="outline" className="text-[9px]">{getTypeLabel(segment.event.type)}</Badge>
                                            {segment.event.supplier && <span>{segment.event.supplier}</span>}
                                          </div>
                                        </div>
                                      </HoverCardContent>
                                    </HoverCard>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}

                        {/* Single-day events */}
                        <div className="space-y-0.5" style={{ marginTop: multiDayHeight + 2 }}>
                          {singleEvents.slice(0, Math.max(0, MAX_EVENT_ROWS - laneCount + 1)).map(event => {
                            const Icon = getEventIcon(event.type);
                            return (
                              <HoverCard key={event.id} openDelay={300} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <div
                                    className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:brightness-110"
                                    style={{
                                      backgroundColor: `${event.color}20`,
                                      color: event.color,
                                      borderLeft: `2px solid ${event.color}`,
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span className="truncate">{event.title}</span>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" className="w-56 p-3">
                                  <div className="space-y-2">
                                    <p className="font-medium text-sm">{event.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Badge variant="outline" className="text-[9px]">{getTypeLabel(event.type)}</Badge>
                                      {event.supplier && <span>{event.supplier}</span>}
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            );
                          })}
                          {singleEvents.length > Math.max(0, MAX_EVENT_ROWS - laneCount + 1) && (
                            <span className="text-[9px] text-muted-foreground">
                              +{singleEvents.length - Math.max(0, MAX_EVENT_ROWS - laneCount + 1)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected date events */}
          {selectedDate && (
            <Card className="card-base">
              <CardHeader className="p-3 pb-2 border-b border-border/50">
                <CardTitle className="text-sm font-medium">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {selectedEvents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEvents.map(event => {
                      const Icon = getEventIcon(event.type);
                      return (
                        <div 
                          key={event.id} 
                          className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${event.color}20` }}>
                            <Icon className="h-4 w-4" style={{ color: event.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{event.title}</p>
                            <p className="text-[10px] text-muted-foreground">{event.supplier}</p>
                          </div>
                          <Badge variant="outline" className="text-[9px] shrink-0">{getTypeLabel(event.type)}</Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Sem eventos neste dia</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          <Card className="card-base">
            <CardHeader className="p-3 pb-2 border-b border-border/50">
              <CardTitle className="text-sm font-medium">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-[10px] text-muted-foreground">Início Pacote</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                  <span className="text-[10px] text-muted-foreground">Fim Pacote</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-[10px] text-muted-foreground">Prazo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
                  <span className="text-[10px] text-muted-foreground">Comprovação</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
