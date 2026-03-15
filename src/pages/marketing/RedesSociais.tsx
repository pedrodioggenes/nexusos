import { useState } from 'react';
import { Share2, RefreshCw, TrendingUp, Users, Eye, Heart } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import { BlurFade } from '@/components/ui/blur-fade';
import {
  SocialPlatformCard,
  ConnectSocialDialog,
} from '@/components/marketing/social';
import {
  useSocialMediaConnections,
  PLATFORM_CONFIGS,
  type PlatformConfig,
  type SocialPlatform,
} from '@/hooks/useSocialMediaConnections';

export default function RedesSociais() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    connections,
    isLoading,
    connectPlatform,
    disconnectPlatform,
    updateMetrics,
    getConnectionStatus,
    getLatestMetrics,
    connectedCount,
    refetch,
  } = useSocialMediaConnections();

  const handleConnect = (platform: PlatformConfig) => {
    setSelectedPlatform(platform);
    setIsDialogOpen(true);
  };

  const handleConfirmConnect = (accountName: string) => {
    if (!selectedPlatform) return;

    connectPlatform.mutate(
      {
        platform: selectedPlatform.id,
        accountName,
      },
      {
        onSuccess: (data) => {
          setIsDialogOpen(false);
          setSelectedPlatform(null);

          // Add mock metrics for demo
          if (data?.id) {
            const mockMetrics = generateMockMetrics(selectedPlatform.id);
            updateMetrics.mutate({
              connectionId: data.id,
              metrics: mockMetrics,
            });
          }
        },
      }
    );
  };

  const handleDisconnect = (platform: SocialPlatform) => {
    disconnectPlatform.mutate(platform);
  };

  const handleSync = (connectionId: string, platform: SocialPlatform) => {
    // In a real implementation, this would call the platform's API
    const mockMetrics = generateMockMetrics(platform);
    updateMetrics.mutate({
      connectionId,
      metrics: mockMetrics,
    });
  };

  // Calculate totals for summary
  const totalFollowers = connections
    .filter(c => c.is_connected)
    .reduce((sum, c) => {
      const metrics = getLatestMetrics(c.id);
      if (c.platform === 'youtube') {
        return sum + (metrics?.subscribers || 0);
      }
      return sum + (metrics?.followers || 0);
    }, 0);

  const totalReach = connections
    .filter(c => c.is_connected)
    .reduce((sum, c) => {
      const metrics = getLatestMetrics(c.id);
      return sum + (metrics?.reach || 0);
    }, 0);

  const totalEngagement = connections
    .filter(c => c.is_connected)
    .reduce((sum, c) => {
      const metrics = getLatestMetrics(c.id);
      return sum + (metrics?.likes || 0) + (metrics?.comments || 0) + (metrics?.shares || 0);
    }, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
      return (
        <PageWrapper hideHeader className="min-h-full">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-gestao" />
          </div>
        </PageWrapper>
      );
  }

  return (
    <PageWrapper
      title="Redes Sociais"
      subtitle="Conecte e monitore suas redes sociais"
      actions={
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={updateMetrics.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${updateMetrics.isPending ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      }
    >

        {/* Summary Cards */}
        {connectedCount > 0 && (
          <BlurFade delay={0.05}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <PremiumGlassCard className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs">Redes Conectadas</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{connectedCount}</p>
              </PremiumGlassCard>

              <PremiumGlassCard className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Seguidores Total</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(totalFollowers)}</p>
              </PremiumGlassCard>

              <PremiumGlassCard className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs">Alcance Total</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(totalReach)}</p>
              </PremiumGlassCard>

              <PremiumGlassCard className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">Engajamentos</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(totalEngagement)}</p>
              </PremiumGlassCard>
            </div>
          </BlurFade>
        )}

        {/* Platform Cards */}
        <BlurFade delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_CONFIGS.map((config, index) => {
              const connection = getConnectionStatus(config.id);
              const metrics = connection ? getLatestMetrics(connection.id) : undefined;

              return (
                <BlurFade key={config.id} delay={0.1 + index * 0.05}>
                  <SocialPlatformCard
                    config={config}
                    connection={connection}
                    metrics={metrics}
                    onConnect={() => handleConnect(config)}
                    onDisconnect={() => handleDisconnect(config.id)}
                    onSync={connection ? () => handleSync(connection.id, config.id) : undefined}
                    isSyncing={updateMetrics.isPending}
                  />
                </BlurFade>
              );
            })}
          </div>
        </BlurFade>

        {/* Help Section */}
        <BlurFade delay={0.3}>
          <PremiumGlassCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-app-gestao/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-app-gestao" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Como funciona?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Conecte suas contas de redes sociais para acompanhar métricas de crescimento, 
                  engajamento e alcance diretamente no dashboard. As métricas são sincronizadas 
                  periodicamente para manter os dados atualizados.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-app-gestao font-bold">1.</span>
                    <span className="text-muted-foreground">Clique em "Conectar" na rede desejada</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-app-gestao font-bold">2.</span>
                    <span className="text-muted-foreground">Insira o nome de usuário da conta</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-app-gestao font-bold">3.</span>
                    <span className="text-muted-foreground">Acompanhe as métricas no dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </PremiumGlassCard>
        </BlurFade>

      {/* Connect Dialog */}
      <ConnectSocialDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        platform={selectedPlatform}
        onConnect={handleConfirmConnect}
        isConnecting={connectPlatform.isPending}
      />
    </PageWrapper>
  );
}

// Helper function to generate mock metrics for demo
function generateMockMetrics(platform: SocialPlatform) {
  const base = {
    followers: Math.floor(Math.random() * 50000) + 5000,
    following: Math.floor(Math.random() * 1000) + 100,
    posts_count: Math.floor(Math.random() * 500) + 50,
    engagement_rate: Math.random() * 5 + 1,
    reach: Math.floor(Math.random() * 100000) + 10000,
    impressions: Math.floor(Math.random() * 200000) + 20000,
    likes: Math.floor(Math.random() * 10000) + 1000,
    comments: Math.floor(Math.random() * 1000) + 100,
    shares: Math.floor(Math.random() * 500) + 50,
    video_views: 0,
    subscribers: 0,
    watch_time_hours: 0,
  };

  if (platform === 'youtube') {
    return {
      ...base,
      subscribers: Math.floor(Math.random() * 100000) + 10000,
      video_views: Math.floor(Math.random() * 1000000) + 100000,
      watch_time_hours: Math.floor(Math.random() * 10000) + 1000,
    };
  }

  if (platform === 'tiktok') {
    return {
      ...base,
      video_views: Math.floor(Math.random() * 500000) + 50000,
    };
  }

  return base;
}
