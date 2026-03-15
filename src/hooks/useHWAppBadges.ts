import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Badge count strategies per pinned page.
 * Each entry maps a workbench page id to a lightweight count query.
 * Returns Record<string, number> — pageId → pending count.
 */

type BadgeQueryFn = (userId: string) => Promise<number>;

const BADGE_STRATEGIES: Record<string, BadgeQueryFn> = {
  "marketing:demandas": async (userId) => {
    const { count, error } = await supabase
      .from("marketing_demands")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "in_progress", "review"]);
    if (error) return 0;
    return count ?? 0;
  },
  "marketing:campanhas": async () => {
    const { count, error } = await supabase
      .from("marketing_campaigns")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    if (error) return 0;
    return count ?? 0;
  },
};

export function useHWAppBadges(pinnedPageIds: string[]): Record<string, number> {
  const { user } = useAuth();

  // Only query pages that have a badge strategy
  const queryableIds = useMemo(
    () => pinnedPageIds.filter((id) => id in BADGE_STRATEGIES),
    [pinnedPageIds]
  );

  const { data } = useQuery({
    queryKey: ["hw-app-badges", user?.id, queryableIds],
    queryFn: async (): Promise<Record<string, number>> => {
      if (!user?.id || queryableIds.length === 0) return {};

      const entries = await Promise.all(
        queryableIds.map(async (pageId) => {
          const count = await BADGE_STRATEGIES[pageId](user.id);
          return [pageId, count] as const;
        })
      );

      return Object.fromEntries(entries);
    },
    enabled: !!user?.id && queryableIds.length > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  return data ?? {};
}
