import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, Package, CheckCircle, Clock, XCircle, TrendingUp, Edit, MoreHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ActivityFeed } from '@/components/trade/ActivityFeed';
import { AuditTimeline } from '@/components/audit/AuditTimeline';

// Mock data - in production would fetch from API
const mockSupplierDetail = {
  id: 'nestle-001',
  name: 'Nestlé',
  cnpj: '60.409.075/0001-52',
  email: 'trade@nestle.com.br',
  phone: '(11) 4545-4545',
  isActive: true,
  createdAt: '2024-01-15',
  metrics: {
    totalPackages: 4,
    activePackages: 2,
    completedPackages: 2,
    totalValue: 125000,
    approvalRate: 95,
    pendingItems: 2,
    completedItems: 38,
    rejectedItems: 2,
  },
  packages: [
    { id: 'pkg-1', name: 'Campanha Páscoa 2026', status: 'active', progress: 75, value: 45000, startDate: '2026-01-15', endDate: '2026-04-30' },
    { id: 'pkg-2', name: 'Display Nescafé', status: 'active', progress: 40, value: 30000, startDate: '2026-01-01', endDate: '2026-03-31' },
    { id: 'pkg-3', name: 'Ponto Extra Maggi', status: 'completed', progress: 100, value: 25000, startDate: '2025-10-01', endDate: '2025-12-31' },
    { id: 'pkg-4', name: 'Natal Chocolate', status: 'completed', progress: 100, value: 25000, startDate: '2025-11-01', endDate: '2025-12-25' },
  ],
  roiHistory: [
    { month: 'Ago', roi: 85 },
    { month: 'Set', roi: 92 },
    { month: 'Out', roi: 88 },
    { month: 'Nov', roi: 105 },
    { month: 'Dez', roi: 120 },
    { month: 'Jan', roi: 150 },
  ],
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Ativo', color: 'border-success/30 text-success bg-success/10' };
    case 'completed':
      return { label: 'Concluído', color: 'border-primary/30 text-primary bg-primary/10' };
    case 'draft':
      return { label: 'Rascunho', color: 'border-muted text-muted-foreground bg-muted' };
    default:
      return { label: status, color: 'border-muted text-muted-foreground bg-muted' };
  }
};

export default function FornecedorDetail() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  
  // In production, fetch data based on supplierId
  const supplier = mockSupplierDetail;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/app/trade/fornecedores')}
        className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Fornecedores
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-module-trade/20 to-module-trade/10 flex items-center justify-center shrink-0">
            <Building2 className="h-7 w-7 text-module-trade" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{supplier.name}</h1>
              {supplier.isActive ? (
                <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-[10px]">Ativo</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">Inativo</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{supplier.cnpj}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {supplier.email}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {supplier.phone}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-module-trade" />
              <div>
                <p className="text-lg font-bold text-foreground">{supplier.metrics.totalPackages}</p>
                <p className="text-[10px] text-muted-foreground">Pacotes Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <div>
                <p className="text-lg font-bold text-success">{supplier.metrics.approvalRate}%</p>
                <p className="text-[10px] text-muted-foreground">Taxa Aprovação</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <p className="text-lg font-bold text-foreground">{supplier.metrics.pendingItems}</p>
                <p className="text-[10px] text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-lg font-bold text-module-trade">{formatCurrency(supplier.metrics.totalValue)}</p>
                <p className="text-[10px] text-muted-foreground">Valor Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="packages" className="text-xs">Pacotes</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Histórico</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-3">
          {supplier.packages.map((pkg) => {
            const statusConfig = getStatusConfig(pkg.status);
            return (
              <Card 
                key={pkg.id} 
                className="card-base hover:border-module-trade/30 cursor-pointer transition-colors"
                onClick={() => navigate(`/app/trade/pacotes/${pkg.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-foreground">{pkg.name}</h3>
                        <Badge variant="outline" className={`text-[9px] ${statusConfig.color}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(pkg.startDate).toLocaleDateString('pt-BR')} - {new Date(pkg.endDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{pkg.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-module-trade rounded-full" 
                            style={{ width: `${pkg.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-foreground">{formatCurrency(pkg.value)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="performance">
          <Card className="card-base">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium">Evolução do ROI</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={supplier.roiHistory}>
                    <defs>
                      <linearGradient id="colorROI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--module-trade))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--module-trade))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'ROI']}
                      contentStyle={{ 
                        background: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="roi" 
                      stroke="hsl(var(--module-trade))" 
                      fillOpacity={1} 
                      fill="url(#colorROI)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="card-base">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ActivityFeed limit={10} showViewAll={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <AuditTimeline 
            resourceType="suppliers" 
            resourceId={supplierId} 
            title="Histórico de Alterações"
            maxHeight="500px"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
