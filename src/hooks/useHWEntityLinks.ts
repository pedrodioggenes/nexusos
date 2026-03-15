import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface HWEntityLink {
  id: string;
  message_id: string;
  entity_type: string;
  entity_id: string;
  relation_type: string;
  label: string | null;
  excerpt: string | null;
  created_at: string;
}

export function useHWEntityLinks(messageIds: string[]) {
  return useQuery({
    queryKey: ["hw-entity-links", ...messageIds],
    queryFn: async () => {
      if (!messageIds.length) return [];
      const { data, error } = await supabase
        .from("hyperworks_entity_links")
        .select("*")
        .in("message_id", messageIds);
      if (error) throw error;
      return (data || []) as HWEntityLink[];
    },
    enabled: messageIds.length > 0,
    staleTime: 60_000,
  });
}

export function useCreateHWEntityLink() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: {
      message_id: string;
      entity_type: string;
      entity_id: string;
      relation_type?: string;
      label?: string;
      excerpt?: string;
      tenant_id: string;
      channel_id?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("hyperworks_entity_links")
        .insert([{
          ...link,
          created_by: user.id,
          relation_type: link.relation_type || 'reference',
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hw-entity-links"] });
    },
  });
}
