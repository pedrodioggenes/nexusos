import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStorePerformanceStats, StorePerformance } from '@/hooks/useStorePerformance';
import { TrendingUp, TrendingDown, Minus, Store, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface StoreComparisonCardProps {
  store: StorePerformance | null;
  className?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

interface ComparisonMetric {
  label: string;
  storeValue: number;
  networkAvg: number;
  format: 'currency' | 'percent' | 'number';
}

export function StoreComparisonCard({ store, className }: StoreComparisonCardProps) {
  const { data: stats, isLoading } = useStorePerformanceStats();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!store || !stats) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Store className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Selecione uma loja para comparar</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate network averages
  const networkAvgROI = stats.averageRoi;
  const networkAvgInvestment = stats.storeCount > 0 ? stats.totalInvestment / stats.storeCount : 0;
  const networkAvgRevenue = stats.storeCount > 0 ? stats.totalRevenue / stats.storeCount : 0;
  const networkAvgConversions = stats.storeCount > 0 ? stats.totalConversions / stats.storeCount : 0;

  const metrics: ComparisonMetric[] = [
    { label: 'ROI', storeValue: store.roi || 0, networkAvg: networkAvgROI, format: 'percent' },
    { label: 'Investimento', storeValue: store.investment, networkAvg: networkAvgInvestment, format: 'currency' },
    { label: 'Receita', storeValue: store.revenue, networkAvg: networkAvgRevenue, format: 'currency' },
    { label: 'Conversões', storeValue: store.conversions, networkAvg: networkAvgConversions, format: 'number' },
  ];

  const chartData = metrics.map((m) => ({
    name: m.label,
    loja: m.storeValue,
    rede: m.networkAvg,
    format: m.format,
  }));

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return formatNumber(value);
    }
  };

  const getDiff = (storeValue: number, networkAvg: number): number => {
    if (networkAvg === 0) return storeValue > 0 ? 100 : 0;
    return ((storeValue - networkAvg) / networkAvg) * 100;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparativo vs Rede
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {store.unit?.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip 
                formatter={(value: number, name: string, props: { payload?: { format?: string } }) => [
                  formatValue(value, props.payload?.format || 'number'),
                  name === 'loja' ? 'Loja' : 'Média Rede'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                formatter={(value) => value === 'loja' ? 'Loja' : 'Média Rede'}
              />
              <Bar dataKey="loja" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rede" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics Detail */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => {
            const diff = getDiff(metric.storeValue, metric.networkAvg);
            const isPositive = diff > 0;
            const isNeutral = Math.abs(diff) < 5;

            return (
              <div key={metric.label} className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                <p className="font-semibold">{formatValue(metric.storeValue, metric.format)}</p>
                <div className={cn(
                  'flex items-center gap-1 text-xs mt-1',
                  isNeutral 
                    ? 'text-muted-foreground'
                    : isPositive 
                      ? 'text-green-600' 
                      : 'text-red-600'
                )}>
                  {isNeutral ? (
                    <Minus className="h-3 w-3" />
                  ) : isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isNeutral ? 'Na média' : `${isPositive ? '+' : ''}${diff.toFixed(0)}% vs rede`}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
