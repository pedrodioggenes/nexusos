import { useMemo, useState, useCallback } from "react";
import { UNITS, ALERTS, GOALS, PENDENCIAS, CATEGORIES, TREND_DATA, getConsolidatedKPIs, SALES_BY_DAY, SALES_BY_HOUR, SALES_BY_UNIT, SALES_BY_CATEGORY, TICKET_DISTRIBUTION, ITEMS_PER_COUPON, EVOLUTION_DRIVERS } from "@/data/dominio/mock-data";
import type { Pendencia, GlobalFilters } from "@/data/dominio/types";

export function useGlobalFilters(defaults?: Partial<GlobalFilters>) {
  const [filters, setFilters] = useState<GlobalFilters>({
    unit_id: "all",
    period: "month",
    comparison: "previous",
    category: "all",
    search: "",
    ...defaults,
  });

  const updateFilter = useCallback(<K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  return { filters, setFilters, updateFilter };
}

export function useUnitsSummary(filters: GlobalFilters) {
  return useMemo(() => {
    let data = [...UNITS];
    if (filters.unit_id !== "all" && !Array.isArray(filters.unit_id)) {
      data = data.filter(u => u.id === filters.unit_id);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(u => u.name.toLowerCase().includes(s));
    }
    return data;
  }, [filters.unit_id, filters.search]);
}

export function useAlerts(filters: GlobalFilters) {
  return useMemo(() => {
    let data = [...ALERTS];
    if (filters.unit_id !== "all" && !Array.isArray(filters.unit_id)) {
      data = data.filter(a => a.unit_id === filters.unit_id);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(a => a.title.toLowerCase().includes(s) || a.unit_name.toLowerCase().includes(s));
    }
    return data;
  }, [filters.unit_id, filters.search]);
}

export function useGoals(filters: GlobalFilters) {
  return useMemo(() => {
    let data = [...GOALS];
    if (filters.unit_id !== "all" && !Array.isArray(filters.unit_id)) {
      data = data.filter(g => g.unit_id === filters.unit_id);
    }
    return data;
  }, [filters.unit_id]);
}

export function usePendencias() {
  const [pendencias, setPendencias] = useState<Pendencia[]>(PENDENCIAS);

  const addPendencia = useCallback((p: Omit<Pendencia, "id" | "created_at">) => {
    const newP: Pendencia = {
      ...p,
      id: `p${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setPendencias(prev => [newP, ...prev]);
    return newP;
  }, []);

  const updateStatus = useCallback((id: string, status: Pendencia["status"]) => {
    setPendencias(prev => prev.map(p => p.id === id ? { ...p, status, resolved_at: status === "resolved" ? new Date().toISOString() : p.resolved_at } : p));
  }, []);

  return { pendencias, addPendencia, updateStatus };
}

export function useConsolidatedKPIs() {
  return useMemo(() => getConsolidatedKPIs(), []);
}

export function useCategories() {
  return CATEGORIES;
}

export function useTrendData() {
  return TREND_DATA;
}

// ===== SALES HOOKS =====

export function useSalesByDay(filters: GlobalFilters) {
  return useMemo(() => {
    // Mock: no unit-level filtering on daily data, just return all
    return SALES_BY_DAY;
  }, [filters.unit_id]);
}

export function useSalesByHour() {
  return useMemo(() => SALES_BY_HOUR, []);
}

export function useSalesByUnit(filters: GlobalFilters) {
  return useMemo(() => {
    let data = [...SALES_BY_UNIT];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(u => u.unit_name.toLowerCase().includes(s));
    }
    return data;
  }, [filters.search]);
}

export function useSalesByCategory(filters: GlobalFilters) {
  return useMemo(() => {
    let data = [...SALES_BY_CATEGORY];
    if (filters.category && filters.category !== "all") {
      data = data.filter(c => c.name === filters.category);
    }
    return data;
  }, [filters.category]);
}

export function useTicketDistribution() {
  return useMemo(() => TICKET_DISTRIBUTION, []);
}

export function useEvolutionDrivers() {
  return useMemo(() => [...EVOLUTION_DRIVERS].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)), []);
}
