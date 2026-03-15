import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useLossRecords() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-loss-records", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_loss_records")
        .select("*, cd_skus(description, sku_code, abc_curve, avg_unit_cost), cd_stores(name, code), cd_suppliers(name)")
        .eq("tenant_id", tenant.id)
        .order("recorded_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        sku_name: r.cd_skus?.description,
        sku_code: r.cd_skus?.sku_code,
        abc_curve: r.cd_skus?.abc_curve,
        avg_unit_cost: r.cd_skus?.avg_unit_cost,
        store_name: r.cd_stores?.name,
        supplier_name: r.cd_suppliers?.name,
      }));
    },
    enabled: !!tenant?.id,
  });
}

export function useKpiSnapshots() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-kpi-snapshots", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_kpi_snapshots")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("snapshot_date", { ascending: false })
        .limit(90);
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}
