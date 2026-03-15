import { Clock, CheckCircle, RotateCcw, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgencySLAMetrics } from '@/hooks/useAgencyPartner';

interface SLAGaugesProps {
  metrics: AgencySLAMetrics | null;
}

interface GaugeProps {
  label: string;
  value: number | null;
  target: number;
  unit?: string;
  icon: React.ElementType;
  invertColors?: boolean; // For metrics where lower is better
}

function Gauge({ label, value, target, unit = '', icon: Icon, invertColors }: GaugeProps) {
  const percentage = value !== null ? Math.min((value / target) * 100, 100) : 0;
  const displayValue = value ?? 0;
  
  // Determine status
  let status: 'success' | 'warning' | 'danger';
  if (invertColors) {
    // For metrics where lower is better (e.g., revision rounds)
    status = displayValue <= target * 0.7 ? 'success' : displayValue <= target ? 'warning' : 'danger';
  } else {
    // For metrics where higher is better (e.g., on-time rate)
    status = displayValue >= target ? 'success' : displayValue >= target * 0.8 ? 'warning' : 'danger';
  }

  const colors = {
    success: {
      bar: 'bg-emerald-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    warning: {
      bar: 'bg-amber-500',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    danger: {
      bar: 'bg-red-500',
      text: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  };

  const currentColors = colors[status];

  return (
    <div className={cn(
      "p-4 rounded-xl border border-border/50",
      currentColors.bg
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", currentColors.text)} />
          <span className="text-sm text-foreground font-medium">{label}</span>
        </div>
        {status === 'danger' && (
          <AlertTriangle className="w-4 h-4 text-red-400" />
        )}
      </div>

      {/* Value Display */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className={cn("text-2xl font-bold", currentColors.text)}>
          {displayValue.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
        <span className="text-sm text-muted-foreground ml-1">
          / {target}{unit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-background/50 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", currentColors.bar)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function SLAGauges({ metrics }: SLAGaugesProps) {
  if (!metrics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma métrica de SLA disponível</p>
        <p className="text-xs mt-1">As métricas serão calculadas automaticamente baseadas nas entregas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Gauge
        label="Tempo de Resposta"
        value={metrics.response_time_avg_hours}
        target={metrics.response_time_target_hours}
        unit="h"
        icon={Clock}
        invertColors
      />
      <Gauge
        label="Entregas no Prazo"
        value={metrics.on_time_delivery_rate}
        target={metrics.on_time_target_rate}
        unit="%"
        icon={CheckCircle}
      />
      <Gauge
        label="Rodadas de Revisão"
        value={metrics.avg_revision_rounds}
        target={metrics.max_revision_target}
        unit=""
        icon={RotateCcw}
        invertColors
      />
      <div className="p-4 rounded-xl border border-border/50 bg-card/50">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">Entregas do Período</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold text-foreground">{metrics.deliveries_count}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-400">{metrics.deliveries_approved}</p>
            <p className="text-xs text-muted-foreground">Aprovadas</p>
          </div>
          <div>
            <p className="text-xl font-bold text-red-400">{metrics.deliveries_rejected}</p>
            <p className="text-xs text-muted-foreground">Rejeitadas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
