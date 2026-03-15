import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ==================== Locations ====================

export function useLocations() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-locations", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_locations")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("zone")
        .order("code");
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  const { tenant } = useAuth();
  return useMutation({
    mutationFn: async (data: {
      code: string;
      zone: string;
      location_type?: string;
      aisle?: string;
      module?: string;
      level?: string;
      position?: string;
      max_weight_kg?: number;
      max_volume_m3?: number;
      width_cm?: number;
      height_cm?: number;
      depth_cm?: number;
    }) => {
      if (!tenant?.id) throw new Error("Tenant não encontrado");
      const { error } = await supabase.from("cd_locations").insert({
        ...data,
        tenant_id: tenant.id,
        location_type: data.location_type || "shelf",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-locations"] });
      toast.success("Endereço criado com sucesso");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useToggleLocationActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("cd_locations")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-locations"] });
      toast.success("Endereço atualizado");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

// ==================== Stock Lots ====================

export function useStockLots() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-stock-lots", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_stock_lots")
        .select("*, cd_skus(name, code), cd_locations(code, zone)")
        .eq("tenant_id", tenant.id)
        .order("expiration_date", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        sku_name: r.cd_skus?.name,
        sku_code: r.cd_skus?.code,
        location_code: r.cd_locations?.code,
        location_zone: r.cd_locations?.zone,
      }));
    },
    enabled: !!tenant?.id,
  });
}

// ==================== Cycle Counts ====================

export function useCycleCounts() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-cycle-counts", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_cycle_counts")
        .select("*, cd_skus(name, code), cd_locations(code, zone)")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        sku_name: r.cd_skus?.name,
        sku_code: r.cd_skus?.code,
        location_code: r.cd_locations?.code,
        location_zone: r.cd_locations?.zone,
      }));
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateCycleCount() {
  const qc = useQueryClient();
  const { tenant } = useAuth();
  return useMutation({
    mutationFn: async (data: {
      sku_id: string;
      location_id?: string;
      qty_system: number;
    }) => {
      if (!tenant?.id) throw new Error("Tenant não encontrado");
      const { error } = await supabase.from("cd_cycle_counts").insert({
        ...data,
        tenant_id: tenant.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-cycle-counts"] });
      toast.success("Contagem criada");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useRegisterCount() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, qty_physical }: { id: string; qty_physical: number }) => {
      // get qty_system to calculate delta
      const { data: row } = await supabase
        .from("cd_cycle_counts")
        .select("qty_system")
        .eq("id", id)
        .single();
      const qtySystem = row?.qty_system || 0;
      const delta = qty_physical - qtySystem;
      const deltaPct = qtySystem > 0 ? Math.round((delta / qtySystem) * 10000) / 100 : 0;

      const { error } = await supabase
        .from("cd_cycle_counts")
        .update({
          qty_physical,
          delta,
          delta_pct: deltaPct,
          counted_at: new Date().toISOString(),
          counted_by: user?.id || null,
          status: "counted",
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-cycle-counts"] });
      toast.success("Contagem registrada");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useApproveCycleCount() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, adjustment_reason }: { id: string; adjustment_reason?: string }) => {
      const { error } = await supabase
        .from("cd_cycle_counts")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user?.id || null,
          adjustment_reason: adjustment_reason || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-cycle-counts"] });
      toast.success("Contagem aprovada e ajuste aplicado");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}
