import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays, isToday, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/hooks/useUnifiedCalendarEvents";
import { CalendarEventCard } from "./CalendarEventCard";

interface CalendarWeekViewProps {
  currentMonth: number;
  currentYear: number;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDayClick: (date: Date) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (event: CalendarEvent) => void;
  onEventDuplicate: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export function CalendarWeekView({ currentMonth, currentYear, events, selectedDate, onDayClick, onEventEdit, onEventDelete, onEventDuplicate }: CalendarWeekViewProps) {
  const weekStart = useMemo(() => {
    const referenceDate = selectedDate || new Date(currentYear, currentMonth, 1);
    return startOfWeek(referenceDate, { weekStartsOn: 0 });
  }, [currentMonth, currentYear, selectedDate]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const getEventsForDay = (date: Date): CalendarEvent[] =>
    events.filter(event => event.start_date && isSameDay(parseISO(event.start_date), date));

  return (
    <div className="bg-card/30 rounded-xl border border-border/50 overflow-hidden">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50">
        <div className="py-3 text-center text-xs text-muted-foreground">Hora</div>
        {weekDays.map((date) => (
          <div key={date.toISOString()} className={cn("py-3 text-center cursor-pointer transition-colors", isToday(date) && "bg-app-gestao/10", selectedDate && isSameDay(date, selectedDate) && "bg-app-gestao/20")} onClick={() => onDayClick(date)}>
            <div className="text-xs text-muted-foreground">{format(date, "EEE", { locale: ptBR })}</div>
            <div className={cn("text-lg font-semibold mt-0.5", isToday(date) && "text-app-gestao")}>{format(date, "d")}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50">
        <div className="py-2 px-2 text-[10px] text-muted-foreground">Dia todo</div>
        {weekDays.map((date) => {
          const dayEvents = getEventsForDay(date);
          return (
            <div key={date.toISOString()} className="py-1 px-1 min-h-[50px] border-l border-border/30">
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <CalendarEventCard key={event.id} event={event} variant="inline" onEdit={onEventEdit} onDelete={onEventDelete} onDuplicate={onEventDuplicate} />
                ))}
                {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} mais</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/20">
            <div className="py-4 px-2 text-[10px] text-muted-foreground text-right pr-3">{hour.toString().padStart(2, "0")}:00</div>
            {weekDays.map((date) => (
              <motion.div key={date.toISOString()} className={cn("min-h-[50px] border-l border-border/20 hover:bg-muted/30 transition-colors cursor-pointer", isToday(date) && "bg-app-gestao/5")} onClick={() => onDayClick(date)} whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
