/**
 * Lightweight hook that returns the total number of DM conversations
 * with unread messages for the current user.
 * Performance-optimized: single RPC replaces N+1 loop.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export function useHWUnreadCount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: count = 0 } = useQuery({
    queryKey: ['hw-unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Single RPC replaces N+1 loop (was: fetch participants → loop per conv → count)
      const { data, error } = await supabase.rpc('get_dm_unread_count', {
        p_user_id: user.id,
      });
      if (error) throw error;
      return (data as number) || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // Realtime: granular cache patch instead of full invalidation
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('hw-unread-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nexusdesk_dm_messages',
      }, (payload) => {
        const msg = payload.new as any;
        // Only increment if message is from someone else
        if (msg.user_id !== user.id) {
          queryClient.setQueryData<number>(['hw-unread-count', user.id], (old) => (old || 0) + 1);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nexusdesk_last_read',
      }, (payload) => {
        const lr = (payload.new || payload.old) as any;
        // When I mark something as read, refetch for accuracy
        if (lr?.user_id === user.id) {
          queryClient.invalidateQueries({ queryKey: ['hw-unread-count'] });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  return count;
}
