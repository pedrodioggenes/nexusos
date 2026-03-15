import { useMemo } from "react";
import { PRODUCTS, PRODUCT_METRICS, RUPTURES, LOSSES_SKU, PRICE_MARGIN_SKU, GIRO_COBERTURA_DATA } from "@/data/dominio/mock-data";
import type { GlobalFilters } from "@/data/dominio/types";

export function useProductCatalog(filters: GlobalFilters & { search?: string }) {
  return useMemo(() => {
    let data = PRODUCTS.map(p => {
      const metrics = PRODUCT_METRICS.find(m => m.sku === p.sku);
      return { ...p, ...metrics };
    });

    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(p =>
        p.sku.toLowerCase().includes(s) ||
        p.name.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s)
      );
    }

    if (filters.category && filters.category !== "all") {
      data = data.filter(p => p.category === filters.category);
    }

    return data;
  }, [filters.search, filters.category]);
}

export function useRuptures() {
  return useMemo(() => RUPTURES, []);
}

export function useLossesBySKU() {
  return useMemo(() => LOSSES_SKU, []);
}

export function usePriceMarginBySKU(filters: GlobalFilters) {
  return useMemo(() => {
    let data = [...PRICE_MARGIN_SKU];
    if (filters.unit_id !== "all") {
      data = data.filter(p => p.unit_id === filters.unit_id);
    }
    if (filters.category && filters.category !== "all") {
      data = data.filter(p => p.category === filters.category);
    }
    return data;
  }, [filters.unit_id, filters.category]);
}

export function useGiroCobertura() {
  return useMemo(() => GIRO_COBERTURA_DATA, []);
}
