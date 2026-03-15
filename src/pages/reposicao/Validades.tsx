import { Clock, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { BlurFade } from '@/components/ui/blur-fade';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useExpirationAlerts, useResolveExpirationAlert } from '@/hooks/useReplenishment';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function Validades() {
  const { tenant } = useAuth();
  const { data: alerts = [], isLoading } = useExpirationAlerts(tenant?.id);
  const { mutate: resolveAlert } = useResolveExpirationAlert();

  const getDaysUntilExpiration = (date: string) => {
    return differenceInDays(new Date(date), new Date());
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 3) return 'border-red-500/50 bg-red-500/5';
    if (days <= 7) return 'border-orange-500/50 bg-orange-500/5';
    if (days <= 14) return 'border-yellow-500/50 bg-yellow-500/5';
    return 'border-green-500/50 bg-green-500/5';
  };

  const getDaysBadgeColor = (days: number) => {
    if (days <= 3) return 'bg-red-500/20 text-red-500';
    if (days <= 7) return 'bg-orange-500/20 text-orange-500';
    if (days <= 14) return 'bg-yellow-500/20 text-yellow-500';
    return 'bg-green-500/20 text-green-500';
  };

  const handleResolve = (id: string, action: string) => {
    resolveAlert(
      { id, action, tenantId: tenant?.id || '' },
      {
        onSuccess: () => toast.success('Alerta resolvido'),
        onError: () => toast.error('Erro ao resolver alerta'),
      }
    );
  };

  const critical = alerts.filter(a => getDaysUntilExpiration(a.expiration_date) <= 3);
  const warning = alerts.filter(a => {
    const days = getDaysUntilExpiration(a.expiration_date);
    return days > 3 && days <= 7;
  });
  const upcoming = alerts.filter(a => getDaysUntilExpiration(a.expiration_date) > 7);

  return (
    <PageWrapper
      title="Controle de Validades"
      subtitle="Monitoramento FIFO/FEFO"
      icon={<Clock className="w-6 h-6" />}
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PremiumGlassCard className="p-6 border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-muted-foreground">Crítico (≤3 dias)</p>
            </div>
            <p className="text-3xl font-bold text-red-500">{critical.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6 border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-muted-foreground">Atenção (4-7 dias)</p>
            </div>
            <p className="text-3xl font-bold text-orange-500">{warning.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6 border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-muted-foreground">Próximos (8+ dias)</p>
            </div>
            <p className="text-3xl font-bold text-green-500">{upcoming.length}</p>
          </PremiumGlassCard>
        </div>

        {/* Lista de Alertas */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <PremiumGlassCard className="p-12 text-center border-green-500/30">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p className="text-muted-foreground">Nenhum produto próximo ao vencimento</p>
          </PremiumGlassCard>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, idx) => {
              const daysLeft = getDaysUntilExpiration(alert.expiration_date);
              return (
                <BlurFade key={alert.id} delay={0.05 * idx}>
                  <PremiumGlassCard className={`p-6 ${getUrgencyColor(daysLeft)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{alert.product_name}</h4>
                          <Badge className={getDaysBadgeColor(daysLeft)}>
                            {daysLeft <= 0 ? 'VENCIDO' : `${daysLeft} dias`}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">SKU</p>
                            <p className="font-medium">{alert.product_sku || '—'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Lote</p>
                            <p className="font-medium">{alert.batch_number || '—'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quantidade</p>
                            <p className="font-medium">{alert.quantity || '—'} un</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Vencimento</p>
                            <p className="font-medium">
                              {new Date(alert.expiration_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResolve(alert.id, 'sold')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Vendido
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-500 border-red-500"
                          onClick={() => handleResolve(alert.id, 'removed')}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Retirar
                        </Button>
                      </div>
                    </div>
                  </PremiumGlassCard>
                </BlurFade>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
