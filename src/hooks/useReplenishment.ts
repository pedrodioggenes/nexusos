import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useReplenishmentTasks(tenantId?: string, status?: string) {
  return useQuery({
    queryKey: ["replenishmentTasks", tenantId, status],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("replenishment_tasks")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("task_date", { ascending: false });
      
      if (status) {
        query = query.eq("status", status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useCreateReplenishmentTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (task: any) => {
      const { data, error } = await supabase
        .from("replenishment_tasks")
        .insert([task])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["replenishmentTasks", variables.tenant_id] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, tenantId }: { id: string; status: string; tenantId: string }) => {
      const updates: any = { status };
      if (status === "in_progress") updates.started_at = new Date().toISOString();
      if (status === "completed") updates.completed_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("replenishment_tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["replenishmentTasks", variables.tenantId] });
    },
  });
}

export function useRuptureRecords(tenantId?: string) {
  return useQuery({
    queryKey: ["ruptureRecords", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("rupture_records")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("detected_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useCreateRuptureRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (record: any) => {
      const { data, error } = await supabase
        .from("rupture_records")
        .insert([record])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ruptureRecords", variables.tenant_id] });
    },
  });
}

export function useExpirationAlerts(tenantId?: string) {
  return useQuery({
    queryKey: ["expirationAlerts", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("expiration_alerts")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .order("expiration_date", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useCreateExpirationAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alert: any) => {
      const { data, error } = await supabase
        .from("expiration_alerts")
        .insert([alert])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expirationAlerts", variables.tenant_id] });
    },
  });
}

export function useResolveExpirationAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, action, tenantId }: { id: string; action: string; tenantId: string }) => {
      const { data, error } = await supabase
        .from("expiration_alerts")
        .update({
          status: "removed",
          action_taken: action,
          action_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expirationAlerts", variables.tenantId] });
    },
  });
}
