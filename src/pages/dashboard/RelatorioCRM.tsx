import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { useDashboardStats, useContactsByUnit, useContactStatusDistribution } from '@/hooks/useDashboard';
import { Users, UserCheck, UserMinus, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function RelatorioCRM() {
  const { data: stats } = useDashboardStats();
  const { data: byUnit } = useContactsByUnit();
  const { data: statusDist } = useContactStatusDistribution();

  return (
    <div className="space-y-4">
      <PageHeader title="Relatórios de CRM" description="Analise dados de contatos e unidades" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total" value={stats?.total || 0} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Ativos" value={stats?.active || 0} icon={<UserCheck className="h-4 w-4" />} variant="success" />
        <StatCard title="Opt-out" value={stats?.optedOut || 0} icon={<UserMinus className="h-4 w-4" />} variant="warning" />
        <StatCard title="Unidades" value={byUnit?.length || 0} icon={<Building2 className="h-4 w-4" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Contatos por Unidade</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byUnit || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Status dos Contatos</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDist || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {(statusDist || []).map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
