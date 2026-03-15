import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useHWPosts(tenantId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hw-posts", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data: posts, error } = await supabase
        .from("hw_posts")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!posts?.length) return [];

      // Get author profiles
      const authorIds = [...new Set(posts.map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", authorIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Get comments for all posts
      const postIds = posts.map(p => p.id);
      const { data: comments } = await supabase
        .from("hw_post_comments")
        .select("*")
        .in("post_id", postIds)
        .order("created_at", { ascending: true });

      // Get comment author profiles
      const commentAuthorIds = [...new Set((comments || []).map(c => c.user_id))];
      const missingAuthorIds = commentAuthorIds.filter(id => !profileMap.has(id));
      if (missingAuthorIds.length > 0) {
        const { data: moreProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", missingAuthorIds);
        (moreProfiles || []).forEach(p => profileMap.set(p.user_id, p));
      }

      // Get reactions for all posts
      const { data: reactions } = await supabase
        .from("hw_post_reactions")
        .select("*")
        .in("post_id", postIds);

      // Get read counts
      const { data: reads } = await supabase
        .from("hw_post_reads")
        .select("post_id, user_id")
        .in("post_id", postIds);

      // Get team names
      const teamIds = [...new Set(posts.filter(p => p.team_id).map(p => p.team_id!))];
      let teamMap = new Map<string, string>();
      if (teamIds.length > 0) {
        const { data: teams } = await supabase
          .from("hw_teams")
          .select("id, name")
          .in("id", teamIds);
        teamMap = new Map((teams || []).map(t => [t.id, t.name]));
      }

      return posts.map(post => {
        const author = profileMap.get(post.author_id);
        const authorName = author?.full_name || author?.email?.split("@")[0] || "Usuário";
        const authorInitials = authorName.slice(0, 2).toUpperCase();

        const postComments = (comments || [])
          .filter(c => c.post_id === post.id)
          .map(c => {
            const cp = profileMap.get(c.user_id);
            const cName = cp?.full_name || cp?.email?.split("@")[0] || "Usuário";
            return {
              id: c.id,
              authorName: cName,
              authorInitials: cName.slice(0, 2).toUpperCase(),
              content: c.content,
              createdAt: c.created_at,
            };
          });

        // Aggregate reactions by emoji
        const postReactions = (reactions || []).filter(r => r.post_id === post.id);
        const emojiMap = new Map<string, { count: number; reacted: boolean }>();
        postReactions.forEach(r => {
          const existing = emojiMap.get(r.emoji) || { count: 0, reacted: false };
          existing.count++;
          if (r.user_id === user?.id) existing.reacted = true;
          emojiMap.set(r.emoji, existing);
        });
        const reactionsList = Array.from(emojiMap.entries()).map(([emoji, data]) => ({
          emoji,
          count: data.count,
          reacted: data.reacted,
        }));

        const readCount = (reads || []).filter(r => r.post_id === post.id).length || post.read_count;

        return {
          id: post.id,
          authorName,
          authorInitials,
          authorRole: post.type === 'broadcast' ? 'Diretor Geral' : 'Chefe de Departamento',
          teamName: post.team_id ? (teamMap.get(post.team_id) || 'Equipe') : 'Diretoria',
          type: post.type as 'post' | 'broadcast',
          title: post.title || undefined,
          content: post.content,
          imageUrl: post.image_url || undefined,
          createdAt: post.created_at,
          reactions: reactionsList.length > 0 ? reactionsList : [{ emoji: '👍', count: 0, reacted: false }],
          comments: postComments,
          readCount,
          pinnedUntil: post.pinned_until || undefined,
          requiresAck: (post as any).requires_ack || false,
          hasPoll: false, // will be enriched client-side
          scheduledAt: (post as any).scheduled_at || undefined,
        };
      });
    },
    enabled: !!tenantId,
    staleTime: 30_000,
  });
}

export function useCreateHWPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: {
      tenant_id: string;
      author_id: string;
      content: string;
      type: string;
      title?: string;
      team_id?: string;
      image_url?: string;
      pinned_until?: string;
      scheduled_at?: string;
      is_published?: boolean;
      requires_ack?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("hw_posts")
        .insert([post])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-posts", variables.tenant_id] });
    },
  });
}

export function useAddHWComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: {
      post_id: string;
      user_id: string;
      content: string;
      tenant_id: string;
    }) => {
      const { data, error } = await supabase
        .from("hw_post_comments")
        .insert([{ post_id: comment.post_id, user_id: comment.user_id, content: comment.content }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-posts", variables.tenant_id] });
    },
  });
}

export function useToggleHWReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      post_id: string;
      user_id: string;
      emoji: string;
      tenant_id: string;
    }) => {
      // Check if already reacted
      const { data: existing } = await supabase
        .from("hw_post_reactions")
        .select("id")
        .eq("post_id", params.post_id)
        .eq("user_id", params.user_id)
        .eq("emoji", params.emoji)
        .maybeSingle();

      if (existing) {
        await supabase.from("hw_post_reactions").delete().eq("id", existing.id);
      } else {
        await supabase.from("hw_post_reactions").insert([{
          post_id: params.post_id,
          user_id: params.user_id,
          emoji: params.emoji,
        }]);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-posts", variables.tenant_id] });
    },
  });
}
