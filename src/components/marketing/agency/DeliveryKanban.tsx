import { useMemo } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  RotateCcw
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { DeliveryCard } from './DeliveryCard';
import { 
  type AgencyDelivery, 
  DELIVERY_STATUS_LABELS,
  type DeliveryStatus 
} from '@/hooks/useAgencyDeliveries';

interface DeliveryKanbanProps {
  deliveriesByStatus: Record<DeliveryStatus, AgencyDelivery[]>;
  onDeliveryClick?: (delivery: AgencyDelivery) => void;
  onStatusChange?: (deliveryId: string, newStatus: DeliveryStatus) => void;
}

const COLUMN_CONFIG: Record<DeliveryStatus, { 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
}> = {
  requested: { 
    icon: Package, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50'
  },
  in_production: { 
    icon: Clock, 
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  internal_review: { 
    icon: AlertCircle, 
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  adjustments: { 
    icon: RotateCcw, 
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10'
  },
  approved: { 
    icon: CheckCircle2, 
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  rejected: { 
    icon: XCircle, 
    color: 'text-red-400',
    bgColor: 'bg-red-500/10'
  },
};

// Only show active columns in Kanban (hide rejected)
const KANBAN_COLUMNS: DeliveryStatus[] = [
  'requested',
  'in_production',
  'internal_review',
  'adjustments',
  'approved',
];

export function DeliveryKanban({ 
  deliveriesByStatus, 
  onDeliveryClick,
  onStatusChange 
}: DeliveryKanbanProps) {
  const totalDeliveries = useMemo(() => 
    Object.values(deliveriesByStatus).flat().length,
  [deliveriesByStatus]);

  if (totalDeliveries === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma entrega registrada</p>
        <p className="text-xs mt-1">As entregas aparecerão aqui quando os briefings forem processados</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map(status => {
        const config = COLUMN_CONFIG[status];
        const Icon = config.icon;
        const deliveries = deliveriesByStatus[status];

        return (
          <div 
            key={status}
            className="flex-shrink-0 w-[280px]"
          >
            {/* Column Header */}
            <div className={cn(
              "flex items-center justify-between px-3 py-2 rounded-t-lg border-b",
              config.bgColor
            )}>
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", config.color)} />
                <span className="text-sm font-medium text-foreground">
                  {DELIVERY_STATUS_LABELS[status]}
                </span>
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                config.bgColor,
                config.color
              )}>
                {deliveries.length}
              </span>
            </div>

            {/* Column Content */}
            <ScrollArea className="h-[500px] rounded-b-lg border border-t-0 border-border/50 bg-background/50">
              <div className="p-2 space-y-2">
                {deliveries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    Nenhuma entrega
                  </div>
                ) : (
                  deliveries.map(delivery => (
                    <DeliveryCard
                      key={delivery.id}
                      delivery={delivery}
                      onClick={() => onDeliveryClick?.(delivery)}
                      onStatusChange={(newStatus) => onStatusChange?.(delivery.id, newStatus)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
