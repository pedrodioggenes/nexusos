import { TrendingUp, Building2, Package, CheckCircle, Clock, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SupplierPerformance {
  id: string;
  name: string;
  totalPackages: number;
  activePackages: number;
  completedItems: number;
  pendingItems: number;
  rejectedItems: number;
  approvalRate: number;
  totalValue: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

const mockPerformance: SupplierPerformance[] = [
  { id: 'nestle-001', name: 'Nestlé', totalPackages: 4, activePackages: 2, completedItems: 38, pendingItems: 2, rejectedItems: 2, approvalRate: 95, totalValue: 125000, trend: 'up', trendValue: 5 },
  { id: 'coca-001', name: 'Coca-Cola', totalPackages: 3, activePackages: 1, completedItems: 28, pendingItems: 5, rejectedItems: 4, approvalRate: 88, totalValue: 98000, trend: 'up', trendValue: 3 },
  { id: 'pg-001', name: 'P&G', totalPackages: 5, activePackages: 3, completedItems: 22, pendingItems: 12, rejectedItems: 9, approvalRate: 72, totalValue: 156000, trend: 'down', trendValue: -8 },
  { id: 'unilever-001', name: 'Unilever', totalPackages: 3, activePackages: 2, completedItems: 31, pendingItems: 4, rejectedItems: 3, approvalRate: 91, totalValue: 110000, trend: 'up', trendValue: 7 },
  { id: 'ambev-001', name: 'Ambev', totalPackages: 2, activePackages: 1, completedItems: 15, pendingItems: 8, rejectedItems: 5, approvalRate: 75, totalValue: 85000, trend: 'stable', trendValue: 0 },
];

const chartData = [
  { month: 'Jul', aprovados: 120, pendentes: 15, rejeitados: 8 },
  { month: 'Ago', aprovados: 135, pendentes: 12, rejeitados: 10 },
  { month: 'Set', aprovados: 148, pendentes: 18, rejeitados: 6 },
  { month: 'Out', aprovados: 142, pendentes: 14, rejeitados: 9 },
  { month: 'Nov', aprovados: 158, pendentes: 11, rejeitados: 7 },
  { month: 'Dez', aprovados: 156, pendentes: 16, rejeitados: 12 },
  { month: 'Jan', aprovados: 168, pendentes: 20, rejeitados: 8 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function PerformanceTrade() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('30d');

  const totalStats = {
    totalItems: mockPerformance.reduce((sum, s) => sum + s.completedItems + s.pendingItems + s.rejectedItems, 0),
    approvedItems: mockPerformance.reduce((sum, s) => sum + s.completedItems, 0),
    pendingItems: mockPerformance.reduce((sum, s) => sum + s.pendingItems, 0),
    rejectedItems: mockPerformance.reduce((sum, s) => sum + s.rejectedItems, 0),
    avgApprovalRate: Math.round(mockPerformance.reduce((sum, s) => sum + s.approvalRate, 0) / mockPerformance.length),
    totalValue: mockPerformance.reduce((sum, s) => sum + s.totalValue, 0),
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Performance Trade" 
        description="Dashboard de performance por fornecedor"
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Aprovados</p>
                <p className="text-xl font-bold text-success">{totalStats.approvedItems}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Pendentes</p>
                <p className="text-xl font-bold text-warning">{totalStats.pendingItems}</p>
              </div>
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Rejeitados</p>
                <p className="text-xl font-bold text-destructive">{totalStats.rejectedItems}</p>
              </div>
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Taxa Média</p>
                <p className="text-xl font-bold text-app-trade">{totalStats.avgApprovalRate}%</p>
              </div>
              <TrendingUp className="h-5 w-5 text-app-trade" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium">Evolução de Comprovações</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAprovados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Area type="monotone" dataKey="aprovados" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorAprovados)" />
                <Area type="monotone" dataKey="pendentes" stroke="hsl(var(--warning))" fillOpacity={0.2} fill="hsl(var(--warning))" />
                <Area type="monotone" dataKey="rejeitados" stroke="hsl(var(--destructive))" fillOpacity={0.2} fill="hsl(var(--destructive))" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Performance Table */}
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium">Performance por Fornecedor</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {mockPerformance.map((supplier) => (
              <div 
                key={supplier.id}
                onClick={() => navigate(`/app/trade/fornecedores/${supplier.id}`)}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:border-app-trade/50 transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-app-trade/20 to-app-trade/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-app-trade" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{supplier.name}</h3>
                    {supplier.trend === 'up' && (
                      <Badge variant="outline" className="text-[9px] border-success/30 text-success">
                        <ArrowUp className="h-2.5 w-2.5 mr-0.5" />
                        +{supplier.trendValue}%
                      </Badge>
                    )}
                    {supplier.trend === 'down' && (
                      <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive">
                        <ArrowDown className="h-2.5 w-2.5 mr-0.5" />
                        {supplier.trendValue}%
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-0.5">
                    <span>{supplier.totalPackages} pacotes</span>
                    <span>{supplier.completedItems} aprovados</span>
                    <span>{supplier.pendingItems} pendentes</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-success">{supplier.approvalRate}%</p>
                    <p className="text-[9px] text-muted-foreground">taxa</p>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full" 
                        style={{ width: `${supplier.approvalRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-app-trade">{formatCurrency(supplier.totalValue)}</p>
                    <p className="text-[9px] text-muted-foreground">valor</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
