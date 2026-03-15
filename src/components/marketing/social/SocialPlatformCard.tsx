import { useState } from 'react';
import { Instagram, Facebook, Youtube, Link2, Unlink, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SocialMediaConnection, SocialMediaMetrics, PlatformConfig } from '@/hooks/useSocialMediaConnections';

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

interface SocialPlatformCardProps {
  config: PlatformConfig;
  connection?: SocialMediaConnection;
  metrics?: SocialMediaMetrics;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export function SocialPlatformCard({
  config,
  connection,
  metrics,
  onConnect,
  onDisconnect,
  onSync,
  isSyncing,
}: SocialPlatformCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = PLATFORM_ICONS[config.icon];
  const isConnected = connection?.is_connected;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getMainMetric = () => {
    if (!metrics) return null;
    if (config.id === 'youtube') {
      return { label: 'Inscritos', value: formatNumber(metrics.subscribers || 0) };
    }
    return { label: 'Seguidores', value: formatNumber(metrics.followers || 0) };
  };

  const mainMetric = getMainMetric();

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isConnected 
          ? "border-border/50 bg-card/50" 
          : "border-dashed border-muted-foreground/30 bg-muted/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
              config.bgColor
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{config.name}</h3>
              {isConnected && connection?.account_name && (
                <p className="text-sm text-muted-foreground">@{connection.account_name}</p>
              )}
            </div>
          </div>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={cn(
              "text-xs",
              isConnected && "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            )}
          >
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Badge>
        </div>

        {/* Metrics */}
        {isConnected && metrics ? (
          <div className="space-y-3">
            {/* Main metric */}
            {mainMetric && (
              <div className="text-center py-3 bg-muted/30 rounded-lg">
                <p className="text-3xl font-bold text-foreground">{mainMetric.value}</p>
                <p className="text-xs text-muted-foreground">{mainMetric.label}</p>
              </div>
            )}

            {/* Secondary metrics */}
            <div className="grid grid-cols-2 gap-2">
              {metrics.engagement_rate > 0 && (
                <div className="text-center p-2 bg-muted/20 rounded-md">
                  <p className="text-sm font-semibold text-foreground">{metrics.engagement_rate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Engajamento</p>
                </div>
              )}
              {metrics.reach > 0 && (
                <div className="text-center p-2 bg-muted/20 rounded-md">
                  <p className="text-sm font-semibold text-foreground">{formatNumber(metrics.reach)}</p>
                  <p className="text-xs text-muted-foreground">Alcance</p>
                </div>
              )}
              {config.id === 'youtube' && metrics.video_views > 0 && (
                <div className="text-center p-2 bg-muted/20 rounded-md">
                  <p className="text-sm font-semibold text-foreground">{formatNumber(metrics.video_views)}</p>
                  <p className="text-xs text-muted-foreground">Visualizações</p>
                </div>
              )}
              {config.id === 'tiktok' && metrics.video_views > 0 && (
                <div className="text-center p-2 bg-muted/20 rounded-md">
                  <p className="text-sm font-semibold text-foreground">{formatNumber(metrics.video_views)}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              )}
            </div>

            {/* Last sync */}
            {connection?.last_sync_at && (
              <p className="text-xs text-muted-foreground text-center">
                Última sincronização: {format(new Date(connection.last_sync_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
              </p>
            )}
          </div>
        ) : isConnected ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Aguardando sincronização...</p>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Conecte sua conta para ver métricas</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {isConnected ? (
            <>
              {onSync && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onSync}
                  disabled={isSyncing}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isSyncing && "animate-spin")} />
                  Sincronizar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={onDisconnect}
              >
                <Unlink className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              className={cn("w-full", config.bgColor, "text-white hover:opacity-90")}
              onClick={onConnect}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Conectar {config.name}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Hover effect */}
      {isHovered && isConnected && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{ 
            background: `linear-gradient(135deg, ${config.color}40, transparent)` 
          }}
        />
      )}
    </Card>
  );
}
