import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';
import { CHART_TOOLTIP_STYLE, CHART_AXIS_STROKE, CHART_GRID_STROKE } from '@/lib/chart-styles';

export default function Relatorios() {
  const { tenant } = useAuth();
  const { data: employees = [] } = useEmployees(tenant?.id);

  const departmentData = Array.from(
    new Map(
      employees
        .filter(e => e.department)
        .map(e => [e.department, employees.filter(emp => emp.department === e.department).length])
    ),
    ([name, value]) => ({ name, value })
  );

  const statusData = [
    { name: 'Ativos', value: employees.filter(e => e.status === 'active').length },
    { name: 'Afastados', value: employees.filter(e => e.status === 'on_leave').length },
  ];

  const COLORS = ['#22c55e', '#f59e0b'];

  return (
    <PageWrapper
      title="Relatórios"
      subtitle="Análises e métricas de RH"
      icon={<TrendingUp className="w-6 h-6" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PremiumGlassCard className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total de Colaboradores</p>
            <p className="text-3xl font-bold">{employees.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Ativos</p>
            <p className="text-3xl font-bold text-success">{employees.filter(e => e.status === 'active').length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Departamentos</p>
            <p className="text-3xl font-bold">{new Set(employees.map(e => e.department)).size}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Folha Mensal</p>
            <p className="text-3xl font-bold">
              R$ {(employees.reduce((acc, e) => acc + (e.salary || 0), 0) / 1000).toFixed(0)}K
            </p>
          </PremiumGlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Colaboradores por Departamento</h3>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="name" stroke={CHART_AXIS_STROKE} />
                  <YAxis stroke={CHART_AXIS_STROKE} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem dados disponíveis</p>
            )}
          </PremiumGlassCard>

          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Status de Colaboradores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </PremiumGlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
