import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  TooltipProps
} from 'recharts';
import { PremiumGlassCard } from './PremiumGlassCard';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChannelPerformance {
  channel: string;
  roi: number;
  color: string;
}

interface CampaignLevel {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface EngagementSectionProps {
  channelData: ChannelPerformance[];
  campaignLevels: CampaignLevel[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Premium Engagement Section with bar chart and levels
 * Magic UI / Aceternity UI aesthetic
 */
export function EngagementSection({ 
  channelData, 
  campaignLevels,
  isLoading,
  className 
}: EngagementSectionProps) {
  // Demo data if none provided
  const barData = channelData.length > 0 ? channelData : [
    { channel: 'Trade Marketing', roi: 85, color: '#10B981' },
    { channel: 'Digital', roi: 72, color: '#3B82F6' },
    { channel: 'PDV', roi: 68, color: '#8B5CF6' },
    { channel: 'Outro', roi: 54, color: '#F59E0B' },
  ];
  
  const levels = campaignLevels.length > 0 ? campaignLevels : [
    { name: 'Ativas', count: 12, percentage: 40, color: 'bg-emerald-500' },
    { name: 'Planejadas', count: 8, percentage: 27, color: 'bg-blue-500' },
    { name: 'Em Aprovação', count: 5, percentage: 17, color: 'bg-amber-500' },
    { name: 'Concluídas', count: 5, percentage: 16, color: 'bg-muted-foreground' },
  ];

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", className)}>
      {/* Performance by Channel - Bar Chart */}
      <PremiumGlassCard delay={0.35} className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Performance por Canal
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          ROI por canal de marketing
        </p>
        
        {isLoading ? (
          <div className="h-48">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="h-48"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={barData} 
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis 
                  type="number"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category"
                  dataKey="channel"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
                  width={110}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <Bar 
                  dataKey="roi" 
                  barSize={24}
                  radius={[0, 6, 6, 0]}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </PremiumGlassCard>
      
      {/* Campaign Levels */}
      <PremiumGlassCard delay={0.4} className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Status de Campanhas
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Distribuição por status
        </p>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {levels.map((level, index) => (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.45 + index * 0.1,
                  duration: 0.4
                }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded-full", level.color)} />
                    <span className="text-sm font-medium text-foreground">
                      {level.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {level.count}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({level.percentage}%)
                    </span>
                  </div>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                >
                  <Progress 
                    value={level.percentage} 
                    className="h-2"
                    indicatorClassName={cn("progress-animated", level.color)}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </PremiumGlassCard>
    </div>
  );
}

// Custom tooltip for bar chart
function BarTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload as ChannelPerformance;
  
  return (
    <div className="tooltip-premium">
      <p className="text-sm font-semibold text-foreground">{data.channel}</p>
      <p className="text-sm text-muted-foreground">
        ROI: <span className="font-bold text-foreground">{data.roi}%</span>
      </p>
    </div>
  );
}

export type { ChannelPerformance, CampaignLevel };
