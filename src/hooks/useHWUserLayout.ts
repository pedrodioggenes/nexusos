import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useRef, useState } from "react";

export const DEFAULT_SIDEBAR_ORDER = ['home', 'mural', 'messages', 'team', 'documents', 'recruitment', 'profile'];
export const DEFAULT_HOME_WIDGETS = ['messages', 'trainings', 'birthdays', 'shortcuts'];
export const DEFAULT_BOTTOM_TABS = ['home', 'mural', 'messages', 'team', 'profile'];
export const DEFAULT_RIGHT_WIDGETS: Record<string, string[]> = {
  home: ['profile', 'demands', 'alerts'],
  mural: ['profile', 'demands', 'alerts'],
  messages: ['profile', 'demands', 'alerts'],
  team: ['profile', 'demands', 'alerts'],
  documents: ['profile', 'demands', 'alerts'],
  recruitment: ['profile', 'demands', 'alerts'],
  profile: ['profile', 'demands', 'alerts'],
  trainings: ['profile', 'demands', 'alerts'],
  goals: ['profile', 'demands', 'alerts'],
  approvals: ['profile', 'demands', 'alerts'],
};

interface LayoutData {
  sidebar_order: string[];
  home_widgets_order: string[];
  bottom_tabs: string[];
  right_widgets_order: Record<string, string[]>;
  pinned_pages: unknown[];
  pinned_widgets: unknown[];
  pinned_actions: unknown[];
  desk_positions: Record<string, unknown> | null;
}

