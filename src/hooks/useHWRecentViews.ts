import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "./useHWTenantId";

export interface HWRecentView {
  id: string;
  entity_type: string;
  entity_id: string;
  viewed_at: string;
}

export function useHWRecentViews() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const qc = useQueryClient();
  const key = ["hw-recent-views", user?.id];

  const { data: recents = [], ...rest } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<HWRecentView[]> => {
      const { data, error } = await supabase
        .from("hw_recent_views")
        .select("id, entity_type, entity_id, viewed_at")
        .eq("user_id", user!.id)
        .order("viewed_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as HWRecentView[];
    },
    enabled: !!user?.id,
  });

  const recordView = useMutation({
    mutationFn: async ({ entityType, entityId }: { entityType: string; entityId: string }) => {
      // Upsert: insert or update viewed_at
      const { error } = await supabase.from("hw_recent_views").upsert(
        {
          user_id: user!.id,
          entity_type: entityType,
          entity_id: entityId,
          tenant_id: tenantId || null,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,entity_type,entity_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { recents, recordView, ...rest };
}
