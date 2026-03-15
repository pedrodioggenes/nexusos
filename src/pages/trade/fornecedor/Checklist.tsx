import { FileCheck, CheckCircle, Clock, XCircle, Upload, ChevronRight, AlertCircle, Package } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function FornecedorChecklist() {
  const navigate = useNavigate();
  const { supplier } = useAuth();

  const packages = [
    {
      id: '1',
      name: 'Campanha Verão 2026',
      deadline: '15/02/2026',
      progress: 50,
      items: [
        { id: '1', title: 'Display Ilha Central', status: 'approved', dueDate: '10/01/2026' },
        { id: '2', title: 'Ponto Extra Entrada', status: 'pending_review', dueDate: '12/01/2026' },
        { id: '3', title: 'Material PDV Caixa', status: 'pending', dueDate: '15/01/2026' },
        { id: '4', title: 'Wobbler Corredor', status: 'pending', dueDate: '18/01/2026' },
      ]
    },
    {
      id: '2',
      name: 'Ativação de Marca',
      deadline: '28/02/2026',
      progress: 0,
      items: [
        { id: '5', title: 'Geladeira Exclusiva', status: 'rejected', dueDate: '08/01/2026', reason: 'Foto sem data visível' },
        { id: '6', title: 'Totem de Entrada', status: 'pending', dueDate: '14/01/2026' },
        { id: '7', title: 'Adesivo de Chão', status: 'pending', dueDate: '20/01/2026' },
      ]
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { 
          icon: CheckCircle, 
          label: 'Aprovado', 
          color: 'text-success', 
          bgColor: 'bg-success/10 border-success/30',
          canUpload: false 
        };
      case 'pending_review':
        return { 
          icon: Clock, 
          label: 'Em revisão', 
          color: 'text-warning', 
          bgColor: 'bg-warning/10 border-warning/30',
          canUpload: false 
        };
      case 'pending':
        return { 
          icon: Clock, 
          label: 'Pendente', 
          color: 'text-muted-foreground', 
          bgColor: 'bg-muted border-border',
          canUpload: true 
        };
      case 'rejected':
        return { 
          icon: XCircle, 
          label: 'Rejeitado', 
          color: 'text-destructive', 
          bgColor: 'bg-destructive/10 border-destructive/30',
          canUpload: true 
        };
      default:
        return { 
          icon: Clock, 
          label: status, 
          color: 'text-muted-foreground', 
          bgColor: 'bg-muted border-border',
          canUpload: true 
        };
    }
  };

  // Calculate overall stats
  const allItems = packages.flatMap(p => p.items);
  const stats = {
    total: allItems.length,
    approved: allItems.filter(i => i.status === 'approved').length,
    pending: allItems.filter(i => i.status === 'pending').length,
    pendingReview: allItems.filter(i => i.status === 'pending_review').length,
    rejected: allItems.filter(i => i.status === 'rejected').length,
  };

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Checklist" 
        description={supplier ? `Itens de execução · ${supplier.name}` : 'Itens de execução e comprovação'}
      />

      {/* Overall Progress */}
      <Card className="card-base">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium">Progresso Geral</h3>
              <p className="text-xs text-muted-foreground">
                {stats.approved} de {stats.total} itens aprovados
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {Math.round((stats.approved / stats.total) * 100)}%
              </p>
            </div>
          </div>
          <Progress 
            value={(stats.approved / stats.total) * 100} 
            className="h-2"
          />
          <div className="flex items-center justify-between mt-3 text-[10px]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-success" />
                {stats.approved} aprovados
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-warning" />
                {stats.pendingReview} em revisão
              </span>
              <span className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                {stats.pending} pendentes
              </span>
              {stats.rejected > 0 && (
                <span className="flex items-center gap-1 text-destructive">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  {stats.rejected} rejeitados
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages */}
      <div className="space-y-4">
        {packages.map((pkg) => {
          const pkgStats = {
            approved: pkg.items.filter(i => i.status === 'approved').length,
            total: pkg.items.length,
          };
          const pkgProgress = (pkgStats.approved / pkgStats.total) * 100;
          const hasRejected = pkg.items.some(i => i.status === 'rejected');
          
          return (
            <Card 
              key={pkg.id} 
              className={`card-base ${hasRejected ? 'border-destructive/30' : ''}`}
            >
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-success" />
                    <CardTitle className="text-xs font-medium">{pkg.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">
                      Prazo: {pkg.deadline}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] ${
                        pkgProgress === 100 
                          ? 'bg-success/10 text-success border-success/30' 
                          : 'bg-muted'
                      }`}
                    >
                      {pkgStats.approved}/{pkgStats.total} aprovados
                    </Badge>
                  </div>
                </div>
                <Progress value={pkgProgress} className="h-1 mt-2" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-1.5">
                  {pkg.items.map((item) => {
                    const statusConfig = getStatusConfig(item.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                          item.status === 'rejected' 
                            ? 'bg-destructive/5 border-destructive/20' 
                            : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                        }`}
                      >
                        <StatusIcon className={`h-4 w-4 shrink-0 ${statusConfig.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-muted-foreground">
                              Vence em {item.dueDate}
                            </p>
                            {(item as { reason?: string }).reason && (
                              <>
                                <span className="text-[10px] text-muted-foreground">·</span>
                                <span className="text-[10px] text-destructive flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {(item as { reason: string }).reason}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] shrink-0 ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </Badge>
                        {statusConfig.canUpload ? (
                          <Button 
                            size="sm" 
                            className="h-7 text-[10px] gap-1 bg-success hover:bg-success/90 shrink-0"
                            onClick={() => navigate('/app/trade/fornecedor/comprovacoes')}
                          >
                            <Upload className="h-3 w-3" />
                            {item.status === 'rejected' ? 'Reenviar' : 'Enviar'}
                          </Button>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
