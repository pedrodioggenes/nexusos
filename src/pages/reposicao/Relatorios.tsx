import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useReplenishmentTasks, useRuptureRecords, useExpirationAlerts } from '@/hooks/useReplenishment';
import { useGondolas } from '@/hooks/useGondolas';
import { CHART_TOOLTIP_STYLE, CHART_AXIS_STROKE, CHART_GRID_STROKE } from '@/lib/chart-styles';

export default function RelatoriosReposicao() {
  const { tenant } = useAuth();
  const { data: tasks = [] } = useReplenishmentTasks(tenant?.id);
  const { data: ruptures = [] } = useRuptureRecords(tenant?.id);
  const { data: expirations = [] } = useExpirationAlerts(tenant?.id);
  const { data: gondolas = [] } = useGondolas(tenant?.id);

  const taskStatusData = [
    { name: 'Pendentes', value: tasks.filter(t => t.status === 'pending').length },
    { name: 'Em Andamento', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Concluídas', value: tasks.filter(t => t.status === 'completed').length },
  ];

  const sectorData = Array.from(
    new Map(
      gondolas
        .filter(g => g.sector)
        .map(g => [g.sector, gondolas.filter(gon => gon.sector === g.sector).length])
    ),
    ([name, value]) => ({ name, value })
  );

  const ruptureReasonData = [
    { name: 'Sem Estoque', value: ruptures.filter(r => r.reason === 'out_of_stock').length },
    { name: 'Atraso Fornecedor', value: ruptures.filter(r => r.reason === 'supplier_delay').length },
    { name: 'Avariado', value: ruptures.filter(r => r.reason === 'damaged').length },
    { name: 'Outro', value: ruptures.filter(r => !r.reason || r.reason === 'other').length },
  ];

  const COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444'];
  const TASK_COLORS = ['#f59e0b', '#3b82f6', '#22c55e'];

  return (
    <PageWrapper
      title="Relatórios"
      subtitle="Métricas operacionais de reposição"
      icon={<TrendingUp className="w-6 h-6" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PremiumGlassCard className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Gôndolas</p>
            <p className="text-3xl font-bold">{gondolas.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Tarefas (30 dias)</p>
            <p className="text-3xl font-bold">{tasks.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Rupturas Ativas</p>
            <p className="text-3xl font-bold text-destructive">
              {ruptures.filter(r => !r.resolved_at).length}
            </p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Alertas de Validade</p>
            <p className="text-3xl font-bold text-warning">{expirations.length}</p>
          </PremiumGlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Status das Tarefas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {TASK_COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </PremiumGlassCard>

          <PremiumGlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Gôndolas por Setor</h3>
            {sectorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis dataKey="name" stroke={CHART_AXIS_STROKE} />
                  <YAxis stroke={CHART_AXIS_STROKE} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">Sem dados disponíveis</p>
            )}
          </PremiumGlassCard>

          <PremiumGlassCard className="p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Rupturas por Motivo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ruptureReasonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis type="number" stroke={CHART_AXIS_STROKE} />
                <YAxis dataKey="name" type="category" stroke={CHART_AXIS_STROKE} width={120} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </PremiumGlassCard>
        </div>
      </div>
    </PageWrapper>
  );
}
