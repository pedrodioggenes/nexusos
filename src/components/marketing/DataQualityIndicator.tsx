import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle2,
  Activity,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMetricDataQuality } from '@/hooks/useMetricsCatalog';

export function DataQualityIndicator({ className }: { className?: string }) {
  const { data: quality, isLoading } = useMetricDataQuality();

  if (isLoading || !quality) return null;

  const { healthScore, missingCount, outlierCount, inconsistentCount } = quality;

  return (
    <Card className={cn('border-border/50', className)}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Health score */}
          <div className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
            healthScore >= 80 && 'bg-green-500/10 text-green-500',
            healthScore >= 50 && healthScore < 80 && 'bg-yellow-500/10 text-yellow-500',
            healthScore < 50 && 'bg-destructive/10 text-destructive',
          )}>
            {healthScore}%
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">Saúde dos Dados</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {missingCount > 0 && (
                <Badge variant="outline" className="text-[9px] bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                  {missingCount} faltando
                </Badge>
              )}
              {outlierCount > 0 && (
                <Badge variant="outline" className="text-[9px] bg-orange-500/10 text-orange-600 border-orange-500/20">
                  <TrendingDown className="h-2.5 w-2.5 mr-1" />
                  {outlierCount} outlier{outlierCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {inconsistentCount > 0 && (
                <Badge variant="outline" className="text-[9px] bg-destructive/10 text-destructive border-destructive/20">
                  <Activity className="h-2.5 w-2.5 mr-1" />
                  {inconsistentCount} inconsistente{inconsistentCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {missingCount === 0 && outlierCount === 0 && inconsistentCount === 0 && (
                <Badge variant="outline" className="text-[9px] bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                  Dados completos
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
