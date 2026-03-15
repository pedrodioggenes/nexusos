import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  Plus,
  Check
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useActiveGoals, kpiTypeLabels, type MarketingGoal } from "@/hooks/useMarketingGoals";
import { GlassBentoCard, GlassBentoContent, GlassBentoHeader, GlassBentoTitle } from "@/components/ui/glass-bento";

interface GoalTrackerProps {
  className?: string;
  showHeader?: boolean;
  limit?: number;
  onAddGoal?: () => void;
  onViewAll?: () => void;
}

function formatValue(value: number, type: string): string {
  if (type === 'roi' || type === 'conversion_rate') {
    return `${value.toFixed(1)}%`;
  }
  if (type === 'cac' || type === 'ltv' || type === 'revenue' || type === 'average_ticket') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (type === 'nps') {
    return value.toString();
  }
  return new Intl.NumberFormat('pt-BR').format(value);
}

function GoalItem({ goal }: { goal: MarketingGoal }) {
  const progress = goal.target_value > 0 
    ? Math.min((goal.current_value / goal.target_value) * 100, 100) 
    : 0;
  
  const isAchieved = goal.current_value >= goal.target_value;
  const isNearTarget = progress >= 80 && !isAchieved;
  const isBehind = progress < 50;

  const baselineChange = goal.baseline_value && goal.baseline_value > 0
    ? ((goal.current_value - goal.baseline_value) / goal.baseline_value) * 100
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-3 rounded-xl border transition-colors",
        "bg-muted/30 dark:bg-muted/20 backdrop-blur-sm",
        "border-border/50 hover:bg-muted/50 dark:hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] h-4 px-1.5 bg-background/50",
                isAchieved && "border-success/50 text-success",
                isNearTarget && "border-warning/50 text-warning",
                isBehind && "border-destructive/50 text-destructive"
              )}
            >
              {kpiTypeLabels[goal.kpi_type] || goal.kpi_type}
            </Badge>
            {isAchieved && (
              <Check className="h-3.5 w-3.5 text-success" />
            )}
          </div>
          <h4 className="font-medium text-sm truncate text-foreground/90">{goal.name}</h4>
        </div>
        
        {baselineChange !== null && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            baselineChange >= 0 ? "text-success" : "text-destructive"
          )}>
            {baselineChange >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(baselineChange).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Atual: <span className="text-foreground/90 font-medium">
              {formatValue(goal.current_value, goal.kpi_type)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Meta: <span className="text-foreground/90 font-medium">
              {formatValue(goal.target_value, goal.kpi_type)}
            </span>
          </span>
        </div>

        <Progress 
          value={progress} 
          className={cn(
            "h-1.5",
            isAchieved && "[&>div]:bg-success",
            isNearTarget && "[&>div]:bg-warning",
            isBehind && "[&>div]:bg-destructive",
            !isAchieved && !isNearTarget && !isBehind && "[&>div]:bg-app-gestao"
          )}
        />

        <div className="flex items-center justify-between">
          <span className={cn(
            "text-[10px] font-medium",
            isAchieved && "text-success",
            isNearTarget && "text-warning",
            isBehind && "text-destructive",
            !isAchieved && !isNearTarget && !isBehind && "text-muted-foreground"
          )}>
            {progress.toFixed(0)}% concluído
          </span>
          <span className="text-[10px] text-muted-foreground">
            {goal.period_type === 'monthly' && 'Mensal'}
            {goal.period_type === 'quarterly' && 'Trimestral'}
            {goal.period_type === 'yearly' && 'Anual'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function GoalTracker({
  className,
  showHeader = true,
  limit = 4,
  onAddGoal,
  onViewAll,
}: GoalTrackerProps) {
  const { data: goals = [], isLoading } = useActiveGoals();
  
  const displayGoals = goals.slice(0, limit);
  const achievedCount = goals.filter(g => g.current_value >= g.target_value).length;

  if (isLoading) {
    return (
      <GlassBentoCard className={className}>
        <GlassBentoContent>
          <div className="flex items-center justify-center h-32">
            <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
          </div>
        </GlassBentoContent>
      </GlassBentoCard>
    );
  }

  return (
    <GlassBentoCard className={cn("h-full", className)} glowColor="rgba(180, 140, 100, 0.3)">
      <GlassBentoContent>
        {showHeader && (
          <GlassBentoHeader
            icon={<Target className="h-4 w-4 text-app-gestao" />}
            action={
              <div className="flex items-center gap-1">
                {onAddGoal && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onAddGoal}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onViewAll && goals.length > limit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground h-7"
                    onClick={onViewAll}
                  >
                    Ver todas
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            }
          >
            <div className="flex items-center gap-2">
              <GlassBentoTitle>Metas Ativas</GlassBentoTitle>
              {goals.length > 0 && (
                <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-background/50">
                  {achievedCount}/{goals.length}
                </Badge>
              )}
            </div>
          </GlassBentoHeader>
        )}

        {displayGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3 backdrop-blur-sm">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground/90">Nenhuma meta ativa</p>
            <p className="text-xs text-muted-foreground mb-3">
              Defina metas para acompanhar seu progresso
            </p>
            {onAddGoal && (
              <Button size="sm" onClick={onAddGoal} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Criar Meta
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayGoals.map((goal) => (
              <GoalItem key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </GlassBentoContent>
    </GlassBentoCard>
  );
}
