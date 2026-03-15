import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign,
  Eye,
  MousePointer,
  ShoppingCart,
  Plus,
  BookOpen,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLatestMarketingKPI } from '@/hooks/useMarketingKPIs';
import { StatCardWithSparkline } from '@/components/marketing/StatCardWithSparkline';
import { CreateKPIDialog } from '@/components/marketing/CreateKPIDialog';
import { RegisterMetricDialog } from '@/components/marketing/RegisterMetricDialog';
import { MetricsCatalogPanel } from '@/components/marketing/MetricsCatalogPanel';
import { DataQualityIndicator } from '@/components/marketing/DataQualityIndicator';
import { BlurFade } from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { Empty } from '@/components/ui/empty';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
};

export default function KPIs() {
  const navigate = useNavigate();
  const [showRegisterMetric, setShowRegisterMetric] = useState(false);
  const { data: kpi, isLoading } = useLatestMarketingKPI('monthly');
  
  const hasData = !!kpi;
  
  // Build main KPIs from real data only
  const mainKpis = hasData ? [
    {
      title: 'ROI Geral',
      value: kpi?.roi ? `${kpi.roi.toFixed(1)}%` : '--',
      description: 'Retorno sobre investimento em marketing',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: 'CAC',
      value: kpi?.cac ? formatCurrency(kpi.cac) : '--',
      description: 'Custo de aquisição de cliente',
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: 'LTV',
      value: kpi?.ltv ? formatCurrency(kpi.ltv) : '--',
      description: 'Lifetime value do cliente',
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Taxa de Conversão',
      value: kpi?.conversion_rate ? `${kpi.conversion_rate.toFixed(1)}%` : '--',
      description: 'Visitantes que se tornaram clientes',
      icon: <Target className="h-4 w-4" />,
    },
  ] : [];

  // Build channel KPIs from real data only
  const channelData = kpi?.marketing_kpis_by_channel || [];
  
  const channelKpis = channelData.map(ch => ({
    channel: ch.channel,
    metrics: [
      { label: 'Investimento', value: ch.investment ? formatCurrency(ch.investment) : 'R$ 0' },
      { label: 'Leads', value: ch.leads?.toString() || '0' },
      { label: 'ROI', value: ch.roi ? `${ch.roi.toFixed(0)}%` : '0%' },
    ],
    color: ch.channel === 'Trade Marketing' ? 'bg-emerald-500' :
           ch.channel === 'Digital' ? 'bg-blue-500' :
           ch.channel === 'WhatsApp' ? 'bg-green-500' :
           ch.channel === 'PDV' ? 'bg-violet-500' : 'bg-muted-foreground',
  }));

  // Build funnel data from real data only
  const funnelData = hasData ? [
    { stage: 'Impressões', value: kpi?.impressions || 0, icon: Eye },
    { stage: 'Cliques', value: kpi?.clicks || 0, icon: MousePointer },
    { stage: 'Visitas', value: kpi?.visits || 0, icon: Users },
    { stage: 'Conversões', value: kpi?.conversions || 0, icon: ShoppingCart },
  ] : [];

  return (
    <PageWrapper
      title="KPIs de Marketing"
      subtitle="Indicadores consolidados de performance"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowRegisterMetric(true)}>
            <Activity className="h-4 w-4 mr-2" />
            Registrar Métrica
          </Button>
          <Button onClick={() => navigate("/app/marketing/kpis/novo")}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar KPIs
          </Button>
        </div>
      }
    >
      {/* Data Quality */}
      <DataQualityIndicator />

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9 mb-4">
          <TabsTrigger value="kpis" className="text-xs gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            KPIs
          </TabsTrigger>
          <TabsTrigger value="catalog" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Definições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="mt-0 space-y-4">

        {/* Empty State */}
        {!isLoading && !hasData && (
          <BlurFade delay={0.05}>
            <Empty
              icon={<BarChart3 className="h-12 w-12" />}
              title="Nenhum KPI registrado"
              description="Registre os indicadores de marketing do período"
              action={
                <Button onClick={() => navigate("/app/marketing/kpis/novo")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar KPIs
                </Button>
              }
            />
          </BlurFade>
        )}

        {/* Main KPIs */}
        {hasData && (
          <BlurFade delay={0.05}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {mainKpis.map((kpiItem) => (
                <StatCardWithSparkline
                  key={kpiItem.title}
                  title={kpiItem.title}
                  value={isLoading ? '--' : kpiItem.value}
                  icon={kpiItem.icon}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </BlurFade>
        )}

        {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Channel KPIs */}
        <BlurFade delay={0.1}>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-app-gestao" />
              <h3 className="text-sm font-semibold">KPIs por Canal</h3>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j}>
                          <Skeleton className="h-5 w-16 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                channelKpis.map((channel, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn("h-2 w-2 rounded-full", channel.color)} />
                      <p className="text-xs font-semibold text-foreground">{channel.channel}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {channel.metrics.map((metric, i) => (
                        <div key={i}>
                          <p className="text-lg font-bold text-foreground">{metric.value}</p>
                          <p className="text-[10px] text-muted-foreground">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </BlurFade>

        {/* Funnel */}
        <BlurFade delay={0.15}>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-app-gestao" />
              <h3 className="text-sm font-semibold">Funil de Marketing</h3>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))
              ) : (
                funnelData.map((stage, index) => {
                  const maxValue = funnelData[0].value;
                  const width = (stage.value / maxValue) * 100;
                  const conversionRate = index > 0 
                    ? ((stage.value / funnelData[index - 1].value) * 100).toFixed(1)
                    : null;
                  
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-1 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <stage.icon className="h-3.5 w-3.5 text-app-gestao" />
                          <span className="text-foreground font-medium">{stage.stage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {stage.value.toLocaleString('pt-BR')}
                          </span>
                          {conversionRate && (
                            <span className="text-[10px] text-muted-foreground">
                              ({conversionRate}%)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-6 bg-muted rounded overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-app-gestao to-violet-500 rounded flex items-center justify-end pr-2"
                        >
                          {width > 30 && (
                            <span className="text-[9px] text-white font-medium">
                              {width.toFixed(0)}%
                            </span>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </BlurFade>
        </div>
        )}
        </TabsContent>

        <TabsContent value="catalog" className="mt-0">
          <MetricsCatalogPanel />
        </TabsContent>
      </Tabs>

        
        <RegisterMetricDialog open={showRegisterMetric} onOpenChange={setShowRegisterMetric} />
    </PageWrapper>
  );
}