export function useHWUserLayout() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Optimistic local state
  const [localSidebar, setLocalSidebar] = useState<string[] | null>(null);
  const [localWidgets, setLocalWidgets] = useState<string[] | null>(null);
  const [localBottomTabs, setLocalBottomTabs] = useState<string[] | null>(null);
  const [localRightWidgets, setLocalRightWidgets] = useState<Record<string, string[]> | null>(null);
  const [localPinnedPages, setLocalPinnedPages] = useState<unknown[] | null>(null);
  const [localPinnedWidgets, setLocalPinnedWidgets] = useState<unknown[] | null>(null);
  const [localPinnedActions, setLocalPinnedActions] = useState<unknown[] | null>(null);
  const [localDeskPositions, setLocalDeskPositions] = useState<Record<string, unknown> | null>(null);

  const queryKey = ["hw-user-layout", user?.id];

  const { data: dbLayout, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<LayoutData | null> => {
      if (!user?.id) return null;
      // Main query without desk_positions — resilient to column not existing yet
      const { data, error } = await supabase
        .from("hw_user_layout")
        .select("sidebar_order, home_widgets_order, bottom_tabs, right_widgets_order, pinned_pages, pinned_widgets, pinned_actions")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      // Secondary query for desk_positions — silently fails if column doesn't exist yet
      let deskPos: Record<string, unknown> | null = null;
      try {
        const { data: dp } = await supabase
          .from("hw_user_layout")
          .select("desk_positions")
          .eq("user_id", user.id)
          .maybeSingle();
        deskPos = (dp as any)?.desk_positions ?? null;
      } catch { /* column not yet deployed — ignore */ }

      return { ...data, desk_positions: deskPos } as LayoutData;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const persistMutation = useMutation({
    mutationFn: async (layout: Partial<LayoutData>) => {
      if (!user?.id) return;
      const payload: Record<string, unknown> = {
        user_id: user.id,
        tenant_id: tenantId || undefined,
        updated_at: new Date().toISOString(),
        ...layout,
      };
      const { error } = await supabase
        .from("hw_user_layout")
        .upsert(payload as any, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const debouncedPersist = useCallback((layout: Partial<LayoutData>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      persistMutation.mutate(layout);
    }, 500);
  }, [persistMutation]);

  const sidebarOrder = localSidebar || (dbLayout?.sidebar_order?.length ? dbLayout.sidebar_order : DEFAULT_SIDEBAR_ORDER);
  const homeWidgetsOrder = localWidgets || (dbLayout?.home_widgets_order?.length ? dbLayout.home_widgets_order : DEFAULT_HOME_WIDGETS);
  const bottomTabs = localBottomTabs || (dbLayout?.bottom_tabs?.length ? dbLayout.bottom_tabs : DEFAULT_BOTTOM_TABS);
  const rightWidgetsOrder = localRightWidgets || (dbLayout?.right_widgets_order && Object.keys(dbLayout.right_widgets_order).length > 0 ? dbLayout.right_widgets_order : DEFAULT_RIGHT_WIDGETS);
  const pinnedPages = localPinnedPages || (dbLayout?.pinned_pages?.length ? dbLayout.pinned_pages : []);
  const pinnedWidgets = localPinnedWidgets || (dbLayout?.pinned_widgets?.length ? dbLayout.pinned_widgets : []);
  const pinnedActions = localPinnedActions || (dbLayout?.pinned_actions?.length ? dbLayout.pinned_actions : []);
  const deskPositions = localDeskPositions || (dbLayout?.desk_positions && Object.keys(dbLayout.desk_positions).length > 0 ? dbLayout.desk_positions : null);

  const updateSidebarOrder = useCallback((order: string[]) => {
    setLocalSidebar(order);
    debouncedPersist({ sidebar_order: order });
  }, [debouncedPersist]);

  const updateWidgetOrder = useCallback((order: string[]) => {
    setLocalWidgets(order);
    debouncedPersist({ home_widgets_order: order });
  }, [debouncedPersist]);

  const updateBottomTabs = useCallback((tabs: string[]) => {
    setLocalBottomTabs(tabs);
    debouncedPersist({ bottom_tabs: tabs });
  }, [debouncedPersist]);

  const updateRightWidgetsOrder = useCallback((view: string, order: string[]) => {
    const updated = { ...rightWidgetsOrder, [view]: order };
    setLocalRightWidgets(updated);
    debouncedPersist({ right_widgets_order: updated });
  }, [rightWidgetsOrder, debouncedPersist]);

  const updatePinnedPages = useCallback((pages: unknown[]) => {
    setLocalPinnedPages(pages);
    debouncedPersist({ pinned_pages: pages });
  }, [debouncedPersist]);

  const updatePinnedWidgets = useCallback((widgets: unknown[]) => {
    setLocalPinnedWidgets(widgets);
    debouncedPersist({ pinned_widgets: widgets });
  }, [debouncedPersist]);

  const updatePinnedActions = useCallback((actions: unknown[]) => {
    setLocalPinnedActions(actions);
    debouncedPersist({ pinned_actions: actions });
  }, [debouncedPersist]);

  const updateDeskPositions = useCallback((positions: Record<string, unknown>) => {
    setLocalDeskPositions(positions);
    debouncedPersist({ desk_positions: positions });
  }, [debouncedPersist]);

  const resetToDefaults = useCallback(() => {
    setLocalSidebar(null);
    setLocalWidgets(null);
    setLocalBottomTabs(null);
    setLocalRightWidgets(null);
    setLocalPinnedPages(null);
    setLocalPinnedWidgets(null);
    setLocalPinnedActions(null);
    persistMutation.mutate({
      sidebar_order: DEFAULT_SIDEBAR_ORDER,
      home_widgets_order: DEFAULT_HOME_WIDGETS,
      bottom_tabs: DEFAULT_BOTTOM_TABS,
      right_widgets_order: {},
      pinned_pages: [],
      pinned_widgets: [],
      pinned_actions: [],
    });
  }, [persistMutation]);

  return {
    sidebarOrder,
    homeWidgetsOrder,
    bottomTabs,
    rightWidgetsOrder,
    pinnedPages,
    pinnedWidgets,
    pinnedActions,
    updateSidebarOrder,
    updateWidgetOrder,
    updateBottomTabs,
    updateRightWidgetsOrder,
    updatePinnedPages,
    updatePinnedWidgets,
    updatePinnedActions,
    deskPositions,
    updateDeskPositions,
    resetToDefaults,
    isLoading,
  };
}
