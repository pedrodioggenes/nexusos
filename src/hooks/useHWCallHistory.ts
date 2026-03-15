/**
 * Hook to fetch call history for the current user.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface CallHistoryItem {
  id: string;
  call_type: 'voice' | 'video';
  is_group: boolean;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
  initiated_by: string;
  other_participants: {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    status: string;
  }[];
  is_outgoing: boolean;
}

export function useHWCallHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['hw-call-history', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<CallHistoryItem[]> => {
      if (!user?.id) return [];

      // Get all calls where user is a participant
      const { data: participations } = await supabase
        .from('hw_call_participants')
        .select('call_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!participations?.length) return [];

      const callIds = participations.map(p => p.call_id);

      // Get call details
      const { data: calls } = await supabase
        .from('hw_calls')
        .select('*')
        .in('id', callIds)
        .order('created_at', { ascending: false });

      if (!calls?.length) return [];

      // Get all participants for these calls
      const { data: allParticipants } = await supabase
        .from('hw_call_participants')
        .select('call_id, user_id, role, status')
        .in('call_id', callIds);

      // Get profile info for other participants
      const otherUserIds = new Set<string>();
      allParticipants?.forEach(p => {
        if (p.user_id !== user.id) otherUserIds.add(p.user_id);
      });

      const { data: profiles } = otherUserIds.size > 0
        ? await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .in('user_id', [...otherUserIds])
        : { data: [] };

      const profileMap = new Map<string, { user_id: string; full_name: string; avatar_url: string | null }>(
        (profiles || []).map(p => [p.user_id, p] as [string, typeof p])
      );

      return calls.map(call => ({
        id: call.id,
        call_type: call.call_type as 'voice' | 'video',
        is_group: call.is_group,
        status: call.status,
        started_at: call.started_at,
        ended_at: call.ended_at,
        duration_seconds: call.duration_seconds,
        created_at: call.created_at,
        initiated_by: call.initiated_by,
        is_outgoing: call.initiated_by === user.id,
        other_participants: (allParticipants || [])
          .filter(p => p.call_id === call.id && p.user_id !== user.id)
          .map(p => {
            const profile = profileMap.get(p.user_id);
            return {
              user_id: p.user_id,
              full_name: profile?.full_name || 'Usuário',
              avatar_url: profile?.avatar_url || null,
              role: p.role,
              status: p.status,
            };
          }),
      }));
    },
    refetchInterval: 30000,
  });
}
