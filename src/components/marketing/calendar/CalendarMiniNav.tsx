import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, subDays,
  isSameMonth, isToday, isSameDay, parseISO
} from "date-fns";
import { CalendarEvent } from "@/hooks/useUnifiedCalendarEvents";

interface CalendarMiniNavProps {
  currentMonth: number;
  currentYear: number;
  selectedDate: Date | null;
  events: CalendarEvent[];
  onMonthChange: (month: number, year: number) => void;
  onDateSelect: (date: Date) => void;
}

const MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const WEEKDAYS_MINI = ["D", "S", "T", "Q", "Q", "S", "S"];

export function CalendarMiniNav({ currentMonth, currentYear, selectedDate, events, onMonthChange, onDateSelect }: CalendarMiniNavProps) {
  const calendarDays = useMemo(() => {
    const start = startOfMonth(new Date(currentYear, currentMonth));
    const end = endOfMonth(new Date(currentYear, currentMonth));
    const days = eachDayOfInterval({ start, end });
    const startDayOfWeek = getDay(start);
    const paddingBefore = Array.from({ length: startDayOfWeek }, (_, i) => subDays(start, startDayOfWeek - i));
    const endDayOfWeek = getDay(end);
    const paddingAfter = Array.from({ length: 6 - endDayOfWeek }, (_, i) => addDays(end, i + 1));
    return [...paddingBefore, ...days, ...paddingAfter];
  }, [currentMonth, currentYear]);

  const hasEventsOnDay = (date: Date): boolean =>
    events.some(event => event.start_date && isSameDay(parseISO(event.start_date), date));

  const handlePreviousMonth = () => {
    if (currentMonth === 0) onMonthChange(11, currentYear - 1);
    else onMonthChange(currentMonth - 1, currentYear);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) onMonthChange(0, currentYear + 1);
    else onMonthChange(currentMonth + 1, currentYear);
  };

  return (
    <div className="bg-card/50 rounded-lg border border-border/50 p-3">
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePreviousMonth}><ChevronLeft className="h-3 w-3" /></Button>
        <span className="text-sm font-medium">{MONTHS_SHORT[currentMonth]} {currentYear}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNextMonth}><ChevronRight className="h-3 w-3" /></Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS_MINI.map((day, index) => (
          <div key={index} className="text-[10px] text-muted-foreground text-center py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((date) => {
          const isCurrentMonth = isSameMonth(date, new Date(currentYear, currentMonth));
          const today = isToday(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const hasEvents = hasEventsOnDay(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={cn(
                "relative h-6 w-6 flex items-center justify-center rounded-full text-[11px] transition-all",
                !isCurrentMonth && "text-muted-foreground/40",
                isCurrentMonth && "hover:bg-muted",
                today && "bg-module-gestao text-white font-medium",
                isSelected && !today && "ring-1 ring-module-gestao bg-module-gestao/20"
              )}
            >
              {date.getDate()}
              {hasEvents && !today && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-module-gestao" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
