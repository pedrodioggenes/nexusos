/**
 * Hook for NexusDesk DM conversations + messages
 * Performance-optimized: uses batched RPCs, granular cache patching, and optimistic updates.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useCallback, useState } from 'react';
import { sendPushToUser } from '@/lib/push-sender';

export interface DMConversation {
  id: string;
  tenant_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_initials: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  last_message_is_mine?: boolean;
  last_message_read_by_other?: boolean;
  last_message_status?: MessageStatus;
  created_at: string;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface DMAttachment {
  url: string;
  path?: string;
  name: string;
  type: string;
  size?: number;
  source?: 'upload' | 'workspace';
}

export interface DMMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  attachments: { url: string; name?: string; type?: string }[];
  created_at: string;
  user_name: string;
  user_initials: string;
  user_avatar?: string;
  reactions: { emoji: string; count: number; hasReacted: boolean }[];
  is_mine?: boolean;
  is_read?: boolean;
  is_optimistic?: boolean;
  status?: MessageStatus;
}

/** Helper: fetch profiles by user IDs and return a Map */
async function fetchProfileMap(userIds: string[]) {
  if (!userIds.length) return new Map<string, { full_name: string; email: string; avatar_url?: string }>();
  const { data } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, avatar_url')
    .in('user_id', userIds);
  const map = new Map<string, { full_name: string; email: string; avatar_url?: string }>();
  for (const p of (data || [])) {
    map.set(p.user_id, p as any);
  }
  return map;
}

const CONV_QUERY_KEY = 'nexusdesk-dm-conversations';

export function useHWDMConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: [CONV_QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Single RPC replaces 6+ sequential queries + N+1 loop
      const { data, error } = await supabase.rpc('get_dm_conversations_for_user', {
        p_user_id: user.id,
      });
      if (error) throw error;
      if (!data?.length) return [];

      return (data as any[]).map((row): DMConversation => {
        const lastMsgIsMine = row.last_message_user_id === user.id;

        let lastMsgStatus: MessageStatus = 'sent';
        if (lastMsgIsMine && row.last_message_at) {
          const msgTime = new Date(row.last_message_at).getTime();
          const otherReadAt = row.other_last_read_at ? new Date(row.other_last_read_at).getTime() : 0;
          const otherOnline = row.other_last_online_at ? new Date(row.other_last_online_at).getTime() : 0;

          if (otherReadAt >= msgTime) {
            lastMsgStatus = 'read';
          } else if (otherOnline >= msgTime) {
            lastMsgStatus = 'delivered';
          }
        }

        return {
          id: row.id,
          tenant_id: row.tenant_id,
          other_user_id: row.other_user_id,
          other_user_name: row.other_user_name,
          other_user_initials: row.other_user_initials,
          other_user_avatar: row.other_user_avatar,
          last_message: row.last_message,
          last_message_at: row.last_message_at,
          last_message_is_mine: lastMsgIsMine,
          last_message_read_by_other: lastMsgStatus === 'read',
          last_message_status: lastMsgStatus,
          created_at: row.created_at,
        };
      });
    },
    enabled: !!user?.id,
  });

  // Realtime: granular cache patching instead of full invalidation
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('hw-dm-conv-realtime')
      // New messages → patch the conversation's last_message in cache
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nexusdesk_dm_messages',
      }, (payload) => {
        const msg = payload.new as any;
        queryClient.setQueryData<DMConversation[]>([CONV_QUERY_KEY, user.id], (old) => {
          if (!old) return old;
          const idx = old.findIndex(c => c.id === msg.conversation_id);
          if (idx === -1) {
            // New conversation we don't have yet — full refetch
            queryClient.invalidateQueries({ queryKey: [CONV_QUERY_KEY] });
            return old;
          }
          const updated = [...old];
          const conv = { ...updated[idx] };
          conv.last_message = msg.content;
          conv.last_message_at = msg.created_at;
          conv.last_message_is_mine = msg.user_id === user.id;
          conv.last_message_status = msg.user_id === user.id ? 'sent' : conv.last_message_status;
          conv.last_message_read_by_other = false;
          updated[idx] = conv;
          // Re-sort: most recent first
          updated.sort((a, b) => {
            const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : new Date(a.created_at).getTime();
            const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : new Date(b.created_at).getTime();
            return tb - ta;
          });
          return updated;
        });
      })
      // Read markers → patch read status
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nexusdesk_last_read',
      }, (payload) => {
        const lr = (payload.new || payload.old) as any;
        if (!lr?.dm_conversation_id) return;
        // If the other user read our message, update status to 'read'
        if (lr.user_id !== user.id) {
          queryClient.setQueryData<DMConversation[]>([CONV_QUERY_KEY, user.id], (old) => {
            if (!old) return old;
            return old.map(c => {
              if (c.id !== lr.dm_conversation_id) return c;
              if (!c.last_message_is_mine) return c;
              return { ...c, last_message_status: 'read' as MessageStatus, last_message_read_by_other: true };
            });
          });
        }
      })
      // Profile changes (avatar, last_online_at)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
      }, (payload) => {
        const profile = payload.new as any;
        queryClient.setQueryData<DMConversation[]>([CONV_QUERY_KEY, user.id], (old) => {
          if (!old) return old;
          return old.map(c => {
            if (c.other_user_id !== profile.user_id) return c;
            const updated = { ...c };
            if (profile.avatar_url !== undefined) updated.other_user_avatar = profile.avatar_url;
            // Check delivery status upgrade
            if (updated.last_message_is_mine && updated.last_message_status === 'sent' && profile.last_online_at) {
              const msgTime = updated.last_message_at ? new Date(updated.last_message_at).getTime() : 0;
              if (new Date(profile.last_online_at).getTime() >= msgTime) {
                updated.last_message_status = 'delivered';
              }
            }
            return updated;
          });
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const startConversation = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const existing = conversations.find(c => c.other_user_id === otherUserId);
      if (existing) return existing.id;

      const { data, error } = await supabase.rpc('create_dm_conversation', {
        p_other_user_id: otherUserId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONV_QUERY_KEY] });
    },
  });

  return { conversations, isLoading, startConversation };
}

