import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useHWPostAcks(postIds: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hw-post-acks", postIds],
    queryFn: async () => {
      if (!postIds.length) return new Map<string, { count: number; userAcked: boolean }>();

      const { data } = await supabase
        .from("hw_post_acks")
        .select("post_id, user_id")
        .in("post_id", postIds);

      const result = new Map<string, { count: number; userAcked: boolean }>();
      (data || []).forEach(a => {
        const existing = result.get(a.post_id) || { count: 0, userAcked: false };
        existing.count++;
        if (a.user_id === user?.id) existing.userAcked = true;
        result.set(a.post_id, existing);
      });
      return result;
    },
    enabled: postIds.length > 0,
    staleTime: 15_000,
  });
}

export function useAckPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { post_id: string; user_id: string }) => {
      const { error } = await supabase
        .from("hw_post_acks")
        .insert({ post_id: params.post_id, user_id: params.user_id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hw-post-acks"] });
    },
  });
}
