import { Instagram, Facebook, Youtube, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSocialMediaConnections, PLATFORM_CONFIGS } from '@/hooks/useSocialMediaConnections';

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: TikTokIcon,
};

interface SocialMediaDashboardCardsProps {
  className?: string;
}

export function SocialMediaDashboardCards({ className }: SocialMediaDashboardCardsProps) {
  const navigate = useNavigate();
  const { connections, metrics, isLoading, getLatestMetrics, connectedCount } = useSocialMediaConnections();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get connected platforms with their latest metrics
  const connectedPlatforms = connections
    .filter(c => c.is_connected)
    .map(connection => {
      const config = PLATFORM_CONFIGS.find(p => p.id === connection.platform);
      const latestMetrics = getLatestMetrics(connection.id);
      return { connection, config, metrics: latestMetrics };
    })
    .filter(p => p.config);

  // Calculate totals
  const totalFollowers = connectedPlatforms.reduce((sum, p) => {
    if (p.config?.id === 'youtube') {
      return sum + (p.metrics?.subscribers || 0);
    }
    return sum + (p.metrics?.followers || 0);
  }, 0);

  const avgEngagement = connectedPlatforms.length > 0
    ? connectedPlatforms.reduce((sum, p) => sum + (p.metrics?.engagement_rate || 0), 0) / connectedPlatforms.length
    : 0;

  if (isLoading) {
    return (
      <PremiumGlassCard className={cn("p-4", className)}>
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-module-gestao" />
        </div>
      </PremiumGlassCard>
    );
  }

  // No connections yet
  if (connectedCount === 0) {
    return (
      <PremiumGlassCard className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-module-gestao" />
            <h3 className="font-semibold text-foreground">Redes Sociais</h3>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Conecte suas redes sociais para acompanhar métricas
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/app/marketing/redes-sociais')}
            className="bg-module-gestao hover:bg-module-gestao/90"
          >
            Conectar Redes
          </Button>
        </div>
      </PremiumGlassCard>
    );
  }

  return (
    <PremiumGlassCard className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-module-gestao" />
          <h3 className="font-semibold text-foreground">Redes Sociais</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/marketing/redes-sociais')}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Ver detalhes
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <p className="text-2xl font-bold text-foreground">{formatNumber(totalFollowers)}</p>
          <p className="text-xs text-muted-foreground">Seguidores Total</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <p className="text-2xl font-bold text-foreground">{avgEngagement.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Engajamento Médio</p>
        </div>
      </div>

      {/* Platform Icons Row */}
      <div className="flex items-center justify-center gap-2">
        {connectedPlatforms.map(({ connection, config }) => {
          if (!config) return null;
          const Icon = PLATFORM_ICONS[config.icon];
          return (
            <div
              key={connection.id}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                config.bgColor
              )}
              title={config.name}
            >
              <Icon className="w-4 h-4" />
            </div>
          );
        })}
        {connectedCount < 4 && (
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8 rounded-lg border-dashed"
            onClick={() => navigate('/app/marketing/redes-sociais')}
          >
            <span className="text-lg text-muted-foreground">+</span>
          </Button>
        )}
      </div>
    </PremiumGlassCard>
  );
}
