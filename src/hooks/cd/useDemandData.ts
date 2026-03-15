import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ==================== SKUs (full for ABC) ====================

export function useCDSkus() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-skus-full", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_skus")
        .select("id, sku_code, description, category, subcategory, abc_curve, avg_unit_cost, avg_unit_price, pack_size, lead_time_days, is_active")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("description");
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}

// ==================== Stores ====================

export function useCDStores() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-stores", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_stores")
        .select("id, name, code")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}

// ==================== Order Suggestions (Reposição) ====================

export function useOrderSuggestions() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-order-suggestions", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_order_suggestions")
        .select("*, cd_skus(description, sku_code, abc_curve), cd_stores(name, code)")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        sku_name: r.cd_skus?.description,
        sku_code: r.cd_skus?.sku_code,
        abc_curve: r.cd_skus?.abc_curve,
        store_name: r.cd_stores?.name,
        store_code: r.cd_stores?.code,
      }));
    },
    enabled: !!tenant?.id,
  });
}

export function useApproveOrderSuggestion() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("cd_order_suggestions")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user?.id || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-order-suggestions"] });
      toast.success("Sugestão aprovada");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useRejectOrderSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("cd_order_suggestions")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-order-suggestions"] });
      toast.success("Sugestão rejeitada");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

// ==================== Consumption History ====================

export function useConsumptionHistory(storeId?: string) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-consumption-history", tenant?.id, storeId],
    queryFn: async () => {
      if (!tenant?.id) return [];
      let q = supabase
        .from("cd_consumption_history")
        .select("*, cd_skus(description, sku_code), cd_stores(name)")
        .eq("tenant_id", tenant.id)
        .order("consumption_date", { ascending: false })
        .limit(500);
      if (storeId) q = q.eq("store_id", storeId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        sku_name: r.cd_skus?.description,
        sku_code: r.cd_skus?.sku_code,
        store_name: r.cd_stores?.name,
      }));
    },
    enabled: !!tenant?.id,
  });
}
