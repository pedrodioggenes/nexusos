import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { CalendarEvent } from '@/hooks/useUnifiedCalendarEvents';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface DayDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  events: CalendarEvent[];
  onNewAction: () => void;
  onEditAction: (event: CalendarEvent) => void;
  onDeleteAction: (eventId: string) => void;
}

export function DayDetailSheet({ open, onOpenChange, selectedDate, events, onNewAction, onEditAction, onDeleteAction }: DayDetailSheetProps) {
  if (!selectedDate) return null;

  const day = selectedDate.getDate();
  const month = MONTHS[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();
  const weekDay = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(selectedDate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left">
            <span className="text-2xl font-bold">{day}</span>
            <span className="text-muted-foreground text-sm ml-2">{weekDay}, {month} {year}</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              {events.length > 0 ? `${events.length} Evento(s)` : 'Nenhum evento'}
            </h3>
            <Button size="sm" onClick={onNewAction} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Nova Ação
            </Button>
          </div>

          <div className="space-y-3">
            {events.map((event) => {
              const SourceIcon = event.sourceIcon;
              return (
                <div key={event.id} className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-1 rounded shrink-0 mt-0.5" style={{ backgroundColor: `${event.color}20` }}>
                        <SourceIcon className="h-3.5 w-3.5" style={{ color: event.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{event.sourceLabel}</span>
                          <span className="text-[10px] text-muted-foreground">{event.status}</span>
                        </div>
                        {event.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{event.description}</p>}
                        {event.responsible && <p className="text-[10px] text-muted-foreground mt-1">Responsável: {event.responsible}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditAction(event)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {event.source === 'marketing_plan' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteAction(event.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {events.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma ação planejada para este dia.</p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={onNewAction}>
                  <Plus className="h-3.5 w-3.5" />
                  Criar Ação
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
