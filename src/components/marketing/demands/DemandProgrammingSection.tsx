import { useMemo, useState, useCallback } from "react";
import {
  format,
  getDay,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, ChevronLeft, ChevronRight, GripVertical, X } from "lucide-react";
import { PremiumGlassCard } from "@/components/dashboard/PremiumGlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Type colors ─────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  post_instagram: "#E1306C",
  post_facebook: "#1877F2",
  post_tiktok: "#000000",
  story: "#833AB4",
  reel: "#F77737",
  video: "#FF0000",
  campanha: "#10B981",
  arte: "#8B5CF6",
  copy: "#F59E0B",
  email: "#3B82F6",
  trafego: "#EF4444",
  evento: "#EC4899",
  material: "#6366F1",
  outro: "#6B7280",
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || "#6B7280";
}

// ─── Interfaces ──────────────────────────────────────────────
export interface ProgrammedDemand {
  id: string;
  title: string;
  type: string;
  due_date: string | null;
  channels?: string[];
  status: string;
  priority: string;
}

export interface CalendarSelection {
  type: "day" | "week";
  dateStr?: string;
  weekStart?: string;
  weekEnd?: string;
}

interface DemandProgrammingSectionProps {
  demands: ProgrammedDemand[];
  onCreateDemand: (date: string, type?: string) => void;
  onDemandReschedule?: (demandId: string, newDate: string) => void;
  onDemandClick?: (demand: ProgrammedDemand) => void;
  selection?: CalendarSelection | null;
  onSelectionChange?: (selection: CalendarSelection | null) => void;
  loading?: boolean;
}

const WEEKDAYS = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
const MAX_VISIBLE = 3;

