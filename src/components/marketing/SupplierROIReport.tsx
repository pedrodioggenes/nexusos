import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTopSuppliersByROI } from '@/hooks/useCoopFunds';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Building2, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SupplierROIReportProps {
  className?: string;
  limit?: number;
  showChart?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function SupplierROIReport({ className, limit = 10, showChart = true }: SupplierROIReportProps) {
  const { data: suppliers, isLoading } = useTopSuppliersByROI(limit);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = suppliers?.map((s) => {
    const supplierName = s.supplier?.name || 'Fornecedor';
    return {
      name: supplierName.length > 12 ? supplierName.substring(0, 12) + '...' : supplierName,
      fullName: supplierName,
      roi: s.calculatedRoi || 0,
      amount: s.negotiated_amount || 0,
    };
  }) || [];

  const avgROI = suppliers && suppliers.length > 0
    ? suppliers.reduce((sum, s) => sum + (s.calculatedRoi || 0), 0) / suppliers.length
    : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            ROI por Fornecedor
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            Média: {avgROI.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showChart && chartData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'roi' ? `${value.toFixed(1)}%` : formatCurrency(value),
                    name === 'roi' ? 'ROI' : 'Valor'
                  ]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.roi >= 100 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-5))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <ScrollArea className="h-64">
          <div className="space-y-2">
            {suppliers?.map((supplier, index) => {
              const supplierName = supplier.supplier?.name || 'Fornecedor';
              const roi = supplier.calculatedRoi || 0;
              
              return (
                <motion.div
                  key={supplier.supplier_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                      index === 0 ? 'bg-primary/20 text-primary' :
                      index === 1 ? 'bg-muted text-muted-foreground' :
                      index === 2 ? 'bg-accent/20 text-accent-foreground' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{supplierName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(supplier.negotiated_amount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
                    roi >= 100 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-destructive/10 text-destructive'
                  )}>
                    {roi >= 100 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {roi.toFixed(1)}%
                  </div>
                </motion.div>
              );
            })}

            {(!suppliers || suppliers.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum fornecedor com verba cooperada</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
