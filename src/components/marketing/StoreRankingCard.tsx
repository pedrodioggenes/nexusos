import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  MapPin,
  Trophy,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  useTopPerformingStores, 
  useBottomPerformingStores,
  type StorePerformance 
} from "@/hooks/useStorePerformance";

interface StoreRankingCardProps {
  className?: string;
  showHeader?: boolean;
  limit?: number;
  onViewAll?: () => void;
  onStoreClick?: (store: StorePerformance) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function StoreItem({ 
  store, 
  rank,
  isTop,
  onClick 
}: { 
  store: StorePerformance; 
  rank: number;
  isTop: boolean;
  onClick?: () => void;
}) {
  const roi = store.roi || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isTop ? -5 : 5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Rank */}
      <div className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        isTop && rank === 1 && "bg-yellow-500/20 text-yellow-500",
        isTop && rank === 2 && "bg-gray-400/20 text-gray-400",
        isTop && rank === 3 && "bg-orange-600/20 text-orange-600",
        isTop && rank > 3 && "bg-muted text-muted-foreground",
        !isTop && "bg-destructive/20 text-destructive"
      )}>
        {rank}
      </div>

      {/* Store Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">
          {store.unit?.name || "Loja"}
        </h4>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-2.5 w-2.5" />
          {store.unit?.city || "Cidade"}
        </div>
      </div>

      {/* ROI */}
      <div className="text-right shrink-0">
        <div className={cn(
          "flex items-center gap-1 text-sm font-semibold",
          isTop ? "text-green-500" : "text-destructive"
        )}>
          {isTop ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {roi.toFixed(0)}%
        </div>
        <span className="text-[10px] text-muted-foreground">ROI</span>
      </div>
    </motion.div>
  );
}

export function StoreRankingCard({
  className,
  showHeader = true,
  limit = 5,
  onViewAll,
  onStoreClick,
}: StoreRankingCardProps) {
  const { data: topStores = [], isLoading: topLoading } = useTopPerformingStores(limit);
  const { data: bottomStores = [], isLoading: bottomLoading } = useBottomPerformingStores(limit);

  const isLoading = topLoading || bottomLoading;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = topStores.length > 0 || bottomStores.length > 0;

  return (
    <Card className={cn("border-border/50", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-app-gestao" />
              <CardTitle className="text-sm font-medium">Ranking de Lojas</CardTitle>
            </div>
            {onViewAll && hasData && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={onViewAll}
              >
                Ver todas
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(showHeader ? "pt-0" : "p-4")}>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Sem dados de performance</p>
            <p className="text-xs text-muted-foreground">
              Registre dados de performance por loja
            </p>
          </div>
        ) : (
          <Tabs defaultValue="top" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8 mb-3">
              <TabsTrigger value="top" className="text-xs gap-1.5">
                <Trophy className="h-3 w-3" />
                Top {limit}
              </TabsTrigger>
              <TabsTrigger value="bottom" className="text-xs gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                Atenção
              </TabsTrigger>
            </TabsList>

            <TabsContent value="top" className="mt-0">
              <div className="space-y-1">
                {topStores.map((store, index) => (
                  <StoreItem
                    key={store.id}
                    store={store}
                    rank={index + 1}
                    isTop={true}
                    onClick={() => onStoreClick?.(store)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bottom" className="mt-0">
              {bottomStores.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">
                    Nenhuma loja com baixa performance
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {bottomStores.map((store, index) => (
                    <StoreItem
                      key={store.id}
                      store={store}
                      rank={index + 1}
                      isTop={false}
                      onClick={() => onStoreClick?.(store)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
