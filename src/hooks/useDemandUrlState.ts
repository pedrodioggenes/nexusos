/**
 * useDemandUrlState — Sync demand filters + view to URL search params.
 * Falls back to local state when inside an embedded context (MemoryRouter).
 */

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useEmbeddedNav } from "@/contexts/EmbeddedNavigationContext";
import type { DemandSortOption } from "@/hooks/useServerDemands";

export type ViewMode = "kanban" | "list" | "timeline";
export type StatusQuickFilter = "all" | "review" | "overdue" | "in_progress";

export interface DemandUrlState {
  view: ViewMode;
  search: string;
  priority: string;
  type: string;
  statusQuick: StatusQuickFilter;
  sort: DemandSortOption;
}

const DEFAULTS: DemandUrlState = {
  view: "kanban",
  search: "",
  priority: "all",
  type: "all",
  statusQuick: "all",
  sort: "created_desc",
};

/**
 * Local-state version for embedded contexts where useSearchParams
 * may not re-render properly inside MemoryRouter.
 */
function useLocalDemandState() {
  const [view, setView] = useState<ViewMode>(DEFAULTS.view);
  const [search, setSearch] = useState(DEFAULTS.search);
  const [priority, setPriority] = useState(DEFAULTS.priority);
  const [type, setType] = useState(DEFAULTS.type);
  const [statusQuick, setStatusQuick] = useState<StatusQuickFilter>(DEFAULTS.statusQuick);
  const [sort, setSort] = useState<DemandSortOption>(DEFAULTS.sort);

  return {
    view, search, priority, type, statusQuick, sort,
    setView, setSearch, setPriority, setType, setStatusQuick, setSort,
  };
}

/**
 * URL-based version for normal BrowserRouter contexts.
 */
function useUrlDemandState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const state: DemandUrlState = useMemo(() => ({
    view: (searchParams.get("view") as ViewMode) || DEFAULTS.view,
    search: searchParams.get("q") || DEFAULTS.search,
    priority: searchParams.get("priority") || DEFAULTS.priority,
    type: searchParams.get("type") || DEFAULTS.type,
    statusQuick: (searchParams.get("status") as StatusQuickFilter) || DEFAULTS.statusQuick,
    sort: (searchParams.get("sort") as DemandSortOption) || DEFAULTS.sort,
  }), [searchParams]);

  const setParam = useCallback(
    (key: string, value: string, defaultVal: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === defaultVal || !value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setView = useCallback((v: ViewMode) => setParam("view", v, DEFAULTS.view), [setParam]);
  const setSearch = useCallback((v: string) => setParam("q", v, ""), [setParam]);
  const setPriority = useCallback((v: string) => setParam("priority", v, "all"), [setParam]);
  const setType = useCallback((v: string) => setParam("type", v, "all"), [setParam]);
  const setStatusQuick = useCallback((v: StatusQuickFilter) => setParam("status", v, "all"), [setParam]);
  const setSort = useCallback((v: DemandSortOption) => setParam("sort", v, "created_desc"), [setParam]);

  return {
    ...state,
    setView,
    setSearch,
    setPriority,
    setType,
    setStatusQuick,
    setSort,
  };
}

/**
 * Main hook — auto-detects embedded context and picks the right strategy.
 * NOTE: This hook is used at the TOP of components, so both branches
 * must be separate components/hooks to satisfy Rules of Hooks.
 * We use a wrapper component pattern in the Demandas page instead.
 */
export function useDemandUrlState() {
  const embeddedNav = useEmbeddedNav();
  const isEmbedded = !!embeddedNav;

  // We need to always call hooks in the same order, so we use the
  // local state approach for embedded and URL approach otherwise.
  // Since we can't conditionally call hooks, we use a proxy approach:

  const [localView, setLocalView] = useState<ViewMode>(DEFAULTS.view);
  const [localSearch, setLocalSearch] = useState(DEFAULTS.search);
  const [localPriority, setLocalPriority] = useState(DEFAULTS.priority);
  const [localType, setLocalType] = useState(DEFAULTS.type);
  const [localStatusQuick, setLocalStatusQuick] = useState<StatusQuickFilter>(DEFAULTS.statusQuick);
  const [localSort, setLocalSort] = useState<DemandSortOption>(DEFAULTS.sort);

  let searchParams: URLSearchParams | null = null;
  let setSearchParams: any = null;

  try {
    // This may fail or be unreliable in embedded context
    if (!isEmbedded) {
      [searchParams, setSearchParams] = useSearchParams();
    }
  } catch {
    // Fallback to local state
  }

  // URL-based state (only used when NOT embedded)
  const urlState: DemandUrlState = useMemo(() => {
    if (isEmbedded || !searchParams) {
      return { view: localView, search: localSearch, priority: localPriority, type: localType, statusQuick: localStatusQuick, sort: localSort };
    }
    return {
      view: (searchParams.get("view") as ViewMode) || DEFAULTS.view,
      search: searchParams.get("q") || DEFAULTS.search,
      priority: searchParams.get("priority") || DEFAULTS.priority,
      type: searchParams.get("type") || DEFAULTS.type,
      statusQuick: (searchParams.get("status") as StatusQuickFilter) || DEFAULTS.statusQuick,
      sort: (searchParams.get("sort") as DemandSortOption) || DEFAULTS.sort,
    };
  }, [isEmbedded, searchParams, localView, localSearch, localPriority, localType, localStatusQuick, localSort]);

  const setUrlParam = useCallback(
    (key: string, value: string, defaultVal: string) => {
      if (!setSearchParams) return;
      setSearchParams((prev: URLSearchParams) => {
        const next = new URLSearchParams(prev);
        if (value === defaultVal || !value) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  // Setters — use local state for embedded, URL params for normal
  const setView = useCallback((v: ViewMode) => {
    if (isEmbedded) { setLocalView(v); } else { setUrlParam("view", v, DEFAULTS.view); }
  }, [isEmbedded, setUrlParam]);

  const setSearch = useCallback((v: string) => {
    if (isEmbedded) { setLocalSearch(v); } else { setUrlParam("q", v, ""); }
  }, [isEmbedded, setUrlParam]);

  const setPriority = useCallback((v: string) => {
    if (isEmbedded) { setLocalPriority(v); } else { setUrlParam("priority", v, "all"); }
  }, [isEmbedded, setUrlParam]);

  const setType = useCallback((v: string) => {
    if (isEmbedded) { setLocalType(v); } else { setUrlParam("type", v, "all"); }
  }, [isEmbedded, setUrlParam]);

  const setStatusQuick = useCallback((v: StatusQuickFilter) => {
    if (isEmbedded) { setLocalStatusQuick(v); } else { setUrlParam("status", v, "all"); }
  }, [isEmbedded, setUrlParam]);

  const setSort = useCallback((v: DemandSortOption) => {
    if (isEmbedded) { setLocalSort(v); } else { setUrlParam("sort", v, "created_desc"); }
  }, [isEmbedded, setUrlParam]);

  return {
    ...urlState,
    setView,
    setSearch,
    setPriority,
    setType,
    setStatusQuick,
    setSort,
  };
}
