import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Target,
  Activity,
  BarChart3,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StoreScoreGauge } from "./StoreScoreGauge";
import type { StoreScore } from "@/hooks/useStoreScore";

interface StoreDetailDrawerProps {
  store: StoreScore | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const pillarIcons = {
  execution: Target,
  consistency: Activity,
  result: BarChart3,
  adherence: Link2,
};

const pillarColors = {
  execution: 'text-blue-500',
  consistency: 'text-purple-500',
  result: 'text-green-500',
  adherence: 'text-orange-500',
};

export function StoreDetailDrawer({ store, open, onOpenChange }: StoreDetailDrawerProps) {
  if (!store) return null;

  const perf = store.performance;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-4">
            <StoreScoreGauge score={store.score} size="lg" />
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">{store.unitName}</SheetTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {store.unitCity}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {store.trend !== 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      store.trend > 0
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    )}
                  >
                    {store.trend > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {store.trend > 0 ? '+' : ''}{store.trend} pts
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Pillars */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Pilares do Score
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {store.pillars.map((pillar) => {
              const Icon = pillarIcons[pillar.key];
              const color = pillarColors[pillar.key];
              return (
                <Card key={pillar.key} className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={cn('h-4 w-4', color)} />
                      <span className="text-xs font-medium">{pillar.label}</span>
                      <span className={cn(
                        'ml-auto text-sm font-bold',
                        pillar.score >= 60 ? 'text-green-500' : pillar.score >= 30 ? 'text-yellow-500' : 'text-destructive'
                      )}>
                        {pillar.score}
                      </span>
                    </div>
                    <Progress
                      value={pillar.score}
                      className="h-1.5"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {pillar.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Drivers */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Por que esse score?
          </h3>
          <div className="space-y-2">
            {store.topDrivers.map((driver, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-2 p-2.5 rounded-lg text-sm',
                  driver.positive
                    ? 'bg-green-500/5 text-green-700 dark:text-green-400'
                    : 'bg-destructive/5 text-destructive'
                )}
              >
                {driver.positive ? (
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="font-medium">{driver.label}</span>
                <span className="text-xs opacity-70">
                  {driver.positive ? '— ponto forte' : '— precisa atenção'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance metrics */}
        {perf && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Métricas do Período
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">Investimento</p>
                <p className="text-sm font-semibold">{formatCurrency(perf.investment)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">Receita</p>
                <p className="text-sm font-semibold text-green-500">{formatCurrency(perf.revenue)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">ROI</p>
                <p className="text-sm font-semibold">{(perf.roi || 0).toFixed(0)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">Conversões</p>
                <p className="text-sm font-semibold">{perf.conversions}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">Impressões</p>
                <p className="text-sm font-semibold">{perf.impressions?.toLocaleString('pt-BR')}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground">Fluxo na Loja</p>
                <p className="text-sm font-semibold">{perf.foot_traffic?.toLocaleString('pt-BR') || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
