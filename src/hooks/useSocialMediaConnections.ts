import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'youtube';

export interface SocialMediaConnection {
  id: string;
  tenant_id: string | null;
  platform: SocialPlatform;
  account_name: string | null;
  account_id: string | null;
  profile_image_url: string | null;
  is_connected: boolean;
  connected_at: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaMetrics {
  id: string;
  connection_id: string;
  metric_date: string;
  followers: number;
  following: number;
  posts_count: number;
  engagement_rate: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  video_views: number;
  subscribers: number;
  watch_time_hours: number;
  raw_data: Record<string, unknown>;
  created_at: string;
}

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
  metrics: string[];
}

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    bgColor: 'bg-gradient-to-br from-[#833AB4] via-[#E4405F] to-[#FCAF45]',
    icon: 'instagram',
    metrics: ['followers', 'engagement_rate', 'reach', 'impressions'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    bgColor: 'bg-[#1877F2]',
    icon: 'facebook',
    metrics: ['followers', 'reach', 'likes', 'shares'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    bgColor: 'bg-gradient-to-br from-[#00F2EA] to-[#FF0050]',
    icon: 'tiktok',
    metrics: ['followers', 'video_views', 'likes', 'engagement_rate'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    bgColor: 'bg-[#FF0000]',
    icon: 'youtube',
    metrics: ['subscribers', 'video_views', 'watch_time_hours', 'engagement_rate'],
  },
];

export function useSocialMediaConnections() {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const connectionsQuery = useQuery({
    queryKey: ['social-media-connections', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_connections')
        .select('*')
        .order('platform');

      if (error) throw error;
      return data as SocialMediaConnection[];
    },
    enabled: !!tenant?.id,
  });

  const metricsQuery = useQuery({
    queryKey: ['social-media-metrics', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_metrics')
        .select('*')
        .order('metric_date', { ascending: false });

      if (error) throw error;
      return data as SocialMediaMetrics[];
    },
    enabled: !!tenant?.id,
  });

  const connectPlatform = useMutation({
    mutationFn: async ({ 
      platform, 
      accountName, 
      accountId,
      profileImageUrl 
    }: { 
      platform: SocialPlatform; 
      accountName: string;
      accountId?: string;
      profileImageUrl?: string;
    }) => {
      // Check if connection exists
      const { data: existing } = await supabase
        .from('social_media_connections')
        .select('id')
        .eq('platform', platform)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('social_media_connections')
          .update({
            account_name: accountName,
            account_id: accountId,
            profile_image_url: profileImageUrl,
            is_connected: true,
            connected_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('social_media_connections')
          .insert({
            tenant_id: tenant?.id,
            platform,
            account_name: accountName,
            account_id: accountId,
            profile_image_url: profileImageUrl,
            is_connected: true,
            connected_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social-media-connections'] });
      const config = PLATFORM_CONFIGS.find(p => p.id === variables.platform);
      toast({
        title: "Conta conectada",
        description: `${config?.name || variables.platform} foi conectado com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível conectar a conta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const disconnectPlatform = useMutation({
    mutationFn: async (platform: SocialPlatform) => {
      const { error } = await supabase
        .from('social_media_connections')
        .update({
          is_connected: false,
          access_token: null,
          refresh_token: null,
        })
        .eq('platform', platform);

      if (error) throw error;
    },
    onSuccess: (_, platform) => {
      queryClient.invalidateQueries({ queryKey: ['social-media-connections'] });
      const config = PLATFORM_CONFIGS.find(p => p.id === platform);
      toast({
        title: "Conta desconectada",
        description: `${config?.name || platform} foi desconectado.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar a conta.",
        variant: "destructive",
      });
    },
  });

  const updateMetrics = useMutation({
    mutationFn: async ({ 
      connectionId, 
      metrics 
    }: { 
      connectionId: string; 
      metrics: {
        followers?: number;
        following?: number;
        posts_count?: number;
        engagement_rate?: number;
        reach?: number;
        impressions?: number;
        likes?: number;
        comments?: number;
        shares?: number;
        video_views?: number;
        subscribers?: number;
        watch_time_hours?: number;
      };
    }) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if metrics exist for today
      const { data: existing } = await supabase
        .from('social_media_metrics')
        .select('id')
        .eq('connection_id', connectionId)
        .eq('metric_date', today)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('social_media_metrics')
          .update({
            followers: metrics.followers,
            following: metrics.following,
            posts_count: metrics.posts_count,
            engagement_rate: metrics.engagement_rate,
            reach: metrics.reach,
            impressions: metrics.impressions,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            video_views: metrics.video_views,
            subscribers: metrics.subscribers,
            watch_time_hours: metrics.watch_time_hours,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('social_media_metrics')
          .insert({
            connection_id: connectionId,
            metric_date: today,
            followers: metrics.followers || 0,
            following: metrics.following || 0,
            posts_count: metrics.posts_count || 0,
            engagement_rate: metrics.engagement_rate || 0,
            reach: metrics.reach || 0,
            impressions: metrics.impressions || 0,
            likes: metrics.likes || 0,
            comments: metrics.comments || 0,
            shares: metrics.shares || 0,
            video_views: metrics.video_views || 0,
            subscribers: metrics.subscribers || 0,
            watch_time_hours: metrics.watch_time_hours || 0,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      // Update last_sync_at
      await supabase
        .from('social_media_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', connectionId);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['social-media-connections'] });
    },
  });

  // Get connection status for each platform
  const getConnectionStatus = (platform: SocialPlatform) => {
    return connectionsQuery.data?.find(c => c.platform === platform && c.is_connected);
  };

  // Get latest metrics for a connection
  const getLatestMetrics = (connectionId: string) => {
    return metricsQuery.data?.find(m => m.connection_id === connectionId);
  };

  // Get connected platforms count
  const connectedCount = connectionsQuery.data?.filter(c => c.is_connected).length || 0;

  return {
    connections: connectionsQuery.data || [],
    metrics: metricsQuery.data || [],
    isLoading: connectionsQuery.isLoading,
    isLoadingMetrics: metricsQuery.isLoading,
    connectPlatform,
    disconnectPlatform,
    updateMetrics,
    getConnectionStatus,
    getLatestMetrics,
    connectedCount,
    refetch: () => {
      connectionsQuery.refetch();
      metricsQuery.refetch();
    },
  };
}
