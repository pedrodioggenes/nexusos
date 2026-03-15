import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/hooks/useUnifiedCalendarEvents";
import { CalendarMiniNav } from "./CalendarMiniNav";
import { CalendarStatsCard } from "./CalendarStatsCard";
import { cn } from "@/lib/utils";

interface CalendarSidebarProps {
  open: boolean;
  onToggle: () => void;
  currentMonth: number;
  currentYear: number;
  selectedDate: Date | null;
  events: CalendarEvent[];
  onMonthChange: (month: number, year: number) => void;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarSidebar({
  open, onToggle, currentMonth, currentYear, selectedDate, events, onMonthChange, onDateSelect, onEventClick,
}: CalendarSidebarProps) {
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => e.start_date && isAfter(parseISO(e.start_date), now))
      .sort((a, b) => parseISO(a.start_date!).getTime() - parseISO(b.start_date!).getTime())
      .slice(0, 8);
  }, [events]);

  return (
    <div className="relative shrink-0">
      {!open && (
        <Button variant="ghost" size="icon" className="absolute left-1 top-1 z-10 h-7 w-7 hidden lg:flex" onClick={onToggle} title="Abrir painel lateral">
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 border-r border-border/40 overflow-hidden hidden lg:block h-full"
          >
            <div className="w-[260px] h-full flex flex-col gap-3 p-3 overflow-y-auto">
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </div>

              <CalendarMiniNav
                currentMonth={currentMonth}
                currentYear={currentYear}
                selectedDate={selectedDate}
                events={events}
                onMonthChange={onMonthChange}
                onDateSelect={onDateSelect}
              />

              <CalendarStatsCard events={events} currentMonth={currentMonth} currentYear={currentYear} />

              {/* Upcoming Events */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Próximos
                </h3>
                <div className="space-y-0.5">
                  {upcomingEvents.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">Nenhum evento futuro</p>
                  )}
                  {upcomingEvents.map((event) => {
                    const SourceIcon = event.sourceIcon;
                    return (
                      <button key={event.id} onClick={() => onEventClick(event)} className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <SourceIcon className="h-3 w-3 shrink-0" style={{ color: event.color }} />
                          <span className="text-xs font-medium truncate">{event.title}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground ml-5 capitalize">
                          {format(parseISO(event.start_date!), "d MMM · EEE", { locale: ptBR })}
                          <span className="ml-1 opacity-60">· {event.sourceLabel}</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
