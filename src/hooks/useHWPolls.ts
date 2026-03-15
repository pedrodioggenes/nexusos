import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface HWPoll {
  id: string;
  post_id: string;
  question: string;
  options: string[];
  closes_at?: string;
  votes: { option_index: number; count: number }[];
  userVote?: number;
  totalVotes: number;
}

export function useHWPoll(postId?: string, tenantId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hw-poll", postId],
    queryFn: async (): Promise<HWPoll | null> => {
      if (!postId) return null;

      const { data: poll, error } = await supabase
        .from("hw_polls")
        .select("*")
        .eq("post_id", postId)
        .maybeSingle();

      if (error || !poll) return null;

      const { data: votes } = await supabase
        .from("hw_poll_votes")
        .select("option_index, user_id")
        .eq("poll_id", poll.id);

      const voteCounts = new Map<number, number>();
      let userVote: number | undefined;
      (votes || []).forEach(v => {
        voteCounts.set(v.option_index, (voteCounts.get(v.option_index) || 0) + 1);
        if (v.user_id === user?.id) userVote = v.option_index;
      });

      const options = Array.isArray(poll.options) ? (poll.options as string[]) : [];

      return {
        id: poll.id,
        post_id: poll.post_id,
        question: poll.question,
        options,
        closes_at: poll.closes_at || undefined,
        votes: options.map((_, i) => ({ option_index: i, count: voteCounts.get(i) || 0 })),
        userVote,
        totalVotes: (votes || []).length,
      };
    },
    enabled: !!postId,
    staleTime: 15_000,
  });
}

export function useVoteOnPoll() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { pollId: string; optionIndex: number; postId: string }) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Delete existing vote first (upsert pattern)
      await supabase
        .from("hw_poll_votes")
        .delete()
        .eq("poll_id", params.pollId)
        .eq("user_id", user.id);

      const { error } = await supabase
        .from("hw_poll_votes")
        .insert({ poll_id: params.pollId, user_id: user.id, option_index: params.optionIndex });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-poll", variables.postId] });
    },
  });
}

export function useCreateHWPoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      post_id: string;
      tenant_id: string;
      question: string;
      options: string[];
      closes_at?: string;
    }) => {
      const { error } = await supabase
        .from("hw_polls")
        .insert({
          post_id: params.post_id,
          tenant_id: params.tenant_id,
          question: params.question,
          options: params.options as any,
          closes_at: params.closes_at || null,
        });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-poll", variables.post_id] });
      queryClient.invalidateQueries({ queryKey: ["hw-posts"] });
    },
  });
}
