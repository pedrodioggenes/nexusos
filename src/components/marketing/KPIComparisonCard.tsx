import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ComparisonData {
  label: string;
  current: number;
  previous: number;
  format?: 'currency' | 'percent' | 'number';
}

interface KPIComparisonCardProps {
  title: string;
  period: 'mom' | 'yoy';
  data: ComparisonData[];
  className?: string;
}

const formatValue = (value: number, format?: string): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return new Intl.NumberFormat('pt-BR').format(value);
  }
};

const getChangePercent = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export function KPIComparisonCard({ title, period, data, className }: KPIComparisonCardProps) {
  const periodLabel = period === 'mom' ? 'vs Mês Anterior' : 'vs Ano Anterior';
  const periodIcon = period === 'mom' ? 'M' : 'A';

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            <Calendar className="h-3 w-3" />
            {periodLabel}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item, index) => {
          const change = getChangePercent(item.current, item.previous);
          const isPositive = change > 0;
          const isNeutral = Math.abs(change) < 0.5;
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold">{formatValue(item.current, item.format)}</p>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  isNeutral 
                    ? 'bg-muted text-muted-foreground'
                    : isPositive 
                      ? 'bg-green-500/10 text-green-600' 
                      : 'bg-red-500/10 text-red-600'
                )}>
                  {isNeutral ? (
                    <Minus className="h-3 w-3" />
                  ) : isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isNeutral ? '0%' : `${isPositive ? '+' : ''}${change.toFixed(1)}%`}
                </div>
                <span className="text-xs text-muted-foreground">
                  Anterior: {formatValue(item.previous, item.format)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
