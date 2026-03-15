import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useComprasSuppliers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-suppliers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compras_suppliers")
        .select("*")
        .order("composite_score", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useComprasSupplierScores(supplierId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-supplier-scores", supplierId, user?.id],
    queryFn: async () => {
      let q = supabase
        .from("compras_supplier_scores")
        .select("*")
        .order("period", { ascending: false });
      if (supplierId) q = q.eq("supplier_id", supplierId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useComprasPurchaseOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-purchase-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compras_purchase_orders")
        .select("*, compras_suppliers(name, cnpj)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useComprasAlerts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-alerts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compras_alerts")
        .select("*")
        .is("resolved_at", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useComprasKpiSnapshots() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-kpi-snapshots", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compras_kpi_snapshots")
        .select("*")
        .order("snapshot_date", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!user,
  });
}

export function useComprasTradeAllowances(supplierId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-trade-allowances", supplierId, user?.id],
    queryFn: async () => {
      let q = supabase
        .from("compras_trade_allowances")
        .select("*")
        .order("created_at", { ascending: false });
      if (supplierId) q = q.eq("supplier_id", supplierId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useComprasDivergences(supplierId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-divergences", supplierId, user?.id],
    queryFn: async () => {
      let q = supabase
        .from("compras_divergences")
        .select("*")
        .order("created_at", { ascending: false });
      if (supplierId) q = q.eq("supplier_id", supplierId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useComprasPriceHistory(supplierId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-price-history", supplierId, user?.id],
    queryFn: async () => {
      let q = supabase
        .from("compras_price_history")
        .select("*, compras_skus(name, code)")
        .order("effective_date", { ascending: true });
      if (supplierId) q = q.eq("supplier_id", supplierId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useComprasSupplierDetail(supplierId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-supplier-detail", supplierId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compras_suppliers")
        .select("*")
        .eq("id", supplierId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!supplierId,
  });
}

export function useComprasSkus(supplierId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-skus", supplierId, user?.id],
    queryFn: async () => {
      let q = supabase
        .from("compras_skus")
        .select("*")
        .order("name", { ascending: true });
      if (supplierId) q = q.eq("primary_supplier_id", supplierId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useComprasPoItems(poId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["compras-po-items", poId, user?.id],
    queryFn: async () => {
      let q = supabase
        .from("compras_po_items")
        .select("*, compras_skus(name, code)")
        .order("created_at", { ascending: true });
      if (poId) q = q.eq("purchase_order_id", poId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

// Helper to classify supplier by score
export function classifySupplier(score: number | null): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (!score || score === 0) return { label: "Sem Score", color: "text-muted-foreground", bgColor: "bg-muted" };
  if (score >= 85) return { label: "Parceiro Estratégico", color: "text-success", bgColor: "bg-success/10" };
  if (score >= 70) return { label: "Padrão", color: "text-app-compras", bgColor: "bg-app-compras/10" };
  if (score >= 50) return { label: "Observação", color: "text-warning", bgColor: "bg-warning/10" };
  return { label: "Em Risco", color: "text-destructive", bgColor: "bg-destructive/10" };
}

// Format currency BRL
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// Format percentage
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
