import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useBottomPerformingStores } from '@/hooks/useStorePerformance';
import { AlertTriangle, TrendingDown, Store, Lightbulb, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RegionalAlertsCardProps {
  className?: string;
  limit?: number;
  onStoreClick?: (storeId: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Generate AI suggestions based on store metrics
const getAISuggestion = (store: {
  roi: number | null;
  investment: number;
  revenue: number;
  conversions: number;
}): string => {
  const roi = store.roi || 0;
  
  if (roi < 50) {
    return 'Revisar mix de mídia e considerar pausa temporária em canais de baixa conversão';
  } else if (roi < 80) {
    return 'Aumentar investimento em trade marketing e ações de ponto de venda';
  } else if (roi < 100) {
    return 'Otimizar campanhas digitais e revisar segmentação de público';
  }
  return 'Analisar sazonalidade e ajustar calendário promocional';
};

export function RegionalAlertsCard({ className, limit = 5, onStoreClick }: RegionalAlertsCardProps) {
  const { data: stores, isLoading } = useBottomPerformingStores(limit);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const underperformingStores = stores?.filter(s => (s.roi || 0) < 100) || [];
  const criticalStores = underperformingStores.filter(s => (s.roi || 0) < 50);

  return (
    <Card className={cn('border-yellow-500/20', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Alertas Regionais
          </CardTitle>
          {underperformingStores.length > 0 && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              {underperformingStores.length} loja{underperformingStores.length !== 1 ? 's' : ''} abaixo da meta
            </Badge>
          )}
        </div>
        {criticalStores.length > 0 && (
          <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
            <AlertTriangle className="h-3 w-3" />
            {criticalStores.length} loja{criticalStores.length !== 1 ? 's' : ''} em situação crítica (ROI &lt; 50%)
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {underperformingStores.map((store, index) => {
              const isCritical = (store.roi || 0) < 50;
              const suggestion = getAISuggestion(store);

              return (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    'p-4 rounded-lg border',
                    isCritical 
                      ? 'bg-red-500/5 border-red-500/20' 
                      : 'bg-yellow-500/5 border-yellow-500/20'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Store className={cn(
                        'h-4 w-4',
                        isCritical ? 'text-red-600' : 'text-yellow-600'
                      )} />
                      <span className="font-medium text-sm">
                        {store.unit?.name || 'Loja'}
                      </span>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      isCritical 
                        ? 'bg-red-500/10 text-red-600' 
                        : 'bg-yellow-500/10 text-yellow-600'
                    )}>
                      <TrendingDown className="h-3 w-3" />
                      ROI {(store.roi || 0).toFixed(1)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-muted-foreground">Investimento</span>
                      <p className="font-medium">{formatCurrency(store.investment)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Receita</span>
                      <p className="font-medium">{formatCurrency(store.revenue)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conversões</span>
                      <p className="font-medium">{store.conversions}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded bg-background/50">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">{suggestion}</p>
                  </div>

                  {onStoreClick && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => onStoreClick(store.unit_id || '')}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Ver Detalhes da Loja
                    </Button>
                  )}
                </motion.div>
              );
            })}

            {underperformingStores.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Store className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium text-green-600">Todas as lojas dentro da meta!</p>
                <p className="text-sm">Nenhum alerta regional no momento</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
