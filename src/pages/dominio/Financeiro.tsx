import { DollarSign, TrendingUp, TrendingDown, Target, Wallet, Receipt } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { BlurFade } from '@/components/ui/blur-fade';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { CHART_TOOLTIP_STYLE, CHART_AXIS_STROKE, CHART_GRID_STROKE } from '@/lib/chart-styles';

export default function Financeiro() {
  const { tenant } = useAuth();

  // Mock data (would come from integrations/metrics)
  const revenueData = [
    { month: 'Jan', realizado: 18500000, meta: 18000000 },
    { month: 'Fev', realizado: 19200000, meta: 19000000 },
    { month: 'Mar', realizado: 21500000, meta: 20000000 },
    { month: 'Abr', realizado: 20800000, meta: 21000000 },
    { month: 'Mai', realizado: 22100000, meta: 22000000 },
    { month: 'Jun', realizado: 23500000, meta: 23000000 },
  ];

  const categoryData = [
    { name: 'Alimentos', value: 45 },
    { name: 'Bebidas', value: 25 },
    { name: 'Higiene', value: 15 },
    { name: 'Limpeza', value: 10 },
    { name: 'Outros', value: 5 },
  ];

  const COLORS = ['#a855f7', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

  const kpis = [
    { icon: DollarSign, label: 'Faturamento MTD', value: 'R$ 23.5M', change: '+12.4%', positive: true },
    { icon: Target, label: 'Meta do Mês', value: 'R$ 25M', change: '94.2%', positive: true },
    { icon: TrendingUp, label: 'Margem Bruta', value: '28.5%', change: '+1.2%', positive: true },
    { icon: Wallet, label: 'Ticket Médio', value: 'R$ 127', change: '+5.3%', positive: true },
  ];

  return (
    <PageWrapper
      title="Painel Financeiro"
      subtitle="Faturamento, margens e análise de custos"
      icon={<DollarSign className="w-6 h-6 text-green-400" />}
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
                      <span className={`text-xs font-medium flex items-center ${kpi.positive ? 'text-green-500' : 'text-red-500'}`}>
                        {kpi.positive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {kpi.change}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/20">
                      <Icon className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </PremiumGlassCard>
              </BlurFade>
            );
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Faturamento vs Meta */}
          <BlurFade delay={0.2}>
            <PremiumGlassCard className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Faturamento vs Meta</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="month" stroke={CHART_AXIS_STROKE} />
                  <YAxis 
                    stroke={CHART_AXIS_STROKE} 
                    tickFormatter={(v) => `R$ ${(v/1000000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: number) => [`R$ ${(v/1000000).toFixed(2)}M`]}
                  />
                  <Area type="monotone" dataKey="meta" stroke="#a855f7" fill="none" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="realizado" stroke="#22c55e" fillOpacity={1} fill="url(#colorRealizado)" />
                </AreaChart>
              </ResponsiveContainer>
            </PremiumGlassCard>
          </BlurFade>

          {/* Mix de Categorias */}
          <BlurFade delay={0.3}>
            <PremiumGlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Mix por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: number) => [`${v}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {categoryData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    {cat.name}
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </BlurFade>
        </div>

        {/* Custos Operacionais */}
        <BlurFade delay={0.4}>
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Custos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'CMV', value: 'R$ 16.2M', percent: '69%' },
                { label: 'Folha', value: 'R$ 3.8M', percent: '16%' },
                { label: 'Operacional', value: 'R$ 2.1M', percent: '9%' },
                { label: 'Marketing', value: 'R$ 1.4M', percent: '6%' },
              ].map((cost) => (
                <div key={cost.label} className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">{cost.label}</p>
                  <p className="text-xl font-bold mt-1">{cost.value}</p>
                  <p className="text-xs text-muted-foreground">{cost.percent}</p>
                </div>
              ))}
            </div>
          </PremiumGlassCard>
        </BlurFade>
      </div>
    </PageWrapper>
  );
}
