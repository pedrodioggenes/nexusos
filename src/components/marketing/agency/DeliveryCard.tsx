import { Clock, AlertTriangle, FileImage, RotateCcw } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  type AgencyDelivery, 
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS 
} from '@/hooks/useAgencyDeliveries';

interface DeliveryCardProps {
  delivery: AgencyDelivery;
  onClick?: () => void;
  onStatusChange?: (status: AgencyDelivery['status']) => void;
}

export function DeliveryCard({ delivery, onClick, onStatusChange }: DeliveryCardProps) {
  const isOverdue = delivery.deadline && isPast(new Date(delivery.deadline)) && 
    !['approved', 'rejected'].includes(delivery.status);
  
  const daysRemaining = delivery.deadline 
    ? differenceInDays(new Date(delivery.deadline), new Date())
    : null;

  const revisionProgress = (delivery.revision_count / delivery.max_revisions) * 100;
  const isNearRevisionLimit = delivery.revision_count >= delivery.max_revisions - 1;

  return (
    <div
      className={cn(
        "p-3 rounded-lg bg-card/80 border transition-all cursor-pointer hover:shadow-md",
        isOverdue ? "border-red-500/50" : "border-border/50 hover:border-app-gestao/50"
      )}
      onClick={onClick}
    >
      {/* Title & Type */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm text-foreground truncate">
            {delivery.title}
          </h4>
          <p className="text-xs text-muted-foreground">{delivery.type}</p>
        </div>
        <Badge className={cn("text-[10px] shrink-0", DELIVERY_STATUS_COLORS[delivery.status])}>
          {DELIVERY_STATUS_LABELS[delivery.status]}
        </Badge>
      </div>

      {/* Deadline */}
      {delivery.deadline && (
        <div className={cn(
          "flex items-center gap-1 text-xs mb-2",
          isOverdue ? "text-red-400" : daysRemaining && daysRemaining <= 2 ? "text-amber-400" : "text-muted-foreground"
        )}>
          {isOverdue ? (
            <AlertTriangle className="w-3 h-3" />
          ) : (
            <Clock className="w-3 h-3" />
          )}
          <span>
            {isOverdue 
              ? `Atrasado ${Math.abs(daysRemaining || 0)} dias`
              : daysRemaining === 0 
                ? 'Vence hoje'
                : daysRemaining === 1
                  ? 'Vence amanhã'
                  : `${daysRemaining} dias restantes`
            }
          </span>
        </div>
      )}

      {/* Revision Counter */}
      {delivery.revision_count > 0 && (
        <div className="space-y-1">
          <div className={cn(
            "flex items-center gap-1 text-xs",
            isNearRevisionLimit ? "text-amber-400" : "text-muted-foreground"
          )}>
            <RotateCcw className="w-3 h-3" />
            <span>
              {delivery.revision_count}/{delivery.max_revisions} revisões
            </span>
          </div>
          <Progress 
            value={revisionProgress} 
            className={cn(
              "h-1",
              isNearRevisionLimit && "[&>div]:bg-amber-500"
            )}
          />
        </div>
      )}

      {/* Files indicator */}
      {delivery.files.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
          <FileImage className="w-3 h-3" />
          <span>{delivery.files.length} arquivo(s)</span>
        </div>
      )}
    </div>
  );
}
