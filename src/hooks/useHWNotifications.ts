import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface HWNotification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  readAt: string | null;
  createdAt: string;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
}

export function useHWNotifications(tenantId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hw-notifications", tenantId, user?.id],
    queryFn: async (): Promise<HWNotification[]> => {
      if (!tenantId || !user?.id) return [];

      const { data, error } = await supabase
        .from("hw_notifications")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        readAt: n.read_at,
        createdAt: n.created_at,
        relatedEntityType: n.related_entity_type,
        relatedEntityId: n.related_entity_id,
      }));
    },
    enabled: !!tenantId && !!user?.id,
    staleTime: 30_000,
  });
}

export function useMarkHWNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      const { error } = await supabase
        .from("hw_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-notifications", variables.tenantId] });
    },
  });
}

export function useMarkAllHWNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ tenantId }: { tenantId: string }) => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("hw_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("tenant_id", tenantId)
        .eq("user_id", user.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-notifications", variables.tenantId] });
    },
  });
}
