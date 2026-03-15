import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

interface ProfileInfo {
  user_id: string;
  full_name: string | null;
  email: string;
}

/**
 * Loads colleague profiles via security-definer RPC (masks emails for non-admins).
 * Admins fall back to direct table access for full data.
 */
export function useTenantProfiles() {
  const { tenant, user, role } = useAuth();

  const query = useQuery({
    queryKey: ["tenant-profiles", tenant?.id, role],
    queryFn: async () => {
      // Admins can read profiles directly (RLS allows it)
      if (role === "admin") {
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, full_name, email");
        if (error) throw error;
        return (data || []) as ProfileInfo[];
      }

      // Non-admins use the safe RPC that masks emails
      const { data, error } = await supabase
        .rpc("get_colleague_profiles", { p_user_id: user!.id });
      if (error) throw error;
      return (data || []) as ProfileInfo[];
    },
    enabled: !!tenant?.id && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const profileMap = useMemo(() => {
    const map = new Map<string, ProfileInfo>();
    query.data?.forEach((p) => map.set(p.user_id, p));
    return map;
  }, [query.data]);

  const resolveName = (userId: string | null): string => {
    if (!userId) return "Sem responsável";
    const profile = profileMap.get(userId);
    if (!profile) return "Sem responsável";
    return profile.full_name || profile.email.split("@")[0];
  };

  const resolveInitials = (userId: string | null): string => {
    if (!userId) return "?";
    const profile = profileMap.get(userId);
    if (!profile) return "?";
    const name = profile.full_name || profile.email;
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  return { ...query, profileMap, resolveName, resolveInitials };
}
