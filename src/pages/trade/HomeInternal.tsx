import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FileCheck, Image, Clock, CheckCircle, AlertCircle, Plus, Eye, ArrowRight, TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AIInsightCard } from '@/components/marketing/AIInsightCard';
import { ActivityFeed } from '@/components/trade/ActivityFeed';
import { SupplierDetailSheet } from '@/components/trade/SupplierDetailSheet';
import { CreatePackageDialog } from '@/components/trade/CreatePackageDialog';
import { PremiumAuroraBackground } from '@/components/trade/PremiumAuroraBackground';
import { BlurFade } from '@/components/ui/blur-fade';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { SolidCard, SolidCardContent, SolidCardHeader, SolidCardTitle } from '@/components/ui/solid-card';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Demo chart data
const roiChartData = [
  { name: 'Jan', roi: 180, value: 45000 },
  { name: 'Fev', roi: 195, value: 52000 },
  { name: 'Mar', roi: 210, value: 48000 },
  { name: 'Abr', roi: 205, value: 61000 },
  { name: 'Mai', roi: 220, value: 55000 },
  { name: 'Jun', roi: 240, value: 67000 },
  { name: 'Jul', roi: 258, value: 72000 },
];

// Sparkline data
const sparklineData = [
  { value: 5 }, { value: 7 }, { value: 8 }, { value: 10 }, 
  { value: 9 }, { value: 11 }, { value: 12 }
];

