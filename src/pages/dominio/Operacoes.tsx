import { ShoppingCart, TrendingUp, Store, AlertTriangle, Award } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { BlurFade } from '@/components/ui/blur-fade';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CHART_TOOLTIP_STYLE, CHART_AXIS_STROKE, CHART_GRID_STROKE } from '@/lib/chart-styles';
import { Progress } from '@/components/ui/progress';

export default function Operacoes() {
  const { tenant } = useAuth();

  // Mock data
  const storeRanking = [
    { name: 'Loja Centro', revenue: 4200000, meta: 4000000, performance: 105 },
    { name: 'Loja Norte', revenue: 3800000, meta: 3500000, performance: 108 },
    { name: 'Loja Sul', revenue: 3200000, meta: 3000000, performance: 106 },
    { name: 'Loja Oeste', revenue: 2900000, meta: 3200000, performance: 90 },
    { name: 'Loja Leste', revenue: 2700000, meta: 2800000, performance: 96 },
  ];

  const dailyTrend = [
    { day: 'Seg', vendas: 850000 },
    { day: 'Ter', vendas: 920000 },
    { day: 'Qua', vendas: 780000 },
    { day: 'Qui', vendas: 1050000 },
    { day: 'Sex', vendas: 1200000 },
    { day: 'Sáb', vendas: 1450000 },
    { day: 'Dom', vendas: 980000 },
  ];

  const kpis = [
    { icon: Store, label: 'Lojas Ativas', value: '12', change: '' },
    { icon: ShoppingCart, label: 'Vendas Hoje', value: 'R$ 1.2M', change: '+8.5%' },
    { icon: TrendingUp, label: 'Ticket Médio', value: 'R$ 127', change: '+5.3%' },
    { icon: AlertTriangle, label: 'Rupturas', value: '23', change: '-12%' },
  ];

  return (
    <PageWrapper
      title="Painel de Operações"
      subtitle="Performance por loja e indicadores operacionais"
      icon={<ShoppingCart className="w-6 h-6 text-blue-400" />}
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <BlurFade key={kpi.label} delay={0.1 * idx}>
                <PremiumGlassCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      {kpi.change && (
                        <span className={`text-xs font-medium ${kpi.change.startsWith('+') || kpi.change.startsWith('-') && !kpi.change.includes('12') ? 'text-green-500' : 'text-green-500'}`}>
                          {kpi.change}
                        </span>
                      )}
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </PremiumGlassCard>
              </BlurFade>
            );
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ranking de Lojas */}
          <BlurFade delay={0.2}>
            <PremiumGlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-400" />
                Ranking de Lojas
              </h3>
              <div className="space-y-4">
                {storeRanking.map((store, idx) => (
                  <div key={store.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                          idx === 2 ? 'bg-orange-600/20 text-orange-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-medium">{store.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${store.performance >= 100 ? 'text-green-500' : 'text-red-500'}`}>
                        {store.performance}%
                      </span>
                    </div>
                    <Progress 
                      value={store.performance} 
                      className={`h-2 ${store.performance >= 100 ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      R$ {(store.revenue/1000000).toFixed(2)}M / R$ {(store.meta/1000000).toFixed(2)}M
                    </p>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </BlurFade>

          {/* Tendência Semanal */}
          <BlurFade delay={0.3}>
            <PremiumGlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Vendas - Última Semana</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="day" stroke={CHART_AXIS_STROKE} />
                  <YAxis 
                    stroke={CHART_AXIS_STROKE} 
                    tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: number) => [`R$ ${(v/1000).toFixed(0)}K`, 'Vendas']}
                  />
                  <Bar dataKey="vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </PremiumGlassCard>
          </BlurFade>
        </div>
      </div>
    </PageWrapper>
  );
}
