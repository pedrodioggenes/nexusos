import { PieChart as PieChartIcon, DollarSign, TrendingUp, Building2, Package, ArrowUp, ArrowDown } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface SupplierROI {
  id: string;
  name: string;
  investment: number;
  revenue: number;
  roi: number;
  packages: number;
  trend: 'up' | 'down' | 'stable';
}

const mockROIData: SupplierROI[] = [
  { id: 'nestle-001', name: 'Nestlé', investment: 125000, revenue: 312500, roi: 150, packages: 4, trend: 'up' },
  { id: 'coca-001', name: 'Coca-Cola', investment: 98000, revenue: 215600, roi: 120, packages: 3, trend: 'up' },
  { id: 'pg-001', name: 'P&G', investment: 156000, revenue: 280800, roi: 80, packages: 5, trend: 'down' },
  { id: 'unilever-001', name: 'Unilever', investment: 110000, revenue: 253000, roi: 130, packages: 3, trend: 'up' },
  { id: 'ambev-001', name: 'Ambev', investment: 85000, revenue: 161500, roi: 90, packages: 2, trend: 'stable' },
];

const pieData = [
  { name: 'Nestlé', value: 312500, color: 'hsl(var(--success))' },
  { name: 'Coca-Cola', value: 215600, color: 'hsl(var(--warning))' },
  { name: 'P&G', value: 280800, color: 'hsl(var(--destructive))' },
  { name: 'Unilever', value: 253000, color: 'hsl(var(--accent))' },
  { name: 'Ambev', value: 161500, color: 'hsl(var(--primary))' },
];

const monthlyData = [
  { month: 'Jul', investimento: 420000, receita: 924000 },
  { month: 'Ago', investimento: 380000, receita: 874000 },
  { month: 'Set', investimento: 450000, receita: 1035000 },
  { month: 'Out', investimento: 410000, receita: 902000 },
  { month: 'Nov', investimento: 520000, receita: 1248000 },
  { month: 'Dez', investimento: 480000, receita: 1104000 },
  { month: 'Jan', investimento: 574000, receita: 1223400 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatCompact = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

export default function ROITrade() {
  const [period, setPeriod] = useState('30d');

  const totalStats = {
    totalInvestment: mockROIData.reduce((sum, s) => sum + s.investment, 0),
    totalRevenue: mockROIData.reduce((sum, s) => sum + s.revenue, 0),
    avgROI: Math.round(mockROIData.reduce((sum, s) => sum + s.roi, 0) / mockROIData.length),
    totalPackages: mockROIData.reduce((sum, s) => sum + s.packages, 0),
  };

  const overallROI = Math.round((totalStats.totalRevenue - totalStats.totalInvestment) / totalStats.totalInvestment * 100);

  return (
    <div className="space-y-4">
      <PageHeader 
        title="ROI Trade Marketing" 
        description="Análise de retorno sobre investimento em trade"
        actions={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
                <p className="text-[10px] text-muted-foreground uppercase">Investimento</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalStats.totalInvestment)}</p>
              </div>
              <DollarSign className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Receita Gerada</p>
                <p className="text-lg font-bold text-success">{formatCurrency(totalStats.totalRevenue)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">ROI Geral</p>
                <p className="text-lg font-bold text-app-trade">{overallROI}%</p>
              </div>
              <PieChartIcon className="h-5 w-5 text-app-trade" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-base">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Pacotes</p>
                <p className="text-lg font-bold text-foreground">{totalStats.totalPackages}</p>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <Card className="card-base">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium">Receita por Fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      background: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-[10px] text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="card-base">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-medium">Investimento vs Receita</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                    tickFormatter={(value) => formatCompact(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      background: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="investimento" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI by Supplier */}
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium">ROI por Fornecedor</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {mockROIData.sort((a, b) => b.roi - a.roi).map((supplier) => (
              <div 
                key={supplier.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-app-trade/20 to-app-trade/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-app-trade" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{supplier.name}</h3>
                    {supplier.trend === 'up' && (
                      <ArrowUp className="h-3.5 w-3.5 text-success" />
                    )}
                    {supplier.trend === 'down' && (
                      <ArrowDown className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{supplier.packages} pacotes</p>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-xs font-medium text-warning">{formatCurrency(supplier.investment)}</p>
                    <p className="text-[9px] text-muted-foreground">investido</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-success">{formatCurrency(supplier.revenue)}</p>
                    <p className="text-[9px] text-muted-foreground">receita</p>
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${supplier.roi >= 100 ? 'text-success' : supplier.roi >= 50 ? 'text-warning' : 'text-destructive'}`}>
                      {supplier.roi}%
                    </p>
                    <p className="text-[9px] text-muted-foreground">ROI</p>
                  </div>
                </div>

                <div className="w-24 shrink-0">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${supplier.roi >= 100 ? 'bg-success' : supplier.roi >= 50 ? 'bg-warning' : 'bg-destructive'}`}
                      style={{ width: `${Math.min(supplier.roi, 200) / 2}%` }}
                    />
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
