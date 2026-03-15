import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'accent';
}

const variantStyles = {
  default: 'border-border',
  primary: 'border-l-2 border-l-primary border-border',
  success: 'border-l-2 border-l-success border-border',
  warning: 'border-l-2 border-l-warning border-border',
  destructive: 'border-l-2 border-l-destructive border-border',
  accent: 'border-l-2 border-l-accent border-border',
};

const iconVariantStyles = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  accent: 'text-accent',
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  className,
  variant = 'default',
}: StatCardProps) {
  return (
    <div className={cn(
      'stat-card animate-fade-in',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('shrink-0', iconVariantStyles[variant])}>
            {icon}
          </div>
          <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide truncate">
            {title}
          </span>
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-0.5 text-[9px] font-medium shrink-0',
            trend >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend >= 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
      <div className="mt-1.5">
        <p className="text-lg font-condensed font-bold text-foreground leading-none">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>
        {trendLabel && (
          <span className="text-[9px] text-muted-foreground mt-0.5 block">{trendLabel}</span>
        )}
      </div>
    </div>
  );
}
