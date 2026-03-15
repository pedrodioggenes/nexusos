/**
 * Hook for activity indicators (typing / recording audio) using Supabase Realtime Presence.
 * No database tables needed — pure ephemeral presence state.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type PresenceActivity = 'typing' | 'recording_audio';

export interface TypingUser {
  user_id: string;
  user_name: string;
  activity: PresenceActivity;
}

export function useHWTyping(conversationId?: string) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const channel = supabase.channel(`typing:${conversationId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const others: TypingUser[] = [];
        for (const [userId, presences] of Object.entries(state)) {
          if (userId === user.id) continue;
          const p = (presences as any[])[0];
          if (p?.activity) {
            others.push({
              user_id: userId,
              user_name: p.user_name || 'Alguém',
              activity: p.activity as PresenceActivity,
            });
          }
        }
        setTypingUsers(others);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ activity: null, user_name: '' });
        }
      });

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, user?.id]);

  const setActivity = useCallback((activity: PresenceActivity, userName: string) => {
    if (!channelRef.current) return;
    isActiveRef.current = true;
    channelRef.current.track({ activity, user_name: userName });

    // Auto-clear after timeout (3s for typing, 5min for recording)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const timeout = activity === 'recording_audio' ? 300_000 : 3_000;
    typingTimeoutRef.current = setTimeout(() => {
      stopActivity();
    }, timeout);
  }, []);

  const stopActivity = useCallback(() => {
    if (!channelRef.current) return;
    isActiveRef.current = false;
    channelRef.current.track({ activity: null, user_name: '' });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  /** Backwards-compatible: call on every keystroke */
  const onKeystroke = useCallback((userName: string) => {
    if (!channelRef.current) return;

    if (!isActiveRef.current) {
      isActiveRef.current = true;
      channelRef.current.track({ activity: 'typing', user_name: userName });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopActivity();
    }, 3000);
  }, [stopActivity]);

  /** Backwards compat alias */
  const stopTyping = stopActivity;

  return { typingUsers, onKeystroke, stopTyping, setActivity, stopActivity };
}
