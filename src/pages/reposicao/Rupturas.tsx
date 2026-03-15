import { useState } from 'react';
import { AlertTriangle, Plus, CheckCircle } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { BlurFade } from '@/components/ui/blur-fade';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRuptureRecords } from '@/hooks/useReplenishment';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Rupturas() {
  const { tenant } = useAuth();
  const { data: ruptures = [], isLoading } = useRuptureRecords(tenant?.id);

  const activeRuptures = ruptures.filter(r => !r.resolved_at);
  const resolvedRuptures = ruptures.filter(r => r.resolved_at);

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      out_of_stock: 'Sem Estoque',
      supplier_delay: 'Atraso Fornecedor',
      damaged: 'Avariado',
      other: 'Outro',
    };
    return labels[reason] || reason;
  };

  return (
    <PageWrapper
      title="Controle de Rupturas"
      subtitle="Registro e acompanhamento de falta de produtos"
      icon={<AlertTriangle className="w-6 h-6" />}
      actions={
        <Button className="bg-gradient-to-r from-red-500 to-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Ruptura
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PremiumGlassCard className="p-6 border-red-500/30">
            <p className="text-sm text-muted-foreground mb-2">Rupturas Ativas</p>
            <p className="text-3xl font-bold text-red-500">{activeRuptures.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6 border-green-500/30">
            <p className="text-sm text-muted-foreground mb-2">Resolvidas (30 dias)</p>
            <p className="text-3xl font-bold text-green-500">{resolvedRuptures.length}</p>
          </PremiumGlassCard>
          <PremiumGlassCard className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Taxa de Resolução</p>
            <p className="text-3xl font-bold">
              {ruptures.length > 0 
                ? Math.round((resolvedRuptures.length / ruptures.length) * 100) 
                : 0}%
            </p>
          </PremiumGlassCard>
        </div>

        {/* Lista de Rupturas Ativas */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Rupturas Ativas
          </h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : activeRuptures.length === 0 ? (
            <PremiumGlassCard className="p-8 text-center border-green-500/30">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">Nenhuma ruptura ativa no momento</p>
            </PremiumGlassCard>
          ) : (
            <div className="space-y-4">
              {activeRuptures.map((rupture, idx) => (
                <BlurFade key={rupture.id} delay={0.05 * idx}>
                  <PremiumGlassCard className="p-6 border-red-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{rupture.product_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          SKU: {rupture.product_sku || '—'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-red-500 border-red-500">
                            {getReasonLabel(rupture.reason || 'other')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Detectada {formatDistanceToNow(new Date(rupture.detected_at || rupture.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolver
                      </Button>
                    </div>
                  </PremiumGlassCard>
                </BlurFade>
              ))}
            </div>
          )}
        </div>

        {/* Histórico Resolvido */}
        {resolvedRuptures.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Resolvidas Recentemente
            </h3>
            <div className="space-y-4">
              {resolvedRuptures.slice(0, 5).map((rupture) => (
                <PremiumGlassCard key={rupture.id} className="p-4 opacity-70">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rupture.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Resolvida em {new Date(rupture.resolved_at || '').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500">Resolvida</Badge>
                  </div>
                </PremiumGlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
