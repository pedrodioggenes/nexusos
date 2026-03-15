import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Inbox,
  AlertTriangle,
  Zap,
  ArrowRight,
  History,
  Gauge,
  ClipboardList,
  FileText,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarketingBudgets } from '@/hooks/useMarketingBudgets';
import { useLatestMarketingKPI, useMarketingKPIs } from '@/hooks/useMarketingKPIs';
import { useMarketingPlans } from '@/hooks/useMarketingPlans';
import { useDemandStats } from '@/hooks/useMarketingDemands';
import { useMarketingExecutions } from '@/hooks/useMarketingExecutions';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDepartmentRole, isAgencia } from '@/hooks/useUserDepartmentRole';
import { Button } from '@/components/ui/button';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { AIInsightCard } from '@/components/marketing/AIInsightCard';
import { AlertsPanel } from '@/components/marketing/AlertsPanel';
import { GoalTracker } from '@/components/marketing/GoalTracker';
import { SocialMediaDashboardCards } from '@/components/marketing/social';
import { DriverAnalysisPanel } from '@/components/marketing/dashboard/DriverAnalysisPanel';
import { RiskBlock } from '@/components/marketing/dashboard/RiskBlock';
import { BlurFade } from '@/components/ui/blur-fade';
import {
  DashboardHeader,
  MetricCards,
  MainChart,
  PremiumActivityFeed,
  EngagementSection,
  type MetricCardData,
  type ActivityItem,
  type ChartDataPoint,
  type ChannelPerformance,
  type CampaignLevel,
} from '@/components/dashboard';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { MyDemandsView } from '@/components/marketing/demands';
import { PeriodFilter, usePeriodFilter, type PeriodOption } from '@/components/ui/period-filter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// New Dashboard 2.0 widgets
import { useDashboardSummary } from '@/hooks/marketing/useDashboardSummary';
import { TodayActionCards } from '@/components/marketing/dashboard/widgets/TodayActionCards';
import { WeekTimeline } from '@/components/marketing/dashboard/widgets/WeekTimeline';
import { ProductionPipelineByArea } from '@/components/marketing/dashboard/widgets/ProductionPipelineByArea';
import { BudgetControlWidget } from '@/components/marketing/dashboard/widgets/BudgetControlWidget';
import { CampaignHealthWidget } from '@/components/marketing/dashboard/widgets/CampaignHealthWidget';
import { QuickActionsBar } from '@/components/marketing/dashboard/widgets/QuickActionsBar';
import { RetailActionsWidget } from '@/components/marketing/dashboard/widgets/RetailActionsWidget';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const activities: ActivityItem[] = [];

export default function MarketingHome() {
  const { data: departmentRole, isLoading: loadingRole } = useUserDepartmentRole();

  if (isAgencia(departmentRole)) {
    return <AgencyDashboard />;
  }

  return <FullDashboard />;
}

// ─── Agency simplified dashboard ─────────────────────────────
function AgencyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'Usuário';

  return (
    <PageWrapper hideHeader className="min-h-full">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground">
            Olá, {displayName} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Portal da Agência — suas demandas, briefings e entregas
          </p>
        </div>

        {/* Quick access cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <BlurFade delay={0.05}>
            <PremiumGlassCard 
              className="p-5 cursor-pointer hover:ring-1 hover:ring-app-gestao/30 transition-all"
              onClick={() => navigate('/app/marketing/demandas')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-app-gestao/10">
                  <ClipboardList className="h-5 w-5 text-app-gestao" />
                </div>
                <h3 className="font-semibold text-foreground">Minhas Demandas</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Visualize e responda às demandas atribuídas a você
              </p>
            </PremiumGlassCard>
          </BlurFade>


          <BlurFade delay={0.15}>
            <PremiumGlassCard 
              className="p-5 cursor-pointer hover:ring-1 hover:ring-app-gestao/30 transition-all"
              onClick={() => navigate('/app/marketing/agencia')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Building2 className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-foreground">Entregas & SLAs</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Acompanhe o status das suas entregas e prazos
              </p>
            </PremiumGlassCard>
          </BlurFade>
        </div>

        {/* Embedded demands view */}
        <BlurFade delay={0.2}>
          <PremiumGlassCard className="p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Inbox className="h-4 w-4 text-app-gestao" />
              Demandas Recentes
            </h3>
            <MyDemandsView />
          </PremiumGlassCard>
        </BlurFade>
      </div>
    </PageWrapper>
  );
}