export function DemandProgrammingSection({
  demands,
  onCreateDemand,
  onDemandReschedule,
  onDemandClick,
  selection,
  onSelectionChange,
  loading = false,
}: DemandProgrammingSectionProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedDemand, setDraggedDemand] = useState<ProgrammedDemand | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDate = new Date(year, month);

  // Generate weeks with adjacent month days (Notion-style)
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
  }, [year, month]);

  // ─── Demand map by date ────────────────────────────────────
  const demandsByDate = useMemo(() => {
    const map: Record<string, ProgrammedDemand[]> = {};
    demands.forEach((d) => {
      if (d.due_date) {
        const dateStr = d.due_date.split("T")[0];
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(d);
      }
    });
    return map;
  }, [demands]);

  const monthYear = format(currentDate, "MMMM yyyy", { locale: ptBR });

  // ─── Navigation ────────────────────────────────────────────
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // ─── Selection ─────────────────────────────────────────────
  const handleDayClick = useCallback((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (selection?.type === "day" && selection.dateStr === dateStr) {
      onSelectionChange?.(null);
      setExpandedDay(null);
    } else {
      onSelectionChange?.({ type: "day", dateStr });
      setExpandedDay(dateStr);
    }
  }, [selection, onSelectionChange]);

  const isDateSelected = useCallback((dateStr: string) => {
    if (!selection) return false;
    if (selection.type === "day") return selection.dateStr === dateStr;
    if (selection.type === "week" && selection.weekStart && selection.weekEnd) {
      return dateStr >= selection.weekStart && dateStr <= selection.weekEnd;
    }
    return false;
  }, [selection]);

  // ─── Drag & Drop ───────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, demand: ProgrammedDemand) => {
    e.stopPropagation();
    setDraggedDemand(demand);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDate(dateStr);
  }, []);

  const handleDragLeave = useCallback(() => setDragOverDate(null), []);

  const handleDrop = useCallback((e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    if (draggedDemand && onDemandReschedule) {
      const currentDateStr = draggedDemand.due_date?.split("T")[0];
      if (currentDateStr !== dateStr) {
        onDemandReschedule(draggedDemand.id, dateStr);
      }
    }
    setDraggedDemand(null);
  }, [draggedDemand, onDemandReschedule]);

  const handleDragEnd = useCallback(() => {
    setDraggedDemand(null);
    setDragOverDate(null);
  }, []);

  // ─── Progress ──────────────────────────────────────────────
  const getProgress = (dayDemands: ProgrammedDemand[]) => {
    if (dayDemands.length === 0) return 0;
    const completed = dayDemands.filter(d => d.status === "completed").length;
    return Math.round((completed / dayDemands.length) * 100);
  };

  const expandedDayDemands = expandedDay ? (demandsByDate[expandedDay] || []) : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-app-gestao" />
          <h3 className="text-lg font-semibold text-foreground">Programação</h3>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-app-gestao" />
          <h3 className="text-lg font-semibold text-foreground">Programação</h3>
          {selection && (
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px]" onClick={() => { onSelectionChange?.(null); setExpandedDay(null); }}>
              <X className="h-3 w-3" />
              Limpar
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center border border-border/50 rounded-md">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-r-none" onClick={handlePrevMonth}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <button
              onClick={handleToday}
              className="min-w-[120px] text-center text-xs font-semibold capitalize hover:text-app-gestao transition-colors px-2 h-7"
            >
              {monthYear}
            </button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-l-none" onClick={handleNextMonth}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Calendar Grid (standard pattern) ─────────────────── */}
      <div className="rounded-xl border border-border/40 overflow-hidden select-none">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={cn(
                "py-1.5 text-center text-[10px] font-medium uppercase tracking-wider",
                i === 0 || i === 6 ? "text-muted-foreground/50" : "text-muted-foreground/70"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((weekDays, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-border/20 last:border-b-0">
            {weekDays.map((date) => {
              const isCurrentMonth = isSameMonth(date, monthDate);
              const today = isToday(date);
              const dateStr = format(date, "yyyy-MM-dd");
              const isHovered = hoveredDay === dateStr;
              const isSelected = isDateSelected(dateStr);
              const isDropTarget = dragOverDate === dateStr;
              const dayDemands = demandsByDate[dateStr] || [];
              const progress = getProgress(dayDemands);

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "relative min-h-[80px] border-r border-border/15 last:border-r-0 transition-colors cursor-pointer group/day",
                    !isCurrentMonth && "bg-muted/5",
                    isSelected && "bg-primary/5",
                    isDropTarget && "bg-primary/10 ring-1 ring-inset ring-primary/40",
                    today && "bg-primary/[0.02]"
                  )}
                  onClick={() => handleDayClick(date)}
                  onDragOver={(e) => handleDragOver(e, dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, dateStr)}
                  onMouseEnter={() => setHoveredDay(dateStr)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Day number — Notion style */}
                  <div className="flex items-center justify-between px-1.5 pt-1 pb-0.5">
                    <span
                      className={cn(
                        "text-xs h-6 w-6 flex items-center justify-center rounded-full transition-colors",
                        today && "bg-foreground text-background font-bold",
                        !today && isCurrentMonth && "text-foreground/80",
                        !today && !isCurrentMonth && "text-muted-foreground/30"
                      )}
                    >
                      {date.getDate() === 1
                        ? format(date, "d MMM", { locale: ptBR })
                        : date.getDate()}
                    </span>

                    {/* Count badge + hover add button */}
                    <div className="flex items-center gap-0.5">
                      {dayDemands.length > 0 && (
                        <Badge variant="secondary" className="text-[8px] px-1 h-4 leading-none">
                          {dayDemands.length}
                        </Badge>
                      )}
                      <button
                        className={cn(
                          "h-5 w-5 rounded flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-all",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateDemand(dateStr);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Demand chips — standard colored style */}
                  <div className="px-1 space-y-0.5 pb-1">
                    {dayDemands.slice(0, MAX_VISIBLE).map((demand) => {
                      const color = getTypeColor(demand.type);
                      return (
                        <div
                          key={demand.id}
                          draggable={!!onDemandReschedule}
                          onDragStart={(e) => handleDragStart(e, demand)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDemandClick?.(demand);
                          }}
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer transition-all hover:brightness-110",
                            draggedDemand?.id === demand.id && "opacity-40",
                            demand.priority === "urgent" && "ring-1 ring-destructive/30"
                          )}
                          style={{
                            backgroundColor: `${color}25`,
                            color: color,
                            borderLeft: `3px solid ${color}`,
                          }}
                        >
                          {onDemandReschedule && (
                            <GripVertical className="h-2.5 w-2.5 shrink-0 opacity-30 cursor-grab" />
                          )}
                          <span className="truncate">{demand.title}</span>
                        </div>
                      );
                    })}
                    {dayDemands.length > MAX_VISIBLE && (
                      <span className="text-[9px] text-muted-foreground px-1">
                        +{dayDemands.length - MAX_VISIBLE} mais
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {dayDemands.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted/30">
                      <div
                        className="h-full bg-emerald-500/60 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ─── Expanded Day Detail Panel ────────────────────────── */}
      {expandedDay && expandedDayDemands.length > 0 && (
        <PremiumGlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-app-gestao" />
              <h4 className="text-sm font-semibold text-foreground capitalize">
                {format(new Date(expandedDay + "T12:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h4>
              <Badge variant="secondary" className="text-[10px]">
                {expandedDayDemands.length} demanda{expandedDayDemands.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => onCreateDemand(expandedDay)}>
                <Plus className="h-3 w-3" />
                Criar
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpandedDay(null)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {expandedDayDemands.map((demand) => {
              const color = getTypeColor(demand.type);
              return (
                <div
                  key={demand.id}
                  onClick={() => onDemandClick?.(demand)}
                  className="p-3 rounded-lg bg-muted/30 border border-border/40 hover:bg-accent/30 transition-colors cursor-pointer space-y-1.5"
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-foreground line-clamp-2">{demand.title}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4">{demand.type}</Badge>
                    {demand.priority !== "normal" && (
                      <Badge variant="destructive" className="text-[9px] py-0 px-1.5 h-4">{demand.priority}</Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] py-0 px-1.5 h-4",
                        demand.status === "completed" && "border-emerald-500/50 text-emerald-600"
                      )}
                    >
                      {demand.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </PremiumGlassCard>
      )}

      {/* ─── Legend ────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 text-[9px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <div className="h-1 w-6 rounded bg-emerald-500/60" /> Progresso
        </span>
        {onDemandReschedule && (
          <span className="flex items-center gap-1">
            <GripVertical className="h-3 w-3" /> Arraste para reagendar
          </span>
        )}
      </div>
    </div>
  );
}
