/**
 * Server-side Marketing Demands Hook — V2
 *
 * Supports server-side filtering, sorting, and offset-based pagination.
 * Gated behind DEMANDS_SERVER_FILTERS_V1 feature flag.
 */

import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  MarketingDemand,
  DemandStatus,
  DemandPriority,
  DemandType,
} from "@/hooks/useMarketingDemands";

// ─── TYPES ────────────────────────────────────────────────────

export type DemandSortOption =
  | "created_desc"
  | "due_asc"
  | "overdue_first"
  | "priority_then_due"
  | "updated_desc";

export interface ServerDemandFilters {
  search?: string;
  status?: DemandStatus | DemandStatus[];
  type?: DemandType;
  priority?: DemandPriority;
  assignedTo?: string;
  overdue?: boolean;
  sort?: DemandSortOption;
  pageSize?: number;
}

export interface DemandPage {
  data: MarketingDemand[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
}

const DEFAULT_PAGE_SIZE = 50;

// Priority order for sorting
const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ─── MAIN HOOK ────────────────────────────────────────────────

export function useServerDemands(filters: ServerDemandFilters = {}) {
  const { tenant } = useAuth();
  const pageSize = filters.pageSize || DEFAULT_PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: ["server-demands", tenant?.id, filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("marketing_demands")
        .select("*", { count: "exact" });

      // Filters
      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      if (filters.status) {
        if (Array.isArray(filters.status)) {
          query = query.in("status", filters.status);
        } else {
          query = query.eq("status", filters.status);
        }
      }

      if (filters.type) {
        query = query.eq("type", filters.type);
      }

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }

      if (filters.overdue) {
        const today = new Date().toISOString().split("T")[0];
        query = query
          .lt("due_date", today)
          .not("status", "in", '("completed","cancelled")');
      }

      // Sorting
      const sort = filters.sort || "created_desc";
      switch (sort) {
        case "created_desc":
          query = query.order("created_at", { ascending: false });
          break;
        case "due_asc":
          query = query.order("due_date", { ascending: true, nullsFirst: false });
          break;
        case "updated_desc":
          query = query.order("updated_at", { ascending: false });
          break;
        case "priority_then_due":
          // Supabase doesn't support custom order expressions in .order()
          // We use priority ASC (urgent first) then due_date ASC
          query = query
            .order("priority", { ascending: true })
            .order("due_date", { ascending: true, nullsFirst: false });
          break;
        case "overdue_first":
          // Sort by due_date ASC to get overdue items first
          query = query.order("due_date", { ascending: true, nullsFirst: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      // Pagination
      query = query.range(pageParam, pageParam + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const total = count || 0;
      const nextOffset = pageParam + pageSize;

      return {
        data: (data || []) as MarketingDemand[],
        total,
        hasMore: nextOffset < total,
        nextOffset,
      } as DemandPage;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    enabled: !!tenant?.id,
  });
}

/**
 * Flat list of all loaded demands from infinite query pages.
 */
export function useFlatServerDemands(filters: ServerDemandFilters = {}) {
  const query = useServerDemands(filters);

  const demands = query.data?.pages.flatMap((p) => p.data) || [];
  const total = query.data?.pages[0]?.total || 0;

  return {
    ...query,
    demands,
    total,
    loadMore: query.fetchNextPage,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}

// ─── SERVER STATS ─────────────────────────────────────────────

export function useServerDemandStats() {
  const { tenant } = useAuth();

  return useQuery({
    queryKey: ["server-demand-stats", tenant?.id],
    queryFn: async () => {
      // Fetch counts per status in one query using separate count queries
      const statusValues: DemandStatus[] = [
        "open",
        "in_progress",
        "review",
        "approved",
        "completed",
        "cancelled",
      ];

      const results = await Promise.all([
        // Total
        supabase
          .from("marketing_demands")
          .select("*", { count: "exact", head: true }),
        // Per status
        ...statusValues.map((s) =>
          supabase
            .from("marketing_demands")
            .select("*", { count: "exact", head: true })
            .eq("status", s)
        ),
        // Overdue
        supabase
          .from("marketing_demands")
          .select("*", { count: "exact", head: true })
          .lt("due_date", new Date().toISOString().split("T")[0])
          .not("status", "in", '("completed","cancelled")'),
        // Urgent active
        supabase
          .from("marketing_demands")
          .select("*", { count: "exact", head: true })
          .eq("priority", "urgent")
          .not("status", "in", '("completed","cancelled")'),
      ]);

      return {
        total: results[0].count || 0,
        open: results[1].count || 0,
        inProgress: results[2].count || 0,
        review: results[3].count || 0,
        approved: results[4].count || 0,
        completed: results[5].count || 0,
        cancelled: results[6].count || 0,
        overdue: results[7].count || 0,
        urgent: results[8].count || 0,
      };
    },
    enabled: !!tenant?.id,
    staleTime: 30_000,
  });
}
