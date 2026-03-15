/**
 * Hook to fetch and cache channel governance configuration
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type MessageType = 'normal' | 'comunicado' | 'pedido' | 'comprovação';

export interface ChannelGovernance {
  id: string;
  channel_id: string;
  tenant_id: string;
  allowed_types: MessageType[];
  suggested_template: string | null;
  auto_suggest_comprovacao: boolean;
}

export function useChannelGovernance(channelId?: string) {
  const { tenant } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['channel-governance', channelId, tenant?.id],
    queryFn: async () => {
      if (!channelId || !tenant?.id) return null;

      const { data, error } = await (supabase as any)
        .from('nexusdesk_channel_governance')
        .select('*')
        .eq('channel_id', channelId)
        .eq('tenant_id', tenant.id)
        .maybeSingle();

      if (error) {
        console.error('Failed to load channel governance:', error);
        return null;
      }

      return data as unknown as ChannelGovernance | null;
    },
    enabled: !!channelId && !!tenant?.id,
    staleTime: 1000 * 60 * 10,
  });

  return {
    governance: data ?? null,
    isLoading,
    allowedTypes: (data?.allowed_types ?? ['normal', 'comunicado', 'pedido', 'comprovação']) as MessageType[],
    suggestedTemplate: data?.suggested_template ?? null,
    autoSuggestComprovacao: data?.auto_suggest_comprovacao ?? false,
  };
}
