import { Users, Megaphone, UserCheck, UserMinus, UserX, TrendingUp, Calendar, Send, Clock, FileX, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { AIInsightCard } from '@/components/marketing/AIInsightCard';
import { PremiumAuroraBackground } from '@/components/ofertas/PremiumAuroraBackground';
import { BlurFade } from '@/components/ui/blur-fade';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import {
  useDashboardStats, 
  useContactsByUnit, 
  useContactsPerDay, 
  useRecentCampaigns,
  useCampaignStats,
  useCampaignsPerMonth,
  useContactGrowth,
  useContactStatusDistribution
} from '@/hooks/useDashboard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Sparkline data
const sparklineData = [
  { value: 120 }, { value: 135 }, { value: 148 }, { value: 162 }, 
  { value: 175 }, { value: 188 }, { value: 205 }
];

export default function OfertasHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: contactsByUnit, isLoading: loadingByUnit } = useContactsByUnit();
  const { data: contactsPerDay, isLoading: loadingPerDay } = useContactsPerDay();
  const { data: recentCampaigns, isLoading: loadingCampaigns } = useRecentCampaigns();
  const { data: campaignStats, isLoading: loadingCampaignStats } = useCampaignStats();
  const { data: campaignsPerMonth, isLoading: loadingPerMonth } = useCampaignsPerMonth();
  const { data: contactGrowth, isLoading: loadingGrowth } = useContactGrowth();
  const { data: statusDistribution, isLoading: loadingStatus } = useContactStatusDistribution();

  const displayName = user?.email?.split('@')[0] || 'Usuário';
  const isLoading = loadingStats || loadingCampaignStats;

  // Metric cards configuration
  const metricCards = [
    {
      title: 'Total Contatos',
      value: stats?.total || 0,
      change: `+${stats?.newLast7Days || 0} últimos 7 dias`,
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Ativos',
      value: stats?.active || 0,
      change: `${Math.round(((stats?.active || 0) / (stats?.total || 1)) * 100)}% da base`,
      changeType: 'positive' as const,
      icon: UserCheck,
    },
    {
      title: 'Campanhas Enviadas',
      value: campaignStats?.sent || 0,
      change: `${campaignStats?.scheduled || 0} agendadas`,
      changeType: 'neutral' as const,
      icon: Send,
    },
    {
      title: 'Total Campanhas',
      value: campaignStats?.total || 0,
      change: `${campaignStats?.draft || 0} rascunhos`,
      changeType: 'neutral' as const,
      icon: Megaphone,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-premium rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color || entry.fill }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-premium rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-medium" style={{ color: payload[0].payload.fill }}>
            {payload[0].name}: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <PremiumAuroraBackground className="min-h-full">
      <div className="space-y-6">
        {/* Premium Header */}
        <BlurFade delay={0}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Bem-vindo, {displayName}! 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestão de Ofertas - Visão Geral
              </p>
            </div>
            <Button 
              onClick={() => navigate('/app/ofertas/campanhas')}
              className="bg-module-ofertas hover:bg-module-ofertas/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </div>
        </BlurFade>

        {/* AI Insight Card */}
        <BlurFade delay={0.05}>
          <AIInsightCard
            type="dashboard"
            moduleColor="ofertas"
            prompt="Analise as métricas de campanhas e contatos do Ofertas para identificar oportunidades de melhoria e tendências importantes."
            contextData={{ stats, campaignStats }}
          />
        </BlurFade>

        {/* KPI Metric Cards - Premium Glass Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((stat, index) => (
            <PremiumGlassCard
              key={stat.title}
              hasShimmer
              delay={0.1 + index * 0.05}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value.toLocaleString('pt-BR')}
                  </p>
                  <p className={`text-xs mt-1 ${
                    stat.changeType === 'positive' ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-module-ofertas/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-module-ofertas" />
                </div>
              </div>
              
              {/* Mini Sparkline */}
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`sparkline-ofertas-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--module-ofertas))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--module-ofertas))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--module-ofertas))" 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill={`url(#sparkline-ofertas-${index})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </PremiumGlassCard>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BlurFade delay={0.25}>
            <PremiumGlassCard className="p-0 overflow-hidden">
              <div className="p-5 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground">Crescimento da Base</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Novos contatos por mês</p>
              </div>
              <div className="p-5 h-[200px]">
                {loadingGrowth ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={contactGrowth || []} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorNovosOfertas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--module-ofertas))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--module-ofertas))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="novos" 
                        name="Novos"
                        stroke="hsl(var(--module-ofertas))" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorNovosOfertas)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </PremiumGlassCard>
          </BlurFade>

          <BlurFade delay={0.3}>
            <PremiumGlassCard className="p-0 overflow-hidden">
              <div className="p-5 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground">Campanhas por Mês</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Criadas vs Enviadas</p>
              </div>
              <div className="p-5 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={campaignsPerMonth || []} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                      iconSize={8}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="total" 
                      name="Criadas"
                      fill="hsl(var(--muted-foreground))" 
                      fillOpacity={0.3}
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="enviadas" 
                      name="Enviadas"
                      fill="hsl(var(--success))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </PremiumGlassCard>
          </BlurFade>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BlurFade delay={0.35} className="lg:col-span-2">
            <PremiumGlassCard className="p-0 overflow-hidden h-full">
              <div className="p-5 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground">Contatos por Unidade</h3>
              </div>
              <div className="p-5 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contactsByUnit || []} layout="vertical" margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      width={80}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="count" 
                      name="Contatos"
                      fill="hsl(var(--module-ofertas))" 
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PremiumGlassCard>
          </BlurFade>

          <BlurFade delay={0.4}>
            <PremiumGlassCard className="p-0 overflow-hidden h-full">
              <div className="p-5 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground">Status Contatos</h3>
              </div>
              <div className="p-5 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Pie
                      data={statusDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {(statusDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px' }}
                      iconSize={8}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </PremiumGlassCard>
          </BlurFade>

          <BlurFade delay={0.45}>
            <PremiumGlassCard className="p-0 overflow-hidden h-full">
              <div className="p-5 border-b border-border/50">
                <h3 className="text-sm font-semibold text-foreground">Cadastros/Dia</h3>
              </div>
              <div className="p-5 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={contactsPerDay || []} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Cadastros"
                      stroke="hsl(var(--module-ofertas))" 
                      strokeWidth={2}
                      dot={{ r: 3, fill: 'hsl(var(--module-ofertas))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </PremiumGlassCard>
          </BlurFade>
        </div>

        {/* Recent Campaigns Table */}
        <BlurFade delay={0.5}>
          <PremiumGlassCard className="p-0 overflow-hidden">
            <div className="p-5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Campanhas Recentes</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Últimas 5 campanhas</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => navigate('/app/ofertas/campanhas')}
                >
                  Ver todas
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {loadingCampaigns ? (
                <div className="p-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full mb-2" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Título</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Tipo</TableHead>
                      <TableHead className="text-xs text-right">Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(recentCampaigns || []).slice(0, 5).map((campaign) => (
                      <TableRow key={campaign.id} className="cursor-pointer hover:bg-muted/30">
                        <TableCell className="text-xs font-medium">{campaign.title}</TableCell>
                        <TableCell>
                          <StatusBadge status={campaign.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground capitalize">
                          WhatsApp
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground text-right">
                          {format(new Date(campaign.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!recentCampaigns || recentCampaigns.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-8">
                          Nenhuma campanha encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </PremiumGlassCard>
        </BlurFade>
      </div>
    </PremiumAuroraBackground>
  );
}
