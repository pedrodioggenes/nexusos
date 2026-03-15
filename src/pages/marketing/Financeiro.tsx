import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Search, Filter, PiggyBank, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { FinancialCharts } from '@/components/marketing/FinancialCharts';
import { TransactionsList } from '@/components/marketing/TransactionsList';
import { RegisterTransactionDialog } from '@/components/marketing/RegisterTransactionDialog';
import { SUBCATEGORY_MAP } from '@/components/marketing/RegisterTransactionDialog';
import { BudgetVariancePanel } from '@/components/marketing/BudgetVariancePanel';
import { useFinancialTransactions, useFinancialSummary, type FinancialFilters } from '@/hooks/useFinancialTransactions';
import { useMarketingBudgets } from '@/hooks/useMarketingBudgets';
import { BlurFade } from '@/components/ui/blur-fade';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PeriodFilter as GlobalPeriodFilter, usePeriodFilter } from '@/components/ui/period-filter';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);

export default function Financeiro() {
  const { tenant } = useAuth();
  const currentYear = new Date().getFullYear();

  // Global period filter
  const { period, setPeriod, getDateRange, customRange, setCustomRange, periodShortLabel } = usePeriodFilter('year');

  // Other filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('transacoes');
  const [expandedReportCats, setExpandedReportCats] = useState<Set<string>>(new Set());

  // Dialogs
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<'receita' | 'custo'>('custo');
  const [editTransaction, setEditTransaction] = useState<import('@/hooks/useFinancialTransactions').FinancialTransaction | null>(null);

  const periodDates = useMemo(() => {
    const range = getDateRange();
    return {
      from: format(range.start, 'yyyy-MM-dd'),
      to: format(range.end, 'yyyy-MM-dd'),
    };
  }, [period, customRange]);

  const filters: FinancialFilters = {
    dateFrom: periodDates.from,
    dateTo: periodDates.to,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    search: searchQuery || undefined,
  };

  const { data: transactions = [], isLoading } = useFinancialTransactions(filters);
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary(periodDates.from, periodDates.to);
  const { data: budget } = useMarketingBudgets(currentYear);

  // Available subcategories based on selected category filter
  const availableSubcategories = useMemo(() => {
    if (categoryFilter === 'all') return [];
    return SUBCATEGORY_MAP[categoryFilter] || [];
  }, [categoryFilter]);

  // Filter transactions further by subcategory (client-side)
  const filteredTransactions = useMemo(() => {
    if (subcategoryFilter === 'all') return transactions;
    return transactions.filter(t => t.subcategory === subcategoryFilter);
  }, [transactions, subcategoryFilter]);

  // Unique categories from transactions for filter
  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const budgetRemaining = budget ? budget.total_budget - (summary?.totalCusto || 0) : null;

  const openDialog = (type: 'receita' | 'custo') => {
    setEditTransaction(null);
    setDefaultType(type);
    setTransactionOpen(true);
  };

  const openEditDialog = (transaction: import('@/hooks/useFinancialTransactions').FinancialTransaction) => {
    setEditTransaction(transaction);
    setDefaultType(transaction.type as 'receita' | 'custo');
    setTransactionOpen(true);
  };

  return (
    <PageWrapper
      title="Financeiro"
      subtitle={`Gestão financeira do marketing • ${periodShortLabel}`}
      icon={<DollarSign className="h-5 w-5 text-app-gestao" />}
    >

        {/* Metric Cards */}
        <BlurFade delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <PremiumGlassCard delay={0.1} hasShimmer>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Receita Total</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(summary?.totalReceita || 0)}</p>
              {summary?.receitaTrend !== 0 && (
                <span className={cn('text-[11px] font-medium', (summary?.receitaTrend || 0) >= 0 ? 'text-success' : 'text-destructive')}>
                  {(summary?.receitaTrend || 0) >= 0 ? '+' : ''}{summary?.receitaTrend || 0}% vs mês anterior
                </span>
              )}
            </PremiumGlassCard>

            <PremiumGlassCard delay={0.15} hasShimmer>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Custos Totais</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(summary?.totalCusto || 0)}</p>
              {summary?.custoTrend !== 0 && (
                <span className={cn('text-[11px] font-medium', (summary?.custoTrend || 0) <= 0 ? 'text-success' : 'text-destructive')}>
                  {(summary?.custoTrend || 0) >= 0 ? '+' : ''}{summary?.custoTrend || 0}% vs mês anterior
                </span>
              )}
            </PremiumGlassCard>

            <PremiumGlassCard delay={0.2} hasShimmer>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'h-8 w-8 rounded-lg flex items-center justify-center',
                  (summary?.saldo || 0) >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                )}>
                  <DollarSign className={cn('h-4 w-4', (summary?.saldo || 0) >= 0 ? 'text-success' : 'text-destructive')} />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Saldo</span>
              </div>
              <p className={cn('text-2xl font-bold', (summary?.saldo || 0) >= 0 ? 'text-success' : 'text-destructive')}>
                {formatCurrency(summary?.saldo || 0)}
              </p>
              <span className="text-[11px] text-muted-foreground">Receita - Custos</span>
            </PremiumGlassCard>

            <PremiumGlassCard delay={0.25} hasShimmer>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-app-gestao/10 flex items-center justify-center">
                   <Wallet className="h-4 w-4 text-app-gestao" />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Orçamento</span>
              </div>
              {budget ? (
                <>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(budgetRemaining || 0)}</p>
                  <span className="text-[11px] text-muted-foreground">
                    Disponível de {formatCurrency(budget.total_budget)}
                  </span>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-muted-foreground">Não configurado</p>
                  <span className="text-[11px] text-muted-foreground">Configure na aba Orçamentos</span>
                </>
              )}
            </PremiumGlassCard>
          </div>
        </BlurFade>

        {/* Actions + Filters Bar */}
        <BlurFade delay={0.1}>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => openDialog('receita')}
                className="bg-success hover:bg-success/90 text-white gap-1.5 text-sm"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Receita
              </Button>
              <Button
                onClick={() => openDialog('custo')}
                variant="destructive"
                className="gap-1.5 text-sm"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Custo
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <GlobalPeriodFilter
                value={period}
                onChange={setPeriod}
                options={['month', 'quarter', 'semester', 'year', 'all', 'custom']}
                customRange={customRange}
                onCustomRangeChange={setCustomRange}
              />

              <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setSubcategoryFilter('all'); }}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {allCategories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {availableSubcategories.length > 0 && (
                <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
                  <SelectTrigger className="w-[150px] h-8 text-xs">
                    <SelectValue placeholder="Subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas subcategorias</SelectItem>
                    {availableSubcategories.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-8 h-8 text-xs w-[160px]"
                />
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Charts */}
        <BlurFade delay={0.15}>
          <FinancialCharts summary={summary} isLoading={summaryLoading} />
        </BlurFade>

        {/* Tabs */}
        <BlurFade delay={0.2}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="transacoes">Transações</TabsTrigger>
              <TabsTrigger value="planejado" className="gap-1">
                <BarChart3 className="h-3 w-3" />
                Plan. vs Real.
              </TabsTrigger>
              <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
              <TabsTrigger value="relatorio">Relatório</TabsTrigger>
            </TabsList>

            <TabsContent value="transacoes" className="mt-4">
              <TransactionsList transactions={filteredTransactions} isLoading={isLoading} onEdit={openEditDialog} />
            </TabsContent>
            <TabsContent value="planejado" className="mt-4">
              <BudgetVariancePanel
                periodStart={periodDates.from}
                periodEnd={periodDates.to}
              />
            </TabsContent>

            <TabsContent value="orcamentos" className="mt-4">
              <div className="text-center py-12">
                {budget ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Orçamento anual de {currentYear}: <strong className="text-foreground">{formatCurrency(budget.total_budget)}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {budget.marketing_budget_categories?.length || 0} categorias configuradas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col items-center">
                    <PiggyBank className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Nenhum orçamento configurado para {currentYear}</p>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Cadastrar orçamento
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="relatorio" className="mt-4">
              <div className="space-y-4">
                {summary && summary.byCategory.length > 0 ? (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Categoria</th>
                          <th className="text-left px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Tipo</th>
                          <th className="text-right px-4 py-3 text-xs font-medium uppercase text-muted-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.byCategory
                          .sort((a, b) => b.amount - a.amount)
                          .map((item, i) => {
                            const isExpanded = expandedReportCats.has(`${item.category}-${item.type}`);
                            const subs = item.type === 'custo'
                              ? (summary.bySubcategory || []).filter(s => s.category === item.category && s.amount > 0).sort((a, b) => b.amount - a.amount)
                              : [];
                            const hasExpand = subs.length > 0;
                            return (
                              <>
                                <tr
                                  key={i}
                                  className={cn('border-t border-border', hasExpand && 'cursor-pointer hover:bg-muted/30')}
                                  onClick={() => {
                                    if (!hasExpand) return;
                                    const key = `${item.category}-${item.type}`;
                                    setExpandedReportCats(prev => {
                                      const next = new Set(prev);
                                      next.has(key) ? next.delete(key) : next.add(key);
                                      return next;
                                    });
                                  }}
                                >
                                  <td className="px-4 py-3 font-medium">
                                    <span className="flex items-center gap-1.5">
                                      {hasExpand && (isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />)}
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={cn(
                                      'text-xs font-medium px-2 py-0.5 rounded-full',
                                      item.type === 'receita' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                                    )}>
                                      {item.type === 'receita' ? 'Receita' : 'Custo'}
                                    </span>
                                  </td>
                                  <td className={cn(
                                    'px-4 py-3 text-right font-semibold',
                                    item.type === 'receita' ? 'text-success' : 'text-destructive'
                                  )}>
                                    {formatCurrency(item.amount)}
                                  </td>
                                </tr>
                                {isExpanded && subs.map((sub, si) => (
                                  <tr key={`${i}-sub-${si}`} className="border-t border-border/50 bg-muted/10">
                                    <td className="pl-10 pr-4 py-2 text-xs text-muted-foreground">{sub.subcategory}</td>
                                    <td className="px-4 py-2">
                                      <span className="text-[10px] text-muted-foreground">
                                        {((sub.amount / item.amount) * 100).toFixed(1)}%
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-right text-xs text-destructive/80">
                                      {formatCurrency(sub.amount)}
                                    </td>
                                  </tr>
                                ))}
                              </>
                            );
                          })}
                      </tbody>
                      <tfoot className="bg-secondary/30 border-t border-border">
                        <tr>
                          <td colSpan={2} className="px-4 py-3 font-semibold">Saldo Final</td>
                          <td className={cn(
                            'px-4 py-3 text-right font-bold',
                            summary.saldo >= 0 ? 'text-success' : 'text-destructive'
                          )}>
                            {formatCurrency(summary.saldo)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    Sem dados para gerar relatório
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </BlurFade>

      <RegisterTransactionDialog
        open={transactionOpen}
        onOpenChange={(open) => { setTransactionOpen(open); if (!open) setEditTransaction(null); }}
        defaultType={defaultType}
        editTransaction={editTransaction}
      />
    </PageWrapper>
  );
}
