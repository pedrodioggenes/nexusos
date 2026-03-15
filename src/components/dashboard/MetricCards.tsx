import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight, LucideIcon } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { PremiumGlassCard } from './PremiumGlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SparklineData {
  value: number;
}

interface MetricCardData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
  sparklineData: SparklineData[];
  onClick?: () => void;
  /** Driver explanation — e.g. "Campanha X puxou o ROI" */
  driver?: string;
  /** Action CTA label — e.g. "Ver atrasadas" */
  actionLabel?: string;
  /** Action callback (defaults to onClick if not set) */
  onAction?: () => void;
}

interface MetricCardsProps {
  metrics: MetricCardData[];
  isLoading?: boolean;
  className?: string;
}

export function MetricCards({ 
  metrics, 
  isLoading,
  className 
}: MetricCardsProps) {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card-premium rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {metrics.map((metric, index) => (
        <MetricCard 
          key={metric.title} 
          {...metric} 
          delay={index * 0.1} 
        />
      ))}
    </div>
  );
}

interface MetricCardProps extends MetricCardData {
  delay?: number;
}

function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
  sparklineData,
  onClick,
  delay = 0,
  driver,
  actionLabel,
  onAction,
}: MetricCardProps) {
  const TrendIcon = changeType === 'positive' ? TrendingUp : 
                    changeType === 'negative' ? TrendingDown : null;
  
  const sparklineColor = changeType === 'positive' ? 'hsl(var(--success))' :
                         changeType === 'negative' ? 'hsl(var(--destructive))' :
                         'hsl(var(--app-gestao))';

  return (
    <PremiumGlassCard
      delay={delay}
      hasShimmer
      onClick={!actionLabel ? onClick : undefined}
      className="group"
    >
      {/* Header with icon */}
      <div className="flex items-center gap-3 mb-3">
        <div 
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br transition-transform group-hover:scale-105"
          )}
          style={{
            background: `linear-gradient(135deg, ${iconColor} 0%, ${iconColor}88 100%)`,
          }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
      </div>
      
      {/* Value */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2, duration: 0.4 }}
        className="text-2xl font-bold tracking-tight text-foreground mb-1"
      >
        {value}
      </motion.div>
      
      {/* Change indicator */}
      <div className="flex items-center gap-1.5 mb-2">
        {TrendIcon && (
          <TrendIcon 
            className={cn(
              "h-3.5 w-3.5",
              changeType === 'positive' ? "text-success" : "text-destructive"
            )} 
          />
        )}
        <span 
          className={cn(
            "text-xs font-medium",
            changeType === 'positive' ? "text-success" :
            changeType === 'negative' ? "text-destructive" :
            "text-muted-foreground"
          )}
        >
          {change}
        </span>
      </div>

      {/* Driver explanation */}
      {driver && (
        <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mb-2 leading-relaxed italic">
          {driver}
        </p>
      )}
      
      {/* Action CTA */}
      {actionLabel && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[11px] px-2 gap-1 text-muted-foreground hover:text-foreground w-full justify-between mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            (onAction || onClick)?.();
          }}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      )}

      {/* Sparkline */}
      {!actionLabel && (
        <div className="h-12 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sparkline-${title.replace(/\s/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparklineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={2}
                fill={`url(#sparkline-${title.replace(/\s/g, '-')})`}
                isAnimationActive
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </PremiumGlassCard>
  );
}

export { MetricCard };
export type { MetricCardData, SparklineData };