// ─── Full internal dashboard ─────────────────────────────────
function FullDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { period, setPeriod, customRange, setCustomRange } = usePeriodFilter('month');
  const [showHistory, setShowHistory] = useState(false);

  // Existing hooks (unchanged)
  const { data: budget, isLoading: loadingBudget } = useMarketingBudgets();
  const { data: kpi, isLoading: loadingKPI } = useLatestMarketingKPI('monthly');
  const { data: kpiHistory } = useMarketingKPIs('monthly');
  const { data: plans, isLoading: loadingPlans } = useMarketingPlans({ type: 'campaign' });
  const { data: demandStats } = useDemandStats();
  const { data: executions = [] } = useMarketingExecutions();

  // New: aggregated summary (reads from same cached queries — no extra requests)
  const summary = useDashboardSummary();

  const isLoading = loadingBudget || loadingKPI || loadingPlans;

  // Budget stats (existing logic — unchanged)
  const totalBudget = budget?.total_budget || 0;
  const categories = budget?.marketing_budget_categories || [];
  const totalSpent = categories.reduce((sum, cat) => sum + Number(cat.spent_amount || 0), 0);
  const percentUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const overBudgetCategories = categories.filter(c => Number(c.spent_amount) > Number(c.allocated_amount));

  // Channel data (existing — unchanged)
  const channelData = kpi?.marketing_kpis_by_channel || [];
  const performanceByChannel: ChannelPerformance[] = channelData.length > 0 
    ? channelData
        .sort((a, b) => (b.roi || 0) - (a.roi || 0))
        .slice(0, 4)
        .map(ch => ({
          channel: ch.channel,
          roi: ch.roi ? Math.round(ch.roi) : 0,
          color: ch.channel === 'Trade Marketing' ? '#10B981' :
                 ch.channel === 'Digital' ? '#3B82F6' :
                 ch.channel === 'PDV' ? '#8B5CF6' : '#F59E0B'
        }))
    : [];

  // Campaign levels (existing — unchanged)
  const activePlans = plans?.filter(p => p.status === 'in_progress').length || 0;
  const plannedPlans = plans?.filter(p => p.status === 'planned').length || 0;
  const completedPlans = plans?.filter(p => p.status === 'completed').length || 0;
  const totalPlans = plans?.length || 1;
  
  const campaignLevels: CampaignLevel[] = [
    { name: 'Ativas', count: activePlans, percentage: Math.round((activePlans / totalPlans) * 100) || 0, color: 'bg-emerald-500' },
    { name: 'Planejadas', count: plannedPlans, percentage: Math.round((plannedPlans / totalPlans) * 100) || 0, color: 'bg-blue-500' },
    { name: 'Concluídas', count: completedPlans, percentage: Math.round((completedPlans / totalPlans) * 100) || 0, color: 'bg-muted-foreground' },
  ];

  // Sparkline + historical (existing — unchanged)
  const roiHistory = useMemo(() => {
    if (!kpiHistory || kpiHistory.length === 0) return [];
    return kpiHistory.slice(0, 6).reverse().map(k => ({ value: k.roi || 0 }));
  }, [kpiHistory]);

  const previousKPI = kpiHistory && kpiHistory.length > 1 ? kpiHistory[1] : null;

  const topChannel = channelData.length > 0
    ? [...channelData].sort((a, b) => (b.roi || 0) - (a.roi || 0))[0]
    : null;

  const pendingCount = (demandStats?.open || 0) + (demandStats?.inProgress || 0);

  const campaignsWithoutExecution = useMemo(() => {
    if (!plans) return 0;
    const executedPlanIds = new Set(executions.filter(e => e.entity_type === 'plan').map(e => e.entity_id));
    return plans.filter(p => p.status === 'in_progress' && !executedPlanIds.has(p.id)).length;
  }, [plans, executions]);

  const roiDelta = kpi?.roi && previousKPI?.roi
    ? ((kpi.roi - previousKPI.roi) / Math.abs(previousKPI.roi) * 100).toFixed(0)
    : null;

  // Metric cards (existing — unchanged)
  const metricCards: MetricCardData[] = [
    {
      title: 'ROI Marketing',
      value: kpi?.roi ? `${kpi.roi.toFixed(1)}%` : '--',
      change: roiDelta ? `${Number(roiDelta) > 0 ? '+' : ''}${roiDelta}% vs anterior` : 'Período atual',
      changeType: roiDelta ? (Number(roiDelta) >= 0 ? 'positive' : 'negative') : 'neutral',
      icon: TrendingUp,
      iconColor: 'hsl(var(--app-gestao))',
      sparklineData: roiHistory,
      driver: topChannel ? `${topChannel.channel} puxou o ROI (${topChannel.roi?.toFixed(0) || 0}%)` : undefined,
      actionLabel: kpi?.roi ? 'Explicar variação' : 'Registrar KPI',
      onAction: () => navigate('/app/marketing/kpis'),
    },
    {
      title: 'Budget Utilizado',
      value: formatCurrency(totalSpent),
      change: totalBudget > 0 ? `${percentUsed}% do total` : 'Sem budget',
      changeType: percentUsed > 90 ? 'negative' : percentUsed > 70 ? 'neutral' : 'positive',
      icon: DollarSign,
      iconColor: 'hsl(var(--app-gestao-glow))',
      sparklineData: percentUsed > 0 ? [{ value: percentUsed }] : [],
      driver: overBudgetCategories.length > 0
        ? `${overBudgetCategories.length} categoria(s) acima do previsto`
        : totalBudget > 0 ? `Saldo: ${formatCurrency(totalBudget - totalSpent)}` : undefined,
      actionLabel: overBudgetCategories.length > 0 ? 'Ver desvios' : 'Ver financeiro',
      onAction: () => navigate('/app/marketing/financeiro'),
    },
    {
      title: 'Demandas Pendentes',
      value: pendingCount.toString(),
      change: demandStats?.overdue ? `${demandStats.overdue} atrasada(s)` : `${demandStats?.total || 0} total`,
      changeType: (demandStats?.overdue || 0) > 0 ? 'negative' : 'neutral',
      icon: Inbox,
      iconColor: 'hsl(var(--app-gestao))',
      sparklineData: pendingCount > 0 ? [{ value: pendingCount }] : [],
      driver: demandStats?.overdue
        ? `${demandStats.overdue} atrasada(s) precisam de atenção`
        : demandStats?.urgent ? `${demandStats.urgent} urgente(s)` : undefined,
      actionLabel: (demandStats?.overdue || 0) > 0 ? 'Ver atrasadas' : 'Ver demandas',
      onAction: () => navigate('/app/marketing/demandas'),
    },
    {
      title: 'Campanhas Ativas',
      value: activePlans.toString(),
      change: campaignsWithoutExecution > 0 ? `${campaignsWithoutExecution} sem execução` : `${plans?.length || 0} total`,
      changeType: campaignsWithoutExecution > 0 ? 'negative' : 'neutral',
      icon: Calendar,
      iconColor: 'hsl(var(--app-gestao))',
      sparklineData: activePlans > 0 ? [{ value: activePlans }] : [],
      driver: campaignsWithoutExecution > 0
        ? `${campaignsWithoutExecution} campanha(s) sem execução registrada`
        : undefined,
      actionLabel: campaignsWithoutExecution > 0 ? 'Ver sem execução' : 'Ver campanhas',
      onAction: () => navigate('/app/marketing/campanhas'),
    },
  ];

  // Chart data (existing — unchanged)
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (showHistory && kpiHistory && kpiHistory.length > 0) {
      return kpiHistory.slice(0, 6).reverse().map(k => ({
        name: k.period_start?.substring(0, 7) || '',
        roi: k.roi || 0,
        investment: 0,
      }));
    }
    return kpi?.roi || totalSpent > 0
      ? [{ name: 'Atual', roi: kpi?.roi || 0, investment: totalSpent }]
      : [];
  }, [kpi, totalSpent, showHistory, kpiHistory]);

  const displayName = user?.email?.split('@')[0] || 'Usuário';

  // Week plans for timeline
  const allPlans = useMemo(() => {
    if (!plans) return [];
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const todayStr = now.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    return plans.filter(p => p.start_date && p.start_date >= todayStr && p.start_date <= weekEndStr);
  }, [plans]);

  return (
    <PageWrapper hideHeader className="min-h-full">
      <div className="space-y-6">
        {/* Header + Period Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DashboardHeader userName={displayName} />
          <div className="flex items-center gap-2">
            {/* Urgency indicator */}
            {summary.urgencyScore > 0 && (
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium",
                summary.urgencyScore >= 60 ? "bg-destructive/10 text-destructive" :
                summary.urgencyScore >= 30 ? "bg-orange-500/10 text-orange-600" :
                "bg-primary/10 text-primary"
              )}>
                <Gauge className="h-3 w-3" />
                {summary.urgencyScore >= 60 ? "Alto risco" : summary.urgencyScore >= 30 ? "Atenção" : "Sob controle"}
              </div>
            )}
            <PeriodFilter
              value={period}
              onChange={setPeriod}
              options={['today', 'week', 'month', 'quarter', 'semester', 'year', 'custom']}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />
            <Button
              variant={showHistory ? "secondary" : "outline"}
              size="sm"
              className="h-7 text-[11px] gap-1.5"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-3.5 w-3.5" />
              Histórico
            </Button>
          </div>
        </div>

        {/* NEW: Pendências do Dia (Today's Action Cards) */}
        <BlurFade delay={0.02}>
          <TodayActionCards
            demands={summary.demands}
            campaigns={summary.campaigns}
            tasks={summary.tasks}
            alerts={summary.alerts}
          />
        </BlurFade>

        {/* NEW: Quick Actions Bar */}
        <BlurFade delay={0.04}>
          <QuickActionsBar />
        </BlurFade>

        {/* AI Insight Card (existing — preserved) */}
        <BlurFade delay={0.05}>
          <AIInsightCard 
            type="dashboard" 
            moduleColor="gestao"
            contextData={{
              roi: kpi?.roi,
              conversion_rate: kpi?.conversion_rate,
              impressions: kpi?.impressions,
              clicks: kpi?.clicks,
              total_budget: totalBudget,
              spent_amount: totalSpent,
              budget_usage_percent: percentUsed,
              active_plans: activePlans,
              planned_campaigns: plans?.length || 0,
              channels: channelData.map(ch => ({
                name: ch.channel,
                roi: ch.roi,
                investment: ch.investment,
              })),
            }}
            prompt="Analise os KPIs de marketing, o uso do orçamento e a performance por canal. Identifique oportunidades de otimização, alerte sobre riscos de budget e sugira ações estratégicas para melhorar o ROI."
          />
        </BlurFade>

        {/* KPI Metric Cards (existing — preserved) */}
        <MetricCards 
          metrics={metricCards} 
          isLoading={isLoading} 
        />

        {/* NEW: Operational Command Row — Week + Production + Budget */}
        <BlurFade delay={0.12}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <WeekTimeline plans={allPlans} />
            <ProductionPipelineByArea
              tasksByArea={summary.tasks.byArea}
              overdueTasks={summary.tasks.overdue}
            />
            <BudgetControlWidget
              total={summary.budget.total}
              spent={summary.budget.spent}
              percent={summary.budget.percent}
            />
          </div>
        </BlurFade>

        {/* Driver Analysis + Risk Block (existing — preserved) */}
        <BlurFade delay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DriverAnalysisPanel />
            <RiskBlock />
          </div>
        </BlurFade>

        {/* NEW: Campaign Health + Retail Actions */}
        <BlurFade delay={0.18}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CampaignHealthWidget
              active={summary.campaigns.active}
              pendingApproval={summary.campaigns.pendingApproval}
              withoutROI={summary.campaigns.withoutROI}
              total={summary.campaigns.total}
            />
            <RetailActionsWidget
              running={summary.retail.running}
              planned={summary.retail.planned}
              total={summary.retail.total}
            />
          </div>
        </BlurFade>

        {/* Main Chart + Activity Feed (existing — preserved) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MainChart 
            data={chartData}
            isLoading={isLoading}
            className="lg:col-span-2"
          />
          <PremiumActivityFeed 
            activities={activities}
            isLoading={isLoading}
            limit={4}
            onViewAll={() => navigate('/app/marketing/alertas')}
          />
        </div>

        {/* Engagement Section (existing — preserved) */}
        <EngagementSection
          channelData={performanceByChannel}
          campaignLevels={campaignLevels}
          isLoading={isLoading}
        />

        {/* Demands Quick Access (existing — preserved) */}
        <BlurFade delay={0.28}>
          <PremiumGlassCard className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-app-gestao" />
                <h3 className="font-semibold text-foreground">Demandas</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/marketing/demandas')}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">{demandStats?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                <p className="text-2xl font-bold text-yellow-600">{(demandStats?.inProgress || 0) + (demandStats?.review || 0)}</p>
                <p className="text-xs text-muted-foreground">Em Revisão</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-2xl font-bold text-destructive">{demandStats?.overdue || 0}</p>
                </div>
                <p className="text-xs text-muted-foreground">Atrasadas</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-destructive/10">
                <div className="flex items-center justify-center gap-1">
                  <Zap className="h-4 w-4 text-destructive" />
                  <p className="text-2xl font-bold text-destructive">{demandStats?.urgent || 0}</p>
                </div>
                <p className="text-xs text-muted-foreground">Urgentes</p>
              </div>
            </div>
          </PremiumGlassCard>
        </BlurFade>

        {/* Alerts + Goals + Social Media Row (existing — preserved) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BlurFade delay={0.3}>
            <AlertsPanel 
              limit={3} 
              showHeader={true}
              onViewAll={() => navigate('/app/marketing/alertas')}
            />
          </BlurFade>
          
          <BlurFade delay={0.35}>
            <GoalTracker 
              limit={3} 
              showHeader={true}
              onViewAll={() => navigate('/app/marketing/kpis')}
            />
          </BlurFade>

          <BlurFade delay={0.4}>
            <SocialMediaDashboardCards />
          </BlurFade>
        </div>

        {/* Historical comparison panel (existing — preserved) */}
        {showHistory && kpiHistory && kpiHistory.length > 1 && (
          <BlurFade delay={0.1}>
            <PremiumGlassCard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-app-gestao" />
                <h3 className="font-semibold text-foreground">Comparativo Histórico</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Período</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">ROI</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Conversão</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Impressões</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Leads</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpiHistory.slice(0, 6).map((k, i) => (
                      <tr key={k.id} className={cn("border-b border-border/50", i === 0 && "bg-app-gestao/5")}>
                        <td className="py-2 font-medium">
                          {k.period_start?.substring(0, 7)}
                          {i === 0 && <Badge className="ml-2 text-[9px] h-4 bg-app-gestao/20 text-app-gestao border-0">Atual</Badge>}
                        </td>
                        <td className="text-right py-2">{k.roi?.toFixed(1) || '--'}%</td>
                        <td className="text-right py-2">{k.conversion_rate?.toFixed(1) || '--'}%</td>
                        <td className="text-right py-2">{k.impressions?.toLocaleString('pt-BR') || '--'}</td>
                        <td className="text-right py-2">{k.leads?.toLocaleString('pt-BR') || '--'}</td>
                        <td className="text-right py-2">
                          {k.revenue ? formatCurrency(k.revenue) : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PremiumGlassCard>
          </BlurFade>
        )}
      </div>
    </PageWrapper>
  );
}
