import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ==================== Types ====================

export interface ReceivingSchedule {
  id: string;
  tenant_id: string;
  scheduled_date: string;
  time_window_start: string | null;
  time_window_end: string | null;
  dock: string | null;
  supplier_id: string | null;
  purchase_order_id: string | null;
  vehicle_plate: string | null;
  driver_name: string | null;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  supplier_name?: string;
  po_number?: string;
}

export interface ReceivingRecord {
  id: string;
  tenant_id: string;
  schedule_id: string | null;
  purchase_order_id: string | null;
  invoice_number: string | null;
  invoice_total: number | null;
  operator_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  dock_to_stock_minutes: number | null;
  result: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  schedule_date?: string;
  supplier_name?: string;
  po_number?: string;
  items_count?: number;
}

export interface ReceivingItem {
  id: string;
  tenant_id: string;
  receiving_record_id: string;
  sku_id: string;
  po_item_id: string | null;
  qty_invoice: number;
  qty_physical: number;
  qty_accepted: number;
  qty_rejected: number;
  rejection_reason: string | null;
  batch_number: string | null;
  expiration_date: string | null;
  temperature_reading: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  // Joined
  sku_name?: string;
  sku_code?: string;
}

export interface NonConformity {
  id: string;
  tenant_id: string;
  type: string;
  severity: string;
  description: string | null;
  qty_affected: number | null;
  receiving_record_id: string | null;
  receiving_item_id: string | null;
  sku_id: string | null;
  supplier_id: string | null;
  photo_urls: string[] | null;
  treatment_status: string;
  treatment_action: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  sku_name?: string;
  supplier_name?: string;
}

export interface PutawayTask {
  id: string;
  tenant_id: string;
  sku_id: string;
  qty: number;
  receiving_record_id: string | null;
  stock_lot_id: string | null;
  suggested_location_id: string | null;
  actual_location_id: string | null;
  operator_id: string | null;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  sku_name?: string;
  suggested_location_code?: string;
  actual_location_code?: string;
}

// ==================== Schedules ====================

export function useReceivingSchedules() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-receiving-schedules", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_receiving_schedules")
        .select("*, cd_suppliers(name), cd_purchase_orders(po_number)")
        .eq("tenant_id", tenant.id)
        .order("scheduled_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        supplier_name: r.cd_suppliers?.name,
        po_number: r.cd_purchase_orders?.po_number,
      })) as ReceivingSchedule[];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  const { tenant, user } = useAuth();
  return useMutation({
    mutationFn: async (data: {
      scheduled_date: string;
      time_window_start?: string;
      time_window_end?: string;
      dock?: string;
      supplier_id?: string;
      purchase_order_id?: string;
      vehicle_plate?: string;
      driver_name?: string;
      notes?: string;
    }) => {
      if (!tenant?.id) throw new Error("Tenant não encontrado");
      const { error } = await supabase.from("cd_receiving_schedules").insert({
        ...data,
        tenant_id: tenant.id,
        created_by: user?.id || null,
        status: "scheduled",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-receiving-schedules"] });
      toast.success("Agendamento criado com sucesso");
    },
    onError: (e) => toast.error("Erro ao criar agendamento: " + e.message),
  });
}

export function useUpdateScheduleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("cd_receiving_schedules")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-receiving-schedules"] });
      toast.success("Status atualizado");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

// ==================== Records ====================

export function useReceivingRecords() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-receiving-records", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_receiving_records")
        .select("*, cd_receiving_schedules(scheduled_date, cd_suppliers(name)), cd_purchase_orders(po_number)")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        schedule_date: r.cd_receiving_schedules?.scheduled_date,
        supplier_name: r.cd_receiving_schedules?.cd_suppliers?.name,
        po_number: r.cd_purchase_orders?.po_number,
      })) as ReceivingRecord[];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateReceivingRecord() {
  const qc = useQueryClient();
  const { tenant, user } = useAuth();
  return useMutation({
    mutationFn: async (data: {
      schedule_id?: string;
      purchase_order_id?: string;
      invoice_number?: string;
      invoice_total?: number;
    }) => {
      if (!tenant?.id) throw new Error("Tenant não encontrado");
      const { error } = await supabase.from("cd_receiving_records").insert({
        ...data,
        tenant_id: tenant.id,
        operator_id: user?.id || null,
        started_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-receiving-records"] });
      toast.success("Conferência iniciada");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useCompleteReceivingRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, result, notes }: { id: string; result: string; notes?: string }) => {
      const started = await supabase
        .from("cd_receiving_records")
        .select("started_at")
        .eq("id", id)
        .single();
      const startedAt = started.data?.started_at;
      const now = new Date();
      const d2s = startedAt
        ? Math.round((now.getTime() - new Date(startedAt).getTime()) / 60000)
        : null;

      const { error } = await supabase
        .from("cd_receiving_records")
        .update({
          completed_at: now.toISOString(),
          result,
          notes,
          dock_to_stock_minutes: d2s,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-receiving-records"] });
      toast.success("Conferência finalizada");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

// ==================== Non-Conformities ====================

export function useNonConformities() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-non-conformities", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_non_conformities")
        .select("*, cd_skus(name), cd_suppliers(name)")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        sku_name: r.cd_skus?.name,
        supplier_name: r.cd_suppliers?.name,
      })) as NonConformity[];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateNonConformity() {
  const qc = useQueryClient();
  const { tenant, user } = useAuth();
  return useMutation({
    mutationFn: async (data: {
      type: string;
      severity: string;
      description?: string;
      qty_affected?: number;
      receiving_record_id?: string;
      receiving_item_id?: string;
      sku_id?: string;
      supplier_id?: string;
      photo_urls?: string[];
    }) => {
      if (!tenant?.id) throw new Error("Tenant não encontrado");
      const { error } = await supabase.from("cd_non_conformities").insert({
        ...data,
        tenant_id: tenant.id,
        created_by: user?.id || null,
        treatment_status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-non-conformities"] });
      toast.success("NC registrada com sucesso");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateNCTreatment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      id,
      treatment_status,
      treatment_action,
    }: {
      id: string;
      treatment_status: string;
      treatment_action?: string;
    }) => {
      const update: any = { treatment_status, treatment_action };
      if (treatment_status === "resolved") {
        update.resolved_at = new Date().toISOString();
        update.resolved_by = user?.id || null;
      }
      const { error } = await supabase
        .from("cd_non_conformities")
        .update(update)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-non-conformities"] });
      toast.success("NC atualizada");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

// ==================== Suppliers (lookup) ====================

export function useCDSuppliers() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-suppliers", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_suppliers")
        .select("id, name")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}
