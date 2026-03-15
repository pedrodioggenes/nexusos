import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO, isAfter, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarX } from "lucide-react";
import { CalendarEvent } from "@/hooks/useUnifiedCalendarEvents";
import { CalendarEventCard } from "./CalendarEventCard";

interface CalendarAgendaViewProps {
  currentMonth: number;
  currentYear: number;
  events: CalendarEvent[];
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (event: CalendarEvent) => void;
  onEventDuplicate: (event: CalendarEvent) => void;
}

interface GroupedEvents {
  date: Date;
  dateLabel: string;
  events: CalendarEvent[];
}

export function CalendarAgendaView({ currentMonth, currentYear, events, onEventEdit, onEventDelete, onEventDuplicate }: CalendarAgendaViewProps) {
  const groupedEvents = useMemo(() => {
    const start = startOfMonth(new Date(currentYear, currentMonth));
    const end = endOfMonth(addMonths(start, 2));

    const filtered = events
      .filter(event => {
        if (!event.start_date) return false;
        const date = parseISO(event.start_date);
        return isAfter(date, start) || format(date, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd');
      })
      .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime());

    const groups: GroupedEvents[] = [];
    let currentGroup: GroupedEvents | null = null;

    filtered.forEach(event => {
      const date = parseISO(event.start_date!);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!currentGroup || format(currentGroup.date, 'yyyy-MM-dd') !== dateKey) {
        currentGroup = { date, dateLabel: format(date, "EEEE, d 'de' MMMM", { locale: ptBR }), events: [] };
        groups.push(currentGroup);
      }
      currentGroup.events.push(event);
    });

    return groups;
  }, [events, currentMonth, currentYear]);

  if (groupedEvents.length === 0) {
    return (
      <div className="bg-card/30 rounded-xl border border-border/50 p-12 text-center">
        <CalendarX className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum evento encontrado</h3>
        <p className="text-sm text-muted-foreground">Não há eventos agendados para este período.</p>
      </div>
    );
  }

  return (
    <div className="bg-card/30 rounded-xl border border-border/50 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {groupedEvents.map((group, groupIndex) => (
          <motion.div key={format(group.date, 'yyyy-MM-dd')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIndex * 0.05 }} className="border-b border-border/50 last:border-b-0">
            <div className="sticky top-0 bg-muted/50 backdrop-blur-sm px-4 py-2 border-b border-border/30">
              <h3 className="text-sm font-medium capitalize">{group.dateLabel}</h3>
            </div>
            <div className="p-3 space-y-2">
              {group.events.map((event, eventIndex) => (
                <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: eventIndex * 0.03 }}>
                  <CalendarEventCard event={event} variant="full" onEdit={onEventEdit} onDelete={onEventDelete} onDuplicate={onEventDuplicate} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
