import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHWTenantId } from "./useHWTenantId";

export interface GlobalSearchResult {
  entity_type: string;
  entity_id: string;
  title: string;
  preview: string;
  rank: number;
}

function useDebounce<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

export function useHWGlobalSearch(query: string) {
  const { data: tenantId } = useHWTenantId();
  const debouncedQuery = useDebounce(query.trim(), 300);

  const result = useQuery({
    queryKey: ["hw-global-search", debouncedQuery, tenantId],
    queryFn: async (): Promise<GlobalSearchResult[]> => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      const { data, error } = await (supabase as any).rpc("search_nexusdesk_global", {
        search_query: debouncedQuery,
        p_tenant_id: tenantId || null,
      });
      if (error) throw error;
      return (data || []) as unknown as GlobalSearchResult[];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  // Group by entity_type
  const grouped = (result.data || []).reduce<Record<string, GlobalSearchResult[]>>((acc, r) => {
    (acc[r.entity_type] ??= []).push(r);
    return acc;
  }, {});

  return { ...result, grouped };
}
