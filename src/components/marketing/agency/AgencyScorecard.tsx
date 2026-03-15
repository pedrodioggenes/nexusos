import { useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AgencyScore } from '@/hooks/useAgencyPartner';

interface AgencyScorecardProps {
  scores: AgencyScore[];
  latestScore: AgencyScore | null;
}

const DIMENSION_LABELS: Record<string, string> = {
  communication: 'Comunicação',
  quality: 'Qualidade',
  punctuality: 'Pontualidade',
  strategy: 'Estratégia',
  cost_benefit: 'Custo-Benefício',
};

export function AgencyScorecard({ scores, latestScore }: AgencyScorecardProps) {
  const radarData = useMemo(() => {
    if (!latestScore) return [];
    
    return [
      { dimension: 'Comunicação', score: latestScore.communication_score || 0, fullMark: 10 },
      { dimension: 'Qualidade', score: latestScore.quality_score || 0, fullMark: 10 },
      { dimension: 'Pontualidade', score: latestScore.punctuality_score || 0, fullMark: 10 },
      { dimension: 'Estratégia', score: latestScore.strategy_score || 0, fullMark: 10 },
      { dimension: 'Custo-Benefício', score: latestScore.cost_benefit_score || 0, fullMark: 10 },
    ];
  }, [latestScore]);

  // Calculate trend (compare last 2 months)
  const trend = useMemo(() => {
    if (scores.length < 2) return null;
    const current = scores[0]?.overall_score || 0;
    const previous = scores[1]?.overall_score || 0;
    const diff = current - previous;
    return { diff, direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable' };
  }, [scores]);

  const overallScore = latestScore?.overall_score || 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 6) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  if (!latestScore) {
    return (
      <div className="p-6 rounded-xl bg-card/50 border border-border/50 text-center">
        <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada</p>
        <p className="text-xs text-muted-foreground mt-1">Avalie a agência mensalmente para acompanhar a performance</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border/50 space-y-4">
      {/* Overall Score Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Score Geral</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-3xl font-bold", getScoreColor(overallScore))}>
              {overallScore.toFixed(1)}
            </span>
            <span className="text-muted-foreground text-sm">/10</span>
            {trend && (
              <Badge className={cn(
                "text-xs",
                trend.direction === 'up' && "bg-emerald-500/20 text-emerald-400",
                trend.direction === 'down' && "bg-red-500/20 text-red-400",
                trend.direction === 'stable' && "bg-muted text-muted-foreground"
              )}>
                {trend.direction === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                {trend.direction === 'down' && <TrendingDown className="w-3 h-3 mr-1" />}
                {trend.direction === 'stable' && <Minus className="w-3 h-3 mr-1" />}
                {trend.diff > 0 ? '+' : ''}{trend.diff.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="dimension" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 10]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="hsl(var(--app-gestao))"
              fill="hsl(var(--app-gestao))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension Breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { key: 'communication_score' as const, label: 'Comunicação', value: latestScore.communication_score },
          { key: 'quality_score' as const, label: 'Qualidade', value: latestScore.quality_score },
          { key: 'punctuality_score' as const, label: 'Pontualidade', value: latestScore.punctuality_score },
          { key: 'strategy_score' as const, label: 'Estratégia', value: latestScore.strategy_score },
          { key: 'cost_benefit_score' as const, label: 'Custo-Benefício', value: latestScore.cost_benefit_score },
        ].map(({ key, label, value }) => {
          const score = value || 0;
          return (
            <div 
              key={key}
              className={cn(
                "px-3 py-2 rounded-lg border text-center",
                getScoreBg(score)
              )}
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={cn("text-lg font-semibold", getScoreColor(score))}>
                {score}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
