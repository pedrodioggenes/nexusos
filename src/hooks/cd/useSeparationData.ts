import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ==================== Transfer Orders ====================

export function useTransferOrders() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-transfer-orders", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_transfer_orders")
        .select("*, cd_stores(name, code)")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        store_name: r.cd_stores?.name,
        store_code: r.cd_stores?.code,
      }));
    },
    enabled: !!tenant?.id,
  });
}

export function useTransferOrderItems(orderId?: string) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-transfer-order-items", tenant?.id, orderId],
    queryFn: async () => {
      if (!tenant?.id || !orderId) return [];
      const { data, error } = await supabase
        .from("cd_transfer_order_items")
        .select("*, cd_skus(description, sku_code)")
        .eq("tenant_id", tenant.id)
        .eq("transfer_order_id", orderId)
        .order("created_at");
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        sku_name: r.cd_skus?.description,
        sku_code: r.cd_skus?.sku_code,
      }));
    },
    enabled: !!tenant?.id && !!orderId,
  });
}

export function useUpdateTransferOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, extra }: { id: string; status: string; extra?: Record<string, any> }) => {
      const { error } = await supabase
        .from("cd_transfer_orders")
        .update({ status, ...extra })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-transfer-orders"] });
      toast.success("Status atualizado");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

// ==================== Picking Waves ====================

export function usePickingWaves() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-picking-waves", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_picking_waves")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}

export function useUpdateWaveStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, extra }: { id: string; status: string; extra?: Record<string, any> }) => {
      const { error } = await supabase
        .from("cd_picking_waves")
        .update({ status, ...extra })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-picking-waves"] });
      toast.success("Wave atualizada");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

// ==================== Picking Tasks ====================

export function usePickingTasks(waveId?: string) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-picking-tasks", tenant?.id, waveId],
    queryFn: async () => {
      if (!tenant?.id) return [];
      let q = supabase
        .from("cd_picking_tasks")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("sequence_order", { ascending: true })
        .limit(500);
      if (waveId) q = q.eq("wave_id", waveId);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}

export function useUpdatePickingTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, status, extra }: { id: string; status: string; extra?: Record<string, any> }) => {
      const updates: Record<string, any> = { status, ...extra };
      if (status === "in_progress" && !extra?.started_at) updates.started_at = new Date().toISOString();
      if (status === "completed" && !extra?.completed_at) {
        updates.completed_at = new Date().toISOString();
        updates.operator_id = user?.id || null;
      }
      const { error } = await supabase
        .from("cd_picking_tasks")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-picking-tasks"] });
      toast.success("Task atualizada");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

// ==================== Romaneios ====================

export function useRomaneios() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-romaneios", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_romaneios")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}

export function useUpdateRomaneioStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, extra }: { id: string; status: string; extra?: Record<string, any> }) => {
      const { error } = await supabase
        .from("cd_romaneios")
        .update({ status, ...extra })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-romaneios"] });
      toast.success("Romaneio atualizado");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}
