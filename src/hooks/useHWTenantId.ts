import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the tenant_id for the current user.
 */
export function useHWTenantId() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hw-tenant-id", user?.id],
    queryFn: async (): Promise<string | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("tenant_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data?.tenant_id || null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });
}
