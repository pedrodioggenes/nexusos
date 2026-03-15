/**
 * useHWIncomingMessages — Listens for incoming DMs via Supabase Realtime
 * and exposes the latest unread message for the global message banner.
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { IncomingMessageData } from '@/components/nexusdesk/comms/GlobalMessageBanner';

export function useHWIncomingMessages(currentView: string) {
  const { user } = useAuth();
  const [incomingMessage, setIncomingMessage] = useState<IncomingMessageData | null>(null);
  const currentViewRef = useRef(currentView);
  currentViewRef.current = currentView;

  const dismiss = useCallback(() => setIncomingMessage(null), []);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('hw-global-msg-banner')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nexusdesk_dm_messages',
      }, async (payload) => {
        const msg = payload.new as any;
        // Don't show banner for own messages
        if (msg.user_id === user.id) return;

        // Optionally skip if already in messages view
        // (user might be in a different conversation though, so we show it)

        // Fetch sender profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('user_id', msg.user_id)
          .maybeSingle();

        const name = profile?.full_name || profile?.email || 'Usuário';
        const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

        setIncomingMessage({
          id: msg.id,
          senderName: name,
          senderAvatar: profile?.avatar_url || undefined,
          senderInitials: initials,
          preview: msg.content || 'Enviou um anexo',
          conversationId: msg.conversation_id,
          timestamp: msg.created_at,
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return { incomingMessage, dismiss };
}
