import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "./useHWTenantId";

export interface HWFavorite {
  id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

export function useHWFavorites() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const qc = useQueryClient();
  const key = ["hw-favorites", user?.id];

  const { data: favorites = [], ...rest } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<HWFavorite[]> => {
      const { data, error } = await supabase
        .from("hw_favorites")
        .select("id, entity_type, entity_id, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HWFavorite[];
    },
    enabled: !!user?.id,
  });

  const isFavorite = (entityType: string, entityId: string) =>
    favorites.some((f) => f.entity_type === entityType && f.entity_id === entityId);

  const toggle = useMutation({
    mutationFn: async ({ entityType, entityId }: { entityType: string; entityId: string }) => {
      const existing = favorites.find(
        (f) => f.entity_type === entityType && f.entity_id === entityId
      );
      if (existing) {
        await supabase.from("hw_favorites").delete().eq("id", existing.id);
      } else {
        await supabase.from("hw_favorites").insert({
          user_id: user!.id,
          entity_type: entityType,
          entity_id: entityId,
          tenant_id: tenantId || null,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { favorites, isFavorite, toggle, ...rest };
}
