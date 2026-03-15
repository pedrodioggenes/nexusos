import { useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  CheckCircle2,
  Download,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTradePackagesWithStats } from "@/hooks/useTradePackages";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { exportToCSV } from "@/lib/csv-export";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Simulated sales multiplier for ROI calculation (demo purposes)
const simulateSales = (investment: number, seed: number): number => {
  // Use seed to generate consistent "random" multiplier between 2.5x and 5x
  const multiplier = 2.5 + ((seed * 7) % 25) / 10;
  return Math.round(investment * multiplier);
};

const calculateROI = (investment: number, sales: number): number => {
  if (investment === 0) return 0;
  return Math.round(((sales - investment) / investment) * 100);
};

export default function FornecedorRelatorios() {
  const { supplier } = useAuth();
  const { data: packages, isLoading } = useTradePackagesWithStats();

  // Filter packages for this supplier
  const supplierPackages = useMemo(() => {
    if (!packages || !supplier?.id) return [];
    return packages.filter(pkg => pkg.supplier_id === supplier.id);
  }, [packages, supplier]);

  // Calculate ROI data for each package
  const roiData = useMemo(() => {
    return supplierPackages.map((pkg, index) => {
      const investment = pkg.total_value || 0;
      const sales = simulateSales(investment, index + 1);
      const roi = calculateROI(investment, sales);
      
      return {
        id: pkg.id,
        name: pkg.name,
        periodStart: pkg.period_start,
        periodEnd: pkg.period_end,
        investment,
        sales,
        roi,
        status: pkg.status,
        completedItems: pkg.completedItems,
        totalItems: pkg.totalItems,
      };
    });
  }, [supplierPackages]);

  // Summary metrics
  const summary = useMemo(() => {
    const totalInvestment = roiData.reduce((sum, pkg) => sum + pkg.investment, 0);
    const totalSales = roiData.reduce((sum, pkg) => sum + pkg.sales, 0);
    const avgROI = totalInvestment > 0 ? calculateROI(totalInvestment, totalSales) : 0;
    const totalApproved = roiData.reduce((sum, pkg) => sum + pkg.completedItems, 0);

    return {
      totalInvestment,
      totalSales,
      avgROI,
      totalApproved,
    };
  }, [roiData]);

  // Chart data
  const chartData = useMemo(() => {
    return roiData.map(pkg => ({
      name: pkg.name.length > 15 ? pkg.name.substring(0, 15) + '...' : pkg.name,
      Investimento: pkg.investment,
      Vendas: pkg.sales,
    }));
  }, [roiData]);

  const handleExportCSV = () => {
    if (roiData.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const exportData = roiData.map(pkg => ({
      pacote: pkg.name,
      periodo: `${format(new Date(pkg.periodStart), 'MMM/yy', { locale: ptBR })} - ${format(new Date(pkg.periodEnd), 'MMM/yy', { locale: ptBR })}`,
      investimento: pkg.investment,
      vendas: pkg.sales,
      roi: `${pkg.roi}%`,
      status: pkg.status,
    }));

    exportToCSV(exportData, `relatorio-roi-${format(new Date(), 'yyyy-MM-dd')}`, [
      { key: 'pacote', label: 'Pacote' },
      { key: 'periodo', label: 'Período' },
      { key: 'investimento', label: 'Investimento (R$)' },
      { key: 'vendas', label: 'Vendas (R$)' },
      { key: 'roi', label: 'ROI' },
      { key: 'status', label: 'Status' },
    ]);

    toast.success("Relatório exportado com sucesso");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Ativo</Badge>;
      case 'completed':
        return <Badge variant="secondary">Concluído</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <PageHeader
        title="Relatórios"
        description="Acompanhe o retorno sobre o investimento em trade marketing"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Investimento Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.totalInvestment)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendas Geradas</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ROI Médio</p>
                    <p className="text-2xl font-bold">{summary.avgROI}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-violet-500/10">
                    <CheckCircle2 className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Itens Aprovados</p>
                    <p className="text-2xl font-bold">{summary.totalApproved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance por Pacote
            </CardTitle>
            <CardDescription>Comparativo de investimento e vendas geradas</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex flex-col justify-end gap-2 p-4">
              <div className="flex items-end gap-4 h-full">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-1 flex gap-2">
                    <Skeleton className="flex-1" style={{ height: `${40 + Math.random() * 50}%` }} />
                    <Skeleton className="flex-1" style={{ height: `${60 + Math.random() * 35}%` }} />
                  </div>
                ))}
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum pacote encontrado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="Investimento" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Vendas" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ROI Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Pacote</CardTitle>
          <CardDescription>ROI calculado para cada pacote de trade marketing</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Investimento</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : roiData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pacote encontrado para este fornecedor
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Investimento</TableHead>
                  <TableHead className="text-right">Vendas</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roiData.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>
                      {format(new Date(pkg.periodStart), 'MMM/yy', { locale: ptBR })} - {format(new Date(pkg.periodEnd), 'MMM/yy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(pkg.investment)}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      {formatCurrency(pkg.sales)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={pkg.roi >= 200 ? 'text-green-600 font-bold' : 'font-medium'}>
                        {pkg.roi}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(pkg.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Note */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Nota:</strong> Os valores de vendas e ROI são estimativas baseadas em simulações. 
            Os dados reais serão integrados quando o aplicativo de vendas estiver conectado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
