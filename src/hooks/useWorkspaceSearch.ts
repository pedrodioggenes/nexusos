import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export interface SearchResult {
  id: string;
  title: string;
  icon: string;
  content_preview: string;
  rank: number;
}

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useWorkspaceSearch(searchQuery: string, enabled: boolean = true) {
  const { tenant } = useAuth();
  const debouncedQuery = useDebounceValue(searchQuery, 300);

  return useQuery({
    queryKey: ['workspace-search', debouncedQuery, tenant?.id],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_workspace_pages', {
        search_query: debouncedQuery,
        p_tenant_id: tenant?.id || null,
      });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      return (data || []) as SearchResult[];
    },
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}
