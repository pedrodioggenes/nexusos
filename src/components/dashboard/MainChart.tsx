import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { PremiumGlassCard } from './PremiumGlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  name: string;
  roi: number;
  investment: number;
}

interface MainChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Premium Main Chart with dual area
 * Magic UI / Aceternity UI aesthetic
 */
export function MainChart({ 
  data, 
  isLoading,
  className 
}: MainChartProps) {
  // Demo data if none provided
  const chartData = data.length > 0 ? data : [
    { name: 'Jan', roi: 280, investment: 45000 },
    { name: 'Fev', roi: 295, investment: 52000 },
    { name: 'Mar', roi: 310, investment: 48000 },
    { name: 'Abr', roi: 305, investment: 61000 },
    { name: 'Mai', roi: 320, investment: 55000 },
    { name: 'Jun', roi: 340, investment: 67000 },
    { name: 'Jul', roi: 358, investment: 72000 },
  ];

  return (
    <PremiumGlassCard delay={0.2} className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Performance de Marketing
          </h3>
          <p className="text-sm text-muted-foreground">
            Atividade ao longo do tempo
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-app-gestao" />
            <span className="text-xs text-muted-foreground">ROI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Investimento</span>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradientROI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--app-gestao))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--app-gestao))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="chartGradientInvestment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
                opacity={0.5}
              />
              
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: 12, 
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fontSize: 12, 
                  fill: 'hsl(var(--muted-foreground))' 
                }}
                width={40}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="natural"
                dataKey="investment"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#chartGradientInvestment)"
                animationDuration={1200}
                animationEasing="ease-out"
              />
              
              <Area
                type="natural"
                dataKey="roi"
                stroke="hsl(var(--app-gestao))"
                strokeWidth={2}
                fill="url(#chartGradientROI)"
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </PremiumGlassCard>
  );
}

// Custom glassmorphic tooltip
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="tooltip-premium">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="h-2.5 w-2.5 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.dataKey === 'roi' ? 'ROI' : 'Investimento'}:
          </span>
          <span className="font-semibold text-foreground">
            {entry.dataKey === 'roi' 
              ? `${entry.value}%`
              : `R$ ${(entry.value as number)?.toLocaleString('pt-BR')}`
            }
          </span>
        </div>
      ))}
    </div>
  );
}

export type { ChartDataPoint };
