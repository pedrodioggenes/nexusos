import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useExecutiveMetrics(tenantId?: string, periodType?: string) {
  return useQuery({
    queryKey: ["executiveMetrics", tenantId, periodType],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("executive_metrics")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("metric_date", { ascending: false })
        .limit(30);
      
      if (periodType) {
        query = query.eq("period_type", periodType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useStrategicAlerts(tenantId?: string) {
  return useQuery({
    queryKey: ["strategicAlerts", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("strategic_alerts")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      const { data, error } = await supabase
        .from("strategic_alerts")
        .update({ is_dismissed: true })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["strategicAlerts", variables.tenantId] });
    },
  });
}

export function useCustomReports(tenantId?: string) {
  return useQuery({
    queryKey: ["customReports", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("custom_reports")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenantId,
  });
}

export function useCreateCustomReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (report: any) => {
      const { data, error } = await supabase
        .from("custom_reports")
        .insert([report])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customReports", variables.tenant_id] });
    },
  });
}
