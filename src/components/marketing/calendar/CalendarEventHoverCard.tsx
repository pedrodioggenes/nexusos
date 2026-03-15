import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Copy, Trash2, User, DollarSign } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { CalendarEvent, CAMPAIGN_TYPE_COLORS, CAMPAIGN_TYPE_LABELS } from "@/hooks/useUnifiedCalendarEvents";
import { cn } from "@/lib/utils";

interface CalendarEventHoverCardProps {
  event: CalendarEvent;
  children: React.ReactNode;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onDuplicate: (event: CalendarEvent) => void;
}

const statusLabels: Record<string, string> = {
  planned: "Planejado",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
  draft: "Rascunho",
  active: "Ativo",
  paused: "Pausado",
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  review: "Em Revisão",
  blocked: "Bloqueado",
};

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-amber-500/20 text-amber-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  cancelled: "bg-destructive/20 text-destructive",
  draft: "bg-muted text-muted-foreground",
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  pending: "bg-blue-500/20 text-blue-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-destructive/20 text-destructive",
  review: "bg-amber-500/20 text-amber-400",
  blocked: "bg-destructive/20 text-destructive",
};

export function CalendarEventHoverCard({ event, children, onEdit, onDelete, onDuplicate }: CalendarEventHoverCardProps) {
  const SourceIcon = event.sourceIcon;
  const color = event.color;

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-72 p-0 overflow-hidden">
        {/* Color bar */}
        <div className="h-1.5" style={{ backgroundColor: color }} />

        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-md shrink-0" style={{ backgroundColor: `${color}20` }}>
              <SourceIcon className="h-4 w-4" style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">{event.sourceLabel}</p>
                {event.source === 'campaign' && CAMPAIGN_TYPE_COLORS[event.type] && (
                  <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: CAMPAIGN_TYPE_COLORS[event.type] }}>
                    <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: CAMPAIGN_TYPE_COLORS[event.type] }} />
                    {CAMPAIGN_TYPE_LABELS[event.type] || event.type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && typeof event.description === 'string' && !event.description.startsWith('{') && !event.description.startsWith('[') && (
            <p className="text-xs text-muted-foreground line-clamp-3">{event.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full", statusColors[event.status] || statusColors.planned)}>
              {statusLabels[event.status] || event.status}
            </span>

            {event.start_date && (
              <span className="text-[10px] text-muted-foreground">
                {format(parseISO(event.start_date), "d MMM", { locale: ptBR })}
                {event.end_date && event.end_date !== event.start_date && (
                  <> – {format(parseISO(event.end_date), "d MMM", { locale: ptBR })}</>
                )}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-1">
            {event.responsible && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {event.responsible}
              </div>
            )}
            {event.budget != null && event.budget > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                R$ {event.budget.toLocaleString("pt-BR")}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-1 border-t border-border/50">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1" onClick={() => onEdit(event)}>
              <Pencil className="h-3 w-3" /> Editar
            </Button>
            {event.source === 'marketing_plan' && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1" onClick={() => onDuplicate(event)}>
                <Copy className="h-3 w-3" /> Duplicar
              </Button>
            )}
            {event.source === 'marketing_plan' && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => onDelete(event)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
