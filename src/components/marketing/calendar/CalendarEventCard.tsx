import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Pencil, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarEvent } from "@/hooks/useUnifiedCalendarEvents";

interface CalendarEventCardProps {
  event: CalendarEvent;
  variant?: "compact" | "full" | "inline";
  isDragging?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onDuplicate?: (event: CalendarEvent) => void;
  onDragStart?: (e: React.DragEvent, event: CalendarEvent) => void;
  onDragEnd?: () => void;
}

const statusColors: Record<string, string> = {
  planned: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const statusLabels: Record<string, string> = {
  planned: "Planejado",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export function CalendarEventCard({
  event,
  variant = "compact",
  isDragging = false,
  onEdit,
  onDelete,
  onDuplicate,
  onDragStart,
  onDragEnd,
}: CalendarEventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const SourceIcon = event.sourceIcon;
  const color = event.color;

  if (variant === "inline") {
    return (
      <motion.div
        draggable={!!onDragStart}
        onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, event)}
        onDragEnd={onDragEnd}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "text-xs px-1.5 py-0.5 rounded truncate cursor-pointer transition-all flex items-center gap-1",
          "hover:ring-1 hover:ring-white/20",
          isDragging && "opacity-50"
        )}
        style={{ backgroundColor: `${color}30`, color, borderLeft: `2px solid ${color}` }}
      >
        <SourceIcon className="h-2.5 w-2.5 shrink-0 opacity-70" />
        <span className="truncate">{event.title}</span>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            draggable={!!onDragStart}
            onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, event)}
            onDragEnd={onDragEnd}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -1 }}
            className={cn(
              "group relative text-xs px-2 py-1 rounded-md cursor-pointer transition-all",
              "border border-transparent",
              "hover:shadow-lg hover:shadow-black/20",
              isDragging && "opacity-50 rotate-2"
            )}
            style={{ willChange: 'transform', backgroundColor: `${color}20`, borderColor: isHovered ? color : 'transparent' }}
          >
            <div className="flex items-center gap-1.5">
              {onDragStart && (
                <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab" />
              )}
              <SourceIcon className="h-2.5 w-2.5 shrink-0 opacity-70" style={{ color }} />
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="truncate font-medium" style={{ color }}>{event.title}</span>
            </div>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => onEdit?.(event)}>
            <Pencil className="h-4 w-4 mr-2" /> Editar
          </DropdownMenuItem>
          {event.source === 'marketing_plan' && (
            <>
              <DropdownMenuItem onClick={() => onDuplicate?.(event)}>
                <Copy className="h-4 w-4 mr-2" /> Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete?.(event)} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full variant
  return (
    <motion.div
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, event)}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative p-3 rounded-lg border transition-all cursor-pointer",
        "bg-card/50 backdrop-blur-sm",
        "hover:shadow-lg hover:shadow-black/10",
        isDragging && "opacity-50 rotate-1"
      )}
      style={{ willChange: 'transform', borderColor: `${color}40` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className="p-1.5 rounded-md shrink-0" style={{ backgroundColor: `${color}20` }}>
            <SourceIcon className="h-4 w-4" style={{ color }} />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-sm truncate">{event.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{event.sourceLabel}</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit?.(event)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            {event.source === 'marketing_plan' && (
              <>
                <DropdownMenuItem onClick={() => onDuplicate?.(event)}>
                  <Copy className="h-4 w-4 mr-2" /> Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete?.(event)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {event.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
      )}

      <div className="flex items-center gap-2 mt-2">
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", statusColors[event.status] || statusColors.planned)}>
          {statusLabels[event.status] || event.status}
        </span>
        {event.budget != null && event.budget > 0 && (
          <span className="text-[10px] text-muted-foreground">
            R$ {event.budget.toLocaleString('pt-BR')}
          </span>
        )}
      </div>
    </motion.div>
  );
}
