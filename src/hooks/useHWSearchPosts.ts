import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  title: string | null;
  content: string;
  author_name: string;
  type: string;
  created_at: string;
  rank: number;
}

export function useHWSearchPosts(query: string, tenantId?: string) {
  return useQuery({
    queryKey: ["hw-search-posts", query, tenantId],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query.trim() || !tenantId) return [];

      const { data, error } = await supabase.rpc("search_hw_posts", {
        search_query: query,
        p_tenant_id: tenantId,
        p_limit: 20,
      });

      if (error) throw error;
      return (data || []) as SearchResult[];
    },
    enabled: !!query.trim() && !!tenantId,
    staleTime: 30_000,
  });
}
