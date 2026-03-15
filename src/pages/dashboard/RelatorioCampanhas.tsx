import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { useCampaignStats, useCampaignsPerMonth, useRecentCampaigns } from '@/hooks/useDashboard';
import { Megaphone, Send, Clock, FileX, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';

export default function RelatorioCampanhas() {
  const { data: stats } = useCampaignStats();
  const { data: perMonth } = useCampaignsPerMonth();
  const { data: recent } = useRecentCampaigns();

  const pieData = [
    { name: 'Enviadas', value: stats?.sent || 0, fill: 'hsl(var(--success))' },
    { name: 'Agendadas', value: stats?.scheduled || 0, fill: 'hsl(var(--accent))' },
    { name: 'Rascunhos', value: stats?.draft || 0, fill: 'hsl(var(--muted-foreground))' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Relatórios de Campanhas" description="Analise o desempenho das suas campanhas" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total" value={stats?.total || 0} icon={<Megaphone className="h-4 w-4" />} />
        <StatCard title="Enviadas" value={stats?.sent || 0} icon={<Send className="h-4 w-4" />} variant="success" />
        <StatCard title="Agendadas" value={stats?.scheduled || 0} icon={<Clock className="h-4 w-4" />} variant="accent" />
        <StatCard title="Rascunhos" value={stats?.draft || 0} icon={<FileX className="h-4 w-4" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Campanhas por Mês</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip />
                  <Bar dataKey="enviadas" name="Enviadas" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Distribuição por Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Últimas Campanhas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enviada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent?.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.sent_at ? format(new Date(c.sent_at), 'dd/MM/yy HH:mm') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
