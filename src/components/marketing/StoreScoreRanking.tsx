import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Award } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StoreScoreGauge } from "./StoreScoreGauge";
import type { StoreScore } from "@/hooks/useStoreScore";

interface StoreScoreRankingProps {
  scores: StoreScore[];
  onStoreClick: (store: StoreScore) => void;
  className?: string;
}

export function StoreScoreRanking({ scores, onStoreClick, className }: StoreScoreRankingProps) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-module-gestao" />
          <CardTitle className="text-sm font-medium">Score por Loja</CardTitle>
          <Badge variant="outline" className="ml-auto text-[10px]">
            {scores.length} lojas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {scores.map((store, index) => (
            <motion.div
              key={store.unitId}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => onStoreClick(store)}
            >
              {/* Rank */}
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                index === 0 && "bg-yellow-500/20 text-yellow-500",
                index === 1 && "bg-gray-400/20 text-gray-400",
                index === 2 && "bg-orange-600/20 text-orange-600",
                index > 2 && "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </div>

              {/* Score gauge */}
              <StoreScoreGauge score={store.score} size="sm" />

              {/* Store info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{store.unitName}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {store.topDrivers.map((d, i) => (
                    <span
                      key={i}
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full',
                        d.positive
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-destructive/10 text-destructive'
                      )}
                    >
                      {d.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trend */}
              {store.trend !== 0 && (
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-medium shrink-0",
                  store.trend > 0 ? "text-green-500" : "text-destructive"
                )}>
                  {store.trend > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {store.trend > 0 ? '+' : ''}{store.trend}
                </div>
              )}
            </motion.div>
          ))}

          {scores.length === 0 && (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Sem dados de score disponíveis
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
