import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, Plus, ArrowRight, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useBudgetVariance, type BudgetVarianceRow } from '@/hooks/useBudgetGovernance';
import { Empty } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);

interface BudgetVariancePanelProps {
  periodStart?: string;
  periodEnd?: string;
}

function VarianceRow({ row }: { row: BudgetVarianceRow }) {
  const isOverBudget = row.variance < 0;
  const utilizationPct = row.planned > 0 ? Math.min((row.realized / row.planned) * 100, 150) : 0;
  const navigate = useNavigate();

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-t border-border hover:bg-muted/30 transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{row.label}</span>
          <Badge variant="outline" className="text-[10px]">
            {row.type === 'category' ? 'Categoria' : 'Campanha'}
          </Badge>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-sm text-muted-foreground">
        {formatCurrency(row.planned)}
      </td>
      <td className="px-4 py-3 text-right text-sm font-medium">
        {formatCurrency(row.realized)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {isOverBudget ? (
            <TrendingUp className="h-3 w-3 text-destructive" />
          ) : row.variance > 0 ? (
            <TrendingDown className="h-3 w-3 text-success" />
          ) : (
            <Minus className="h-3 w-3 text-muted-foreground" />
          )}
          <span className={cn(
            'text-sm font-semibold',
            isOverBudget ? 'text-destructive' : row.variance > 0 ? 'text-success' : 'text-muted-foreground'
          )}>
            {formatCurrency(row.variance)}
          </span>
        </div>
        {row.planned > 0 && (
          <span className={cn(
            'text-[10px]',
            isOverBudget ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {row.variance_pct >= 0 ? '+' : ''}{row.variance_pct.toFixed(1)}%
          </span>
        )}
      </td>
      <td className="px-4 py-3 w-[120px]">
        <div className="space-y-1">
          <Progress 
            value={Math.min(utilizationPct, 100)} 
            className={cn("h-1.5", utilizationPct > 100 && "[&>div]:bg-destructive")}
          />
          <span className="text-[10px] text-muted-foreground">{utilizationPct.toFixed(0)}% utilizado</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {row.type === 'campaign' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={() => navigate('/app/marketing/campanhas')}
          >
            Ver <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </td>
    </motion.tr>
  );
}

export function BudgetVariancePanel({ periodStart, periodEnd }: BudgetVariancePanelProps) {
  const { data: variance, isLoading } = useBudgetVariance(periodStart, periodEnd);
  const [viewTab, setViewTab] = useState('category');

  const hasData = variance && (variance.byCategory.length > 0 || variance.byCampaign.length > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <Empty
        icon={<BarChart3 className="h-8 w-8" />}
        title="Sem alocações de orçamento"
        description="Cadastre alocações orçamentárias para visualizar a análise Planejado vs Realizado. Use categorias e campanhas para controlar seus investimentos."
      />
    );
  }

  const rows = viewTab === 'category' ? variance!.byCategory : variance!.byCampaign;
  const overBudgetCount = rows.filter(r => r.variance < 0).length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3.5 w-3.5 text-app-gestao" />
            <span className="text-[10px] uppercase text-muted-foreground font-medium">Planejado</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(variance!.totalPlanned)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] uppercase text-muted-foreground font-medium">Realizado</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(variance!.totalRealized)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-1">
            {variance!.totalVariance >= 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-success" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-destructive" />
            )}
            <span className="text-[10px] uppercase text-muted-foreground font-medium">Desvio</span>
          </div>
          <p className={cn('text-lg font-bold', variance!.totalVariance >= 0 ? 'text-success' : 'text-destructive')}>
            {formatCurrency(variance!.totalVariance)}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {variance!.totalVariancePct >= 0 ? '+' : ''}{variance!.totalVariancePct.toFixed(1)}%
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={cn("h-3.5 w-3.5", overBudgetCount > 0 ? "text-destructive" : "text-success")} />
            <span className="text-[10px] uppercase text-muted-foreground font-medium">Estouros</span>
          </div>
          <p className={cn('text-lg font-bold', overBudgetCount > 0 ? 'text-destructive' : 'text-success')}>
            {overBudgetCount}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {overBudgetCount > 0 ? 'itens acima do planejado' : 'tudo dentro do orçamento'}
          </span>
        </div>
      </div>

      {/* View toggle */}
      <Tabs value={viewTab} onValueChange={setViewTab}>
        <TabsList className="h-8">
          <TabsTrigger value="category" className="text-xs">Por Categoria</TabsTrigger>
          <TabsTrigger value="campaign" className="text-xs">Por Campanha</TabsTrigger>
        </TabsList>

        <TabsContent value={viewTab} className="mt-3">
          {rows.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Nenhuma alocação {viewTab === 'category' ? 'por categoria' : 'por campanha'} encontrada
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Item</th>
                    <th className="text-right px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Planejado</th>
                    <th className="text-right px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Realizado</th>
                    <th className="text-right px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Desvio</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Utilização</th>
                    <th className="px-4 py-3 text-xs"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.sort((a, b) => a.variance - b.variance).map((row) => (
                    <VarianceRow key={row.entity_id} row={row} />
                  ))}
                </tbody>
                <tfoot className="bg-secondary/30 border-t border-border">
                  <tr>
                    <td className="px-4 py-3 font-semibold">Total</td>
                    <td className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      {formatCurrency(rows.reduce((s, r) => s + r.planned, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(rows.reduce((s, r) => s + r.realized, 0))}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span className={cn(
                        rows.reduce((s, r) => s + r.variance, 0) >= 0 ? 'text-success' : 'text-destructive'
                      )}>
                        {formatCurrency(rows.reduce((s, r) => s + r.variance, 0))}
                      </span>
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
