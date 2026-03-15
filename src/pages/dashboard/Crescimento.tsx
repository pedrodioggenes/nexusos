import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { useDashboardStats, useContactGrowth, useContactsPerDay } from '@/hooks/useDashboard';
import { TrendingUp, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Crescimento() {
  const { data: stats } = useDashboardStats();
  const { data: growth } = useContactGrowth();
  const { data: perDay } = useContactsPerDay();

  return (
    <div className="space-y-4">
      <PageHeader title="Crescimento" description="Acompanhe o crescimento da sua base de contatos" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total" value={stats?.total || 0} icon={<Users className="h-4 w-4" />} />
        <StatCard title="7 dias" value={stats?.newLast7Days || 0} icon={<TrendingUp className="h-4 w-4" />} variant="success" />
        <StatCard title="30 dias" value={stats?.newLast30Days || 0} icon={<Calendar className="h-4 w-4" />} variant="primary" />
        <StatCard title="Taxa" value={`${((stats?.newLast30Days || 0) / (stats?.total || 1) * 100).toFixed(1)}%`} icon={<ArrowUpRight className="h-4 w-4" />} variant="accent" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Crescimento Mensal</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth || []}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Area type="monotone" dataKey="novos" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Cadastros por Dia (Últimos 30 dias)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
