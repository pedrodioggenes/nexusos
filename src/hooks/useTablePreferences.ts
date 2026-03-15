/**
 * useTablePreferences - Persists DataTable preferences per user/table
 * 
 * Stores visible columns, page size, and sort config in the database.
 * Uses debounced saves to avoid excessive database writes.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TablePreferences {
  visible_columns: string[];
  page_size: number;
  sort_config: { column: string; direction: 'asc' | 'desc' } | null;
  filters: Record<string, string> | null;
}

interface UseTablePreferencesOptions {
  tableId: string;
  defaultColumns?: string[];
  defaultPageSize?: number;
}

export function useTablePreferences({
  tableId,
  defaultColumns = [],
  defaultPageSize = 25,
}: UseTablePreferencesOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [localPrefs, setLocalPrefs] = useState<Partial<TablePreferences>>({});

  // Fetch preferences from database
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['table-preferences', tableId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_table_preferences')
        .select('*')
        .eq('table_id', tableId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load table preferences:', error);
        return null;
      }

      // Map database columns to our interface
      if (!data) return null;
      return {
        visible_columns: (data.visible_columns as string[]) ?? [],
        page_size: data.page_size ?? defaultPageSize,
        sort_config: data.sort_config as TablePreferences['sort_config'],
        filters: (data.filter_config as Record<string, string>) ?? null,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Mutation to save preferences
  const saveMutation = useMutation({
    mutationFn: async (prefs: Partial<TablePreferences>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_table_preferences')
        .upsert({
          user_id: user.id,
          table_id: tableId,
          visible_columns: prefs.visible_columns ?? [],
          page_size: prefs.page_size ?? defaultPageSize,
          sort_config: prefs.sort_config ?? null,
          filter_config: prefs.filters ?? null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,table_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-preferences', tableId, user?.id] });
    },
    onError: (error) => {
      console.error('Failed to save table preferences:', error);
    },
  });

  // Debounced save function
  const savePreferences = useCallback((prefs: Partial<TablePreferences>) => {
    setLocalPrefs(prefs);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveMutation.mutate(prefs);
    }, 1000); // 1 second debounce
  }, [saveMutation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Merged preferences (database + local changes)
  const mergedPreferences: TablePreferences = {
    visible_columns: localPrefs.visible_columns ?? preferences?.visible_columns ?? defaultColumns,
    page_size: localPrefs.page_size ?? preferences?.page_size ?? defaultPageSize,
    sort_config: localPrefs.sort_config ?? preferences?.sort_config ?? null,
    filters: localPrefs.filters ?? preferences?.filters ?? null,
  };

  return {
    preferences: mergedPreferences,
    isLoading,
    isSaving: saveMutation.isPending,
    savePreferences,
    
    // Convenience setters
    setVisibleColumns: (columns: string[]) => {
      savePreferences({ ...mergedPreferences, visible_columns: columns });
    },
    setPageSize: (size: number) => {
      savePreferences({ ...mergedPreferences, page_size: size });
    },
    setSortConfig: (config: TablePreferences['sort_config']) => {
      savePreferences({ ...mergedPreferences, sort_config: config });
    },
    setFilters: (filters: Record<string, string> | null) => {
      savePreferences({ ...mergedPreferences, filters: filters });
    },
  };
}

export default useTablePreferences;
