import { useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHWUserLayout } from "@/hooks/useHWUserLayout";
import {
  WORKBENCH_REGISTRY,
  type WorkbenchPage,
  type WorkbenchWidget,
  type WorkbenchAction,
  type WorkbenchAppExport,
} from "@/config/workbench-registry";

// ─── Types ────────────────────────────────────────────────────

export interface PinnedPage {
  id: string;           // workbench page id e.g. 'hipergestao:demandas'
  sidebar_position: number;
}

export interface PinnedWidget {
  id: string;
  location: 'home' | 'dock';
}

export interface PinnedAction {
  id: string;
}

// ─── Hook ─────────────────────────────────────────────────────

export function useHWWorkbench() {
  const { user } = useAuth();

  const {
    pinnedPages,
    pinnedWidgets,
    pinnedActions,
    updatePinnedPages,
    updatePinnedWidgets,
    updatePinnedActions,
  } = useHWUserLayout();

  // Check which modules the user has access to
  const { data: enabledModules = [] } = useQuery({
    queryKey: ["hw-workbench-modules", user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user?.id) return [];
      const moduleIds = Object.keys(WORKBENCH_REGISTRY);
      const checks = await Promise.all(
        moduleIds.map(async (moduleId) => {
          const { data } = await supabase.rpc("is_module_enabled", {
            p_user_id: user.id,
            p_module: moduleId,
          });
          return data ? moduleId : null;
        })
      );
      return checks.filter(Boolean) as string[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Check page-level permissions
  const { data: pagesAllowed } = useQuery({
    queryKey: ["hw-workbench-pages-allowed", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("pages_allowed")
        .eq("user_id", user.id)
        .maybeSingle();
      return (data?.pages_allowed as Record<string, string[] | null>) || null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Filter available apps
  const availableApps = useMemo((): WorkbenchAppExport[] => {
    return enabledModules
      .map(id => WORKBENCH_REGISTRY[id])
      .filter(Boolean);
  }, [enabledModules]);

  // Filter pages by app + page permission
  const availablePages = useMemo((): WorkbenchPage[] => {
    return availableApps.flatMap(mod => {
      return mod.pages.filter(page => {
        if (!page.requiredPageId) return true;
        if (!pagesAllowed) return true; // null = all allowed
        const appPerms = pagesAllowed[page.appId];
        if (appPerms === null || appPerms === undefined) return true;
        // Check if the page path is in the allowed list
        return appPerms.some(p => p.includes(page.requiredPageId!));
      });
    });
  }, [availableApps, pagesAllowed]);

  const availableWidgets = useMemo((): WorkbenchWidget[] => {
    return availableApps.flatMap(mod => mod.widgets);
  }, [availableApps]);

  const availableActions = useMemo((): WorkbenchAction[] => {
    return availableApps.flatMap(mod => mod.actions);
  }, [availableApps]);

  // Parse pinned data
  const parsedPinnedPages = useMemo((): PinnedPage[] => {
    if (!Array.isArray(pinnedPages)) return [];
    return pinnedPages as PinnedPage[];
  }, [pinnedPages]);

  const parsedPinnedWidgets = useMemo((): PinnedWidget[] => {
    if (!Array.isArray(pinnedWidgets)) return [];
    return pinnedWidgets as PinnedWidget[];
  }, [pinnedWidgets]);

  const parsedPinnedActions = useMemo((): PinnedAction[] => {
    if (!Array.isArray(pinnedActions)) return [];
    return pinnedActions as PinnedAction[];
  }, [pinnedActions]);

  // Pin/unpin operations
  const pinPage = useCallback((pageId: string) => {
    const existing = parsedPinnedPages;
    if (existing.some(p => p.id === pageId)) return;
    const maxPos = existing.length > 0
      ? Math.max(...existing.map(p => p.sidebar_position))
      : 0;
    const updated = [...existing, { id: pageId, sidebar_position: maxPos + 1 }];
    updatePinnedPages(updated);
  }, [parsedPinnedPages, updatePinnedPages]);

  const unpinPage = useCallback((pageId: string) => {
    const updated = parsedPinnedPages.filter(p => p.id !== pageId);
    updatePinnedPages(updated);
  }, [parsedPinnedPages, updatePinnedPages]);

  const isPagePinned = useCallback((pageId: string) => {
    return parsedPinnedPages.some(p => p.id === pageId);
  }, [parsedPinnedPages]);

  const pinWidget = useCallback((widgetId: string, location: 'home' | 'dock' = 'home') => {
    const existing = parsedPinnedWidgets;
    if (existing.some(w => w.id === widgetId)) return;
    const updated = [...existing, { id: widgetId, location }];
    updatePinnedWidgets(updated);
  }, [parsedPinnedWidgets, updatePinnedWidgets]);

  const unpinWidget = useCallback((widgetId: string) => {
    const updated = parsedPinnedWidgets.filter(w => w.id !== widgetId);
    updatePinnedWidgets(updated);
  }, [parsedPinnedWidgets, updatePinnedWidgets]);

  const isWidgetPinned = useCallback((widgetId: string) => {
    return parsedPinnedWidgets.some(w => w.id === widgetId);
  }, [parsedPinnedWidgets]);

  const pinAction = useCallback((actionId: string) => {
    const existing = parsedPinnedActions;
    if (existing.some(a => a.id === actionId)) return;
    const updated = [...existing, { id: actionId }];
    updatePinnedActions(updated);
  }, [parsedPinnedActions, updatePinnedActions]);

  const unpinAction = useCallback((actionId: string) => {
    const updated = parsedPinnedActions.filter(a => a.id !== actionId);
    updatePinnedActions(updated);
  }, [parsedPinnedActions, updatePinnedActions]);

  const isActionPinned = useCallback((actionId: string) => {
    return parsedPinnedActions.some(a => a.id === actionId);
  }, [parsedPinnedActions]);

  // Get resolved pinned pages (with full data)
  const resolvedPinnedPages = useMemo(() => {
    return parsedPinnedPages
      .map(pp => {
        const page = availablePages.find(p => p.id === pp.id);
        if (!page) return null;
        return { ...page, sidebar_position: pp.sidebar_position };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.sidebar_position - b!.sidebar_position)) as (WorkbenchPage & { sidebar_position: number })[];
  }, [parsedPinnedPages, availablePages]);

  return {
    // Available (filtered by permissions)
    availableApps,
    availablePages,
    availableWidgets,
    availableActions,
    // Pinned
    pinnedPages: parsedPinnedPages,
    pinnedWidgets: parsedPinnedWidgets,
    pinnedActions: parsedPinnedActions,
    resolvedPinnedPages,
    // Operations
    pinPage,
    unpinPage,
    isPagePinned,
    pinWidget,
    unpinWidget,
    isWidgetPinned,
    pinAction,
    unpinAction,
    isActionPinned,
  };
}