export default function TradeHomeInternal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreatePackageOpen, setIsCreatePackageOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isSupplierSheetOpen, setIsSupplierSheetOpen] = useState(false);

  const displayName = user?.email?.split('@')[0] || 'Usuário';

  // Mock stats for internal users
  const stats = [
    { 
      label: 'Pacotes Ativos', 
      value: '12', 
      icon: Package, 
      trend: '+3 este mês', 
      changeType: 'positive' as const,
      path: '/app/trade/pacotes?status=active'
    },
    { 
      label: 'Itens Pendentes', 
      value: '47', 
      icon: Clock, 
      trend: '8 vencendo hoje', 
      changeType: 'neutral' as const,
      path: '/app/trade/checklists?status=pending'
    },
    { 
      label: 'Aprovados', 
      value: '156', 
      icon: CheckCircle, 
      trend: '89% taxa', 
      changeType: 'positive' as const,
      path: '/app/trade/comprovacoes?status=approved'
    },
    { 
      label: 'ROI Médio', 
      value: '258%', 
      icon: TrendingUp, 
      trend: '+18% vs mês anterior', 
      changeType: 'positive' as const,
      path: '/app/trade/roi'
    },
  ];

  // Mock suppliers with IDs for navigation
  const supplierPerformance = [
    { id: 'nestle-001', name: 'Nestlé', completion: 95, packages: 4, pending: 2, value: 125000 },
    { id: 'coca-001', name: 'Coca-Cola', completion: 88, packages: 3, pending: 5, value: 98000 },
    { id: 'pg-001', name: 'P&G', completion: 72, packages: 5, pending: 12, value: 156000 },
  ];

  const handleSupplierClick = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setIsSupplierSheetOpen(true);
  };

  const handleViewSupplierDetail = (supplierId: string) => {
    navigate(`/app/trade/fornecedores/${supplierId}`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-premium rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}%</span>
            </p>
          ))}
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
                Gestão de Trade Marketing - Visão Geral
              </p>
            </div>
            <Button 
              onClick={() => setIsCreatePackageOpen(true)}
              className="bg-module-trade hover:bg-module-trade/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Pacote
            </Button>
          </div>
        </BlurFade>

        {/* AI Insight Card */}
        <BlurFade delay={0.05}>
          <AIInsightCard
            type="trade"
            moduleColor="trade"
            prompt="Analise o desempenho dos fornecedores no Trade e identifique gargalos no processo de comprovações, pacotes pendentes e oportunidades de melhoria."
            contextData={{ stats }}
          />
        </BlurFade>

        {/* KPI Metric Cards - Premium Glass Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <PremiumGlassCard
              key={stat.label}
              hasShimmer
              delay={0.1 + index * 0.05}
              onClick={() => navigate(stat.path)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                  <p className={`text-xs mt-1 ${
                    stat.changeType === 'positive' ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {stat.trend}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-module-trade/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-module-trade" />
                </div>
              </div>
              
              {/* Mini Sparkline */}
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`sparkline-trade-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--module-trade))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--module-trade))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--module-trade))" 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill={`url(#sparkline-trade-${index})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </PremiumGlassCard>
          ))}
        </div>

        {/* Main Chart + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ROI Chart */}
          <BlurFade delay={0.25} className="lg:col-span-2">
            <PremiumGlassCard className="p-0 overflow-hidden">
              <div className="p-5 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">ROI por Período</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Performance dos últimos 7 meses</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    +18% vs anterior
                  </Badge>
                </div>
              </div>
              <div className="p-5 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={roiChartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRoiTrade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--module-trade))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--module-trade))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      tickLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="roi" 
                      name="ROI"
                      stroke="hsl(var(--module-trade))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRoiTrade)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </PremiumGlassCard>
          </BlurFade>

          {/* Activity Feed */}
          <BlurFade delay={0.3}>
            <PremiumGlassCard className="p-0 overflow-hidden h-full">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Atividade Recente</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => navigate('/app/trade/alertas')}
                  >
                    Ver todas
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <ActivityFeed limit={4} showViewAll={false} />
              </div>
            </PremiumGlassCard>
          </BlurFade>
        </div>

        {/* Quick Actions + Supplier Performance */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <BlurFade delay={0.35}>
            <PremiumGlassCard className="h-full">
              <h3 className="text-sm font-semibold text-foreground mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline"
                  onClick={() => setIsCreatePackageOpen(true)}
                  className="w-full justify-start border-module-trade/30 hover:bg-module-trade/10 hover:text-module-trade"
                >
                  <Plus className="h-4 w-4 mr-2 text-module-trade" />
                  Criar Novo Pacote
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/app/trade/comprovacoes?status=pending')}
                  className="w-full justify-start"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Revisar Pendentes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/app/trade/comprovacoes')}
                  className="w-full justify-start"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Ver Comprovações
                </Button>
              </div>
            </PremiumGlassCard>
          </BlurFade>

          {/* Supplier Performance */}
          <BlurFade delay={0.4} className="lg:col-span-2">
            <PremiumGlassCard className="p-0 overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Performance por Fornecedor</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      Últimos 30 dias
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => navigate('/app/trade/fornecedores')}
                    >
                      Ver todos
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {supplierPerformance.map((supplier) => (
                    <motion.div 
                      key={supplier.id} 
                      onClick={() => handleSupplierClick(supplier.id)}
                      className="p-4 rounded-xl cursor-pointer transition-all duration-200 group bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-module-trade/30"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-module-trade transition-colors">
                          {supplier.name}
                        </span>
                        <span className="text-sm font-bold text-success">{supplier.completion}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-muted mb-3">
                        <div 
                          className="h-full bg-success rounded-full transition-all" 
                          style={{ width: `${supplier.completion}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{supplier.packages} pacotes</span>
                        <span>{supplier.pending} pendentes</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Valor Total</span>
                          <span className="text-xs font-medium text-foreground">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(supplier.value)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-3 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSupplierDetail(supplier.id);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </PremiumGlassCard>
          </BlurFade>
        </div>

        {/* Dialogs & Sheets */}
        <CreatePackageDialog 
          open={isCreatePackageOpen} 
          onOpenChange={setIsCreatePackageOpen} 
        />

        <SupplierDetailSheet
          supplierId={selectedSupplierId}
          open={isSupplierSheetOpen}
          onOpenChange={setIsSupplierSheetOpen}
          onViewDetail={handleViewSupplierDetail}
        />
      </div>
    </PremiumAuroraBackground>
  );
}