export function useHWDMMessages(conversationId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['nexusdesk-dm-messages', conversationId];
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!conversationId) return [];

      // Fetch messages + reactions (no FK join to profiles)
      const { data, error } = await (supabase as any)
        .from('nexusdesk_dm_messages')
        .select('*, nexusdesk_dm_reactions(emoji, user_id)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (error) throw error;

      // Fetch profiles for all message authors
      const authorIds = [...new Set((data || []).map((m: any) => m.user_id))] as string[];
      const profileMap = await fetchProfileMap(authorIds);

      // Get read markers
      const { data: readMarkers } = await (supabase as any)
        .from('nexusdesk_last_read')
        .select('user_id, last_read_at')
        .eq('dm_conversation_id', conversationId);

      const otherReadAt = (readMarkers || [])
        .filter(r => r.user_id !== user?.id)
        .map(r => new Date(r.last_read_at).getTime())
        .sort((a, b) => b - a)[0] || 0;

      // Get other user's last_online_at for delivery tracking
      const { data: participants } = await (supabase as any)
        .from('nexusdesk_dm_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', user?.id || '');
      
      let otherLastOnline = 0;
      let foundOtherUserId: string | null = null;
      if (participants?.length) {
        foundOtherUserId = participants[0].user_id;
        setOtherUserId(foundOtherUserId);
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('last_online_at')
          .eq('user_id', foundOtherUserId)
          .maybeSingle();
        if (otherProfile?.last_online_at) {
          otherLastOnline = new Date(otherProfile.last_online_at).getTime();
        }
      }

      return (data || []).map((m: any) => {
        const profile = profileMap.get(m.user_id);
        const name = profile?.full_name || profile?.email?.split('@')[0] || 'Usuário';
        const reactionMap: Record<string, { count: number; hasReacted: boolean }> = {};
        for (const r of (m.nexusdesk_dm_reactions || [])) {
          if (!reactionMap[r.emoji]) reactionMap[r.emoji] = { count: 0, hasReacted: false };
          reactionMap[r.emoji].count++;
          if (r.user_id === user?.id) reactionMap[r.emoji].hasReacted = true;
        }

        const isMine = m.user_id === user?.id;
        const msgTime = new Date(m.created_at).getTime();

        let status: MessageStatus = 'sent';
        if (isMine) {
          if (otherReadAt >= msgTime) {
            status = 'read';
          } else if (otherLastOnline >= msgTime) {
            status = 'delivered';
          }
        }

        return {
          id: m.id,
          conversation_id: m.conversation_id,
          user_id: m.user_id,
          content: m.content,
          attachments: m.attachments || [],
          created_at: m.created_at,
          user_name: isMine ? 'Você' : name,
          user_initials: isMine ? 'VC' : name.slice(0, 2).toUpperCase(),
          user_avatar: profile?.avatar_url || undefined,
          reactions: Object.entries(reactionMap).map(([emoji, data]) => ({ emoji, ...data })),
          is_mine: isMine,
          is_read: isMine ? otherReadAt >= msgTime : false,
          status,
        } as DMMessage;
      });
    },
    enabled: !!conversationId,
  });

  // Reusable mark-read function — optimistic update
  const markReadNow = useCallback(async () => {
    if (!conversationId || !user?.id) return;

    const now = new Date().toISOString();

    // Optimistic: patch unread count and conversation status immediately
    queryClient.setQueryData<number>(['hw-unread-count', user.id], (old) => Math.max((old || 0) - 1, 0));

    const { data: existing } = await (supabase as any)
      .from('nexusdesk_last_read')
      .select('id')
      .eq('dm_conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await (supabase as any)
        .from('nexusdesk_last_read')
        .update({ last_read_at: now })
        .eq('id', existing.id);
    } else {
      await (supabase as any)
        .from('nexusdesk_last_read')
        .insert({
          dm_conversation_id: conversationId,
          user_id: user.id,
          last_read_at: now,
        });
    }
  }, [conversationId, user?.id, queryClient]);

  // Mark conversation as read when opening
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    markReadNow();
  }, [conversationId, user?.id, markReadNow]);

  // Realtime: granular cache patching
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`hw-dm-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nexusdesk_dm_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as any;
        // Auto-mark as read if from other user
        if (newMsg.user_id !== user?.id) {
          markReadNow();
        }
        // Patch: append message to cache if not already there (avoid duplicating optimistic)
        queryClient.setQueryData<DMMessage[]>(queryKey, (old) => {
          if (!old) return old;
          // If this is a server confirmation of an optimistic message, replace it
          const optimisticIdx = old.findIndex(m => m.is_optimistic && m.user_id === newMsg.user_id);
          if (optimisticIdx !== -1 && newMsg.user_id === user?.id) {
            // Full refetch to get proper profile data + reactions
            queryClient.invalidateQueries({ queryKey });
            return old;
          }
          // If already exists (e.g. from our own insert), skip
          if (old.some(m => m.id === newMsg.id)) return old;
          // For messages from OTHER users, we need profile data — refetch
          queryClient.invalidateQueries({ queryKey });
          return old;
        });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nexusdesk_dm_reactions',
      }, () => {
        queryClient.invalidateQueries({ queryKey });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nexusdesk_last_read',
        filter: `dm_conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const lr = (payload.new || payload.old) as any;
        // If other user read our messages, patch status to 'read'
        if (lr?.user_id !== user?.id) {
          const readAt = lr?.last_read_at ? new Date(lr.last_read_at).getTime() : 0;
          queryClient.setQueryData<DMMessage[]>(queryKey, (old) => {
            if (!old) return old;
            return old.map(m => {
              if (!m.is_mine) return m;
              const msgTime = new Date(m.created_at).getTime();
              if (readAt >= msgTime && m.status !== 'read') {
                return { ...m, status: 'read' as MessageStatus, is_read: true };
              }
              return m;
            });
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient, user?.id, markReadNow, queryKey]);

  // Realtime: other user's profile for delivery status + avatar
  useEffect(() => {
    if (!conversationId || !otherUserId) return;

    const profileChannel = supabase
      .channel(`hw-dm-profile-${otherUserId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${otherUserId}`,
      }, (payload) => {
        const profile = payload.new as any;
        const otherOnline = profile.last_online_at ? new Date(profile.last_online_at).getTime() : 0;
        // Patch delivery status on messages
        queryClient.setQueryData<DMMessage[]>(queryKey, (old) => {
          if (!old) return old;
          let changed = false;
          const updated = old.map(m => {
            if (!m.is_mine || m.status !== 'sent') return m;
            const msgTime = new Date(m.created_at).getTime();
            if (otherOnline >= msgTime) {
              changed = true;
              return { ...m, status: 'delivered' as MessageStatus };
            }
            return m;
          });
          return changed ? updated : old;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(profileChannel); };
  }, [conversationId, otherUserId, queryClient, queryKey]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, attachments }: { content: string; attachments?: DMAttachment[] }) => {
      if (!conversationId || !user?.id) throw new Error('Not authenticated');
      const { error } = await (supabase as any).from('nexusdesk_dm_messages').insert({
        conversation_id: conversationId,
        user_id: user.id,
        content,
        attachments: attachments && attachments.length > 0 ? JSON.stringify(attachments) : null,
      });
      if (error) throw error;
    },
    onMutate: async ({ content, attachments }: { content: string; attachments?: DMAttachment[] }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<DMMessage[]>(queryKey);
      const optimisticMsg: DMMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId!,
        user_id: user!.id,
        content,
        attachments: attachments || [],
        created_at: new Date().toISOString(),
        user_name: 'Você',
        user_initials: 'VC',
        reactions: [],
        is_mine: true,
        is_read: false,
        is_optimistic: true,
        status: 'sending',
      };
      queryClient.setQueryData<DMMessage[]>(queryKey, (old = []) => [...old, optimisticMsg]);

      // Also optimistically update conversation list
      queryClient.setQueryData<DMConversation[]>([CONV_QUERY_KEY, user!.id], (old) => {
        if (!old) return old;
        const updated = old.map(c => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            last_message: content,
            last_message_at: new Date().toISOString(),
            last_message_is_mine: true,
            last_message_status: 'sending' as MessageStatus,
            last_message_read_by_other: false,
          };
        });
        // Re-sort
        updated.sort((a, b) => {
          const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : new Date(a.created_at).getTime();
          const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : new Date(b.created_at).getTime();
          return tb - ta;
        });
        return updated;
      });

      return { previous };
    },
    onError: (_err, _content, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSuccess: (_data, variables) => {
      // Send push notification to the other user (best-effort)
      if (otherUserId) {
        sendPushToUser({
          userId: otherUserId,
          title: 'Nova mensagem',
          body: variables.content.length > 100 ? variables.content.substring(0, 100) + '...' : variables.content,
          data: { type: 'message', conversationId: conversationId! },
          tag: `dm-${conversationId}`,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [CONV_QUERY_KEY] });
    },
  });

  // Optimistic toggle reaction
  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user?.id) return;

    // Optimistic update
    const previousMessages = queryClient.getQueryData<DMMessage[]>(queryKey);
    queryClient.setQueryData<DMMessage[]>(queryKey, (old) => {
      if (!old) return old;
      return old.map(m => {
        if (m.id !== messageId) return m;
        const existingReaction = m.reactions.find(r => r.emoji === emoji);
        let newReactions;
        if (existingReaction?.hasReacted) {
          // Remove reaction
          newReactions = m.reactions
            .map(r => r.emoji === emoji ? { ...r, count: r.count - 1, hasReacted: false } : r)
            .filter(r => r.count > 0);
        } else if (existingReaction) {
          // Add to existing
          newReactions = m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, hasReacted: true } : r);
        } else {
          // New reaction
          newReactions = [...m.reactions, { emoji, count: 1, hasReacted: true }];
        }
        return { ...m, reactions: newReactions };
      });
    });

    try {
      const { data: existing } = await (supabase as any)
        .from('nexusdesk_dm_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existing) {
        await (supabase as any).from('nexusdesk_dm_reactions').delete().eq('id', existing.id);
      } else {
        await (supabase as any).from('nexusdesk_dm_reactions').insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });
      }
    } catch {
      // Rollback on error
      if (previousMessages) queryClient.setQueryData(queryKey, previousMessages);
    }
  }, [user?.id, queryClient, queryKey]);

  return { messages, isLoading, sendMessage, toggleReaction };
}
