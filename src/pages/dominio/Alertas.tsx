import { AlertTriangle, CheckCircle, X, Clock, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { BlurFade } from '@/components/ui/blur-fade';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useStrategicAlerts, useDismissAlert } from '@/hooks/useExecutiveMetrics';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Alertas() {
  const { tenant } = useAuth();
  const { data: alerts = [], isLoading } = useStrategicAlerts(tenant?.id);
  const { mutate: dismissAlert } = useDismissAlert();

  const handleDismiss = (id: string) => {
    dismissAlert(
      { id, tenantId: tenant?.id || '' },
      {
        onSuccess: () => toast.success('Alerta dispensado'),
        onError: () => toast.error('Erro ao dispensar alerta'),
      }
    );
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: 'border-red-500/50 bg-red-500/10', badge: 'bg-red-500/20 text-red-500', icon: AlertTriangle };
      case 'high':
        return { color: 'border-orange-500/50 bg-orange-500/10', badge: 'bg-orange-500/20 text-orange-500', icon: AlertTriangle };
      case 'medium':
        return { color: 'border-yellow-500/50 bg-yellow-500/10', badge: 'bg-yellow-500/20 text-yellow-500', icon: Clock };
      default:
        return { color: 'border-blue-500/50 bg-blue-500/10', badge: 'bg-blue-500/20 text-blue-500', icon: Lightbulb };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'opportunity':
        return { icon: TrendingUp, label: 'Oportunidade' };
      case 'risk':
        return { icon: TrendingDown, label: 'Risco' };
      case 'deviation':
        return { icon: AlertTriangle, label: 'Desvio' };
      default:
        return { icon: Lightbulb, label: 'Recomendação' };
    }
  };

  const critical = alerts.filter(a => a.severity === 'critical');
  const high = alerts.filter(a => a.severity === 'high');
  const other = alerts.filter(a => !['critical', 'high'].includes(a.severity || ''));

  return (
    <PageWrapper
      title="Alertas Estratégicos"
      subtitle="Centro de alertas e recomendações"
      icon={<AlertTriangle className="w-6 h-6 text-orange-400" />}
    >
      <div className="space-y-6">
        {/* KPIs de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PremiumGlassCard className="p-6 border-red-500/30">
            <p className="text-sm text-muted-foreground mb-2">Críticos</p>
            <p className="text-3xl font-bold text-red-500">{critical.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6 border-orange-500/30">
            <p className="text-sm text-muted-foreground mb-2">Alta Prioridade</p>
            <p className="text-3xl font-bold text-orange-500">{high.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6 border-yellow-500/30">
            <p className="text-sm text-muted-foreground mb-2">Outros</p>
            <p className="text-3xl font-bold text-yellow-500">{other.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6 border-green-500/30">
            <p className="text-sm text-muted-foreground mb-2">Total Ativo</p>
            <p className="text-3xl font-bold text-green-500">{alerts.length}</p>
          </PremiumGlassCard>
        </div>

        {/* Lista de Alertas */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <PremiumGlassCard className="p-12 text-center border-green-500/30">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <p className="text-muted-foreground">Nenhum alerta ativo no momento</p>
            <p className="text-sm text-muted-foreground mt-2">O sistema está monitorando seus indicadores</p>
          </PremiumGlassCard>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, idx) => {
              const severityConfig = getSeverityConfig(alert.severity || 'low');
              const typeConfig = getTypeConfig(alert.type);
              const TypeIcon = typeConfig.icon;
              
              return (
                <BlurFade key={alert.id} delay={0.05 * idx}>
                  <PremiumGlassCard className={`p-6 ${severityConfig.color}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={severityConfig.badge}>
                            {alert.severity?.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />
                            {typeConfig.label}
                          </Badge>
                          {alert.source_module && (
                            <Badge variant="outline" className="text-xs">
                              {alert.source_module}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-lg mb-2">{alert.title}</h4>
                        {alert.description && (
                          <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Criado {formatDistanceToNow(new Date(alert.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDismiss(alert.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
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
