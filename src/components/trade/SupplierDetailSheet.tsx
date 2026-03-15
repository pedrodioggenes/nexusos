import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Package, FileCheck, TrendingUp, ArrowRight, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SupplierDetailSheetProps {
  supplierId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetail: (supplierId: string) => void;
}

// Mock supplier data - in production would fetch from API
const mockSupplierData: Record<string, {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  isActive: boolean;
  metrics: {
    totalPackages: number;
    activePackages: number;
    totalValue: number;
    approvalRate: number;
    pendingItems: number;
    completedItems: number;
    rejectedItems: number;
  };
  recentPackages: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
  }>;
}> = {
  'nestle-001': {
    id: 'nestle-001',
    name: 'Nestlé',
    cnpj: '60.409.075/0001-52',
    email: 'trade@nestle.com.br',
    phone: '(11) 4545-4545',
    isActive: true,
    metrics: {
      totalPackages: 4,
      activePackages: 2,
      totalValue: 125000,
      approvalRate: 95,
      pendingItems: 2,
      completedItems: 38,
      rejectedItems: 2,
    },
    recentPackages: [
      { id: 'pkg-1', name: 'Campanha Páscoa 2026', status: 'active', progress: 75 },
      { id: 'pkg-2', name: 'Display Nescafé', status: 'active', progress: 40 },
      { id: 'pkg-3', name: 'Ponto Extra Maggi', status: 'completed', progress: 100 },
    ],
  },
  'coca-001': {
    id: 'coca-001',
    name: 'Coca-Cola',
    cnpj: '45.997.418/0001-53',
    email: 'trade@coca-cola.com.br',
    phone: '(11) 3333-3333',
    isActive: true,
    metrics: {
      totalPackages: 3,
      activePackages: 1,
      totalValue: 98000,
      approvalRate: 88,
      pendingItems: 5,
      completedItems: 28,
      rejectedItems: 4,
    },
    recentPackages: [
      { id: 'pkg-4', name: 'Campanha Verão 2026', status: 'active', progress: 60 },
      { id: 'pkg-5', name: 'Display Sprite', status: 'completed', progress: 100 },
    ],
  },
  'pg-001': {
    id: 'pg-001',
    name: 'P&G',
    cnpj: '12.123.123/0001-12',
    email: 'trade@pg.com.br',
    phone: '(11) 2222-2222',
    isActive: true,
    metrics: {
      totalPackages: 5,
      activePackages: 3,
      totalValue: 156000,
      approvalRate: 72,
      pendingItems: 12,
      completedItems: 22,
      rejectedItems: 9,
    },
    recentPackages: [
      { id: 'pkg-6', name: 'Limpeza 2026', status: 'active', progress: 30 },
      { id: 'pkg-7', name: 'Higiene Pessoal', status: 'active', progress: 55 },
      { id: 'pkg-8', name: 'Linha Premium', status: 'draft', progress: 0 },
    ],
  },
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

export function SupplierDetailSheet({ supplierId, open, onOpenChange, onViewDetail }: SupplierDetailSheetProps) {
  const supplier = supplierId ? mockSupplierData[supplierId] : null;

  if (!supplier) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-app-trade/20 to-app-trade/10 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-app-trade" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg">{supplier.name}</SheetTitle>
                {supplier.isActive ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{supplier.cnpj}</p>
            </div>
          </div>
        </SheetHeader>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {supplier.email}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {supplier.phone}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Card className="card-base">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-app-trade" />
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
                  <p className="text-lg font-bold text-foreground">{supplier.metrics.approvalRate}%</p>
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
                  <p className="text-lg font-bold text-foreground">{supplier.metrics.completedItems}</p>
                  <p className="text-[10px] text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Value */}
        <Card className="card-base mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Valor Total Negociado</span>
              <span className="text-sm font-bold text-app-trade">{formatCurrency(supplier.metrics.totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Packages */}
        <div className="mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Pacotes Recentes</p>
          <div className="space-y-2">
            {supplier.recentPackages.map((pkg) => {
              const statusConfig = getStatusConfig(pkg.status);
              return (
                <div key={pkg.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground">{pkg.name}</span>
                    <Badge variant="outline" className={`text-[9px] ${statusConfig.color}`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-app-trade rounded-full" 
                        style={{ width: `${pkg.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{pkg.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full bg-app-trade hover:bg-app-trade/90"
          onClick={() => {
            onOpenChange(false);
            onViewDetail(supplier.id);
          }}
        >
          Ver Página Completa
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </SheetContent>
    </Sheet>
  );
}
