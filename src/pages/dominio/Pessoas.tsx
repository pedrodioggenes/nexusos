import { Users, TrendingUp, DollarSign, Calendar, UserMinus } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { BlurFade } from '@/components/ui/blur-fade';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CHART_TOOLTIP_STYLE, CHART_AXIS_STROKE, CHART_GRID_STROKE } from '@/lib/chart-styles';

export default function Pessoas() {
  const { tenant } = useAuth();
  const { data: employees = [] } = useEmployees(tenant?.id);

  const totalSalary = employees.reduce((acc, e) => acc + (e.salary || 0), 0);
  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  const departmentData = departments.map(dept => ({
    name: dept,
    value: employees.filter(e => e.department === dept).length,
  }));

  const statusData = [
    { name: 'Ativos', value: employees.filter(e => e.status === 'active').length },
    { name: 'Afastados', value: employees.filter(e => e.status === 'on_leave').length },
    { name: 'Desligados', value: employees.filter(e => e.status === 'terminated').length },
  ];

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  const kpis = [
    { icon: Users, label: 'Headcount', value: employees.length.toString(), color: 'text-blue-400' },
    { icon: DollarSign, label: 'Folha Mensal', value: `R$ ${(totalSalary/1000).toFixed(0)}K`, color: 'text-green-400' },
    { icon: TrendingUp, label: 'Custo/Faturamento', value: '16.2%', color: 'text-purple-400' },
    { icon: UserMinus, label: 'Turnover (12m)', value: '8.5%', color: 'text-orange-400' },
  ];

  return (
    <PageWrapper
      title="Painel de Pessoas"
      subtitle="Indicadores de RH e custo de pessoal"
      icon={<Users className="w-6 h-6 text-orange-400" />}
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
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <Icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                  </div>
                </PremiumGlassCard>
              </BlurFade>
            );
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Por Departamento */}
          <BlurFade delay={0.2}>
            <PremiumGlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Colaboradores por Departamento</h3>
              {departmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                    <XAxis type="number" stroke={CHART_AXIS_STROKE} />
                    <YAxis dataKey="name" type="category" stroke={CHART_AXIS_STROKE} width={100} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">Sem dados disponíveis</p>
              )}
            </PremiumGlassCard>
          </BlurFade>

          {/* Por Status */}
          <BlurFade delay={0.3}>
            <PremiumGlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status dos Colaboradores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {statusData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </BlurFade>
        </div>

        {/* Métricas Adicionais */}
        <BlurFade delay={0.4}>
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Indicadores de Produtividade</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Faturamento/Colaborador', value: 'R$ 195K', desc: 'Média mensal' },
                { label: 'Absenteísmo', value: '3.2%', desc: 'Últimos 30 dias' },
                { label: 'Horas Extras', value: '12%', desc: 'Da folha' },
                { label: 'Férias Pendentes', value: '45', desc: 'Colaboradores' },
              ].map((metric) => (
                <div key={metric.label} className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-xl font-bold mt-1">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </PremiumGlassCard>
        </BlurFade>
      </div>
    </PageWrapper>
  );
}
