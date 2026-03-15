/**
 * Saved Demand Views — localStorage-based for V1
 */

import { useState, useEffect, useCallback } from "react";
import type { DemandSortOption } from "@/hooks/useServerDemands";
import type { StatusQuickFilter } from "@/hooks/useDemandUrlState";

export interface SavedView {
  id: string;
  name: string;
  filters: {
    priority: string;
    type: string;
    statusQuick: StatusQuickFilter;
    sort: DemandSortOption;
    search?: string;
  };
  createdAt: string;
}

const STORAGE_KEY = "nexus_demand_saved_views";

function loadViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveViews(views: SavedView[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
}

export function useSavedViews() {
  const [views, setViews] = useState<SavedView[]>(loadViews);

  const addView = useCallback(
    (name: string, filters: SavedView["filters"]) => {
      const view: SavedView = {
        id: crypto.randomUUID(),
        name,
        filters,
        createdAt: new Date().toISOString(),
      };
      const next = [...views, view];
      setViews(next);
      saveViews(next);
      return view;
    },
    [views]
  );

  const removeView = useCallback(
    (id: string) => {
      const next = views.filter((v) => v.id !== id);
      setViews(next);
      saveViews(next);
    },
    [views]
  );

  return { views, addView, removeView };
}
