/**
 * Shared presence context — single Realtime channel for the entire NexusDesk app.
 * Uses Realtime Presence as primary + DB polling as fallback for reliability.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceContextValue {
  onlineUsers: Set<string>;
  isOnline: (userId: string) => boolean;
}

const PresenceContext = createContext<PresenceContextValue>({
  onlineUsers: new Set(),
  isOnline: () => false,
});

const HEARTBEAT_INTERVAL = 30_000;   // 30s DB heartbeat
const DB_POLL_INTERVAL = 20_000;     // 20s poll other users
const ONLINE_THRESHOLD_MS = 120_000; // 2 min = consider online

export function HWPresenceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [realtimeIds, setRealtimeIds] = useState<Set<string>>(new Set());
  const [dbOnlineIds, setDbOnlineIds] = useState<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!user?.id) return;

    // --- 1. Realtime Presence ---
    // Remove any existing channel first to avoid duplicates
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel('hw-presence', {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!mountedRef.current) return;
        const state = channel.presenceState();
        const ids = new Set<string>(Object.keys(state));
        setRealtimeIds(ids);
        console.debug('[HWPresence] sync:', [...ids]);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (!mountedRef.current) return;
        console.debug('[HWPresence] join:', key);
        setRealtimeIds(prev => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (!mountedRef.current) return;
        console.debug('[HWPresence] leave:', key);
        setRealtimeIds(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status, err) => {
        console.debug('[HWPresence] subscribe status:', status, err || '');
        if (status === 'SUBSCRIBED' && mountedRef.current) {
          try {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
            console.debug('[HWPresence] tracked successfully');
          } catch (e) {
            console.warn('[HWPresence] track failed:', e);
          }
          // Persist to DB
          supabase
            .from('profiles')
            .update({ last_online_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .then(() => {});
        }
      });

    // --- 2. DB Heartbeat (write own last_online_at) ---
    const doHeartbeat = () => {
      supabase
        .from('profiles')
        .update({ last_online_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .then(() => {});
    };

    heartbeatRef.current = setInterval(doHeartbeat, HEARTBEAT_INTERVAL);

    // --- 3. DB Poll (read others' last_online_at as fallback) ---
    const doPoll = async () => {
      if (!mountedRef.current) return;
      try {
        const cutoff = new Date(Date.now() - ONLINE_THRESHOLD_MS).toISOString();
        const { data } = await supabase
          .from('profiles')
          .select('user_id')
          .gte('last_online_at', cutoff)
          .neq('user_id', user.id);
        if (data && mountedRef.current) {
          setDbOnlineIds(new Set(data.map(d => d.user_id)));
        }
      } catch {
        // ignore poll errors
      }
    };

    // Initial poll
    doPoll();
    pollRef.current = setInterval(doPoll, DB_POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (pollRef.current) clearInterval(pollRef.current);

      // Persist last_online_at on disconnect
      supabase
        .from('profiles')
        .update({ last_online_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .then(() => {});

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  // Merge realtime + DB fallback
  const onlineUsers = useMemo(() => {
    const merged = new Set(realtimeIds);
    for (const id of dbOnlineIds) {
      merged.add(id);
    }
    return merged;
  }, [realtimeIds, dbOnlineIds]);

  const isOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  return React.createElement(
    PresenceContext.Provider,
    { value: { onlineUsers, isOnline } },
    children
  );
}

export function useHWPresence() {
  return useContext(PresenceContext);
}
