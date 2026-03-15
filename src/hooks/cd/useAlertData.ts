import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCDAlerts() {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: ["cd-alerts", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("cd_alerts")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("cd_alerts")
        .update({ resolved_at: new Date().toISOString(), resolved_by: user?.id || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-alerts"] });
      toast.success("Alerta resolvido");
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useMarkAlertViewed() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("cd_alerts")
        .update({ viewed_at: new Date().toISOString(), viewed_by: user?.id || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cd-alerts"] });
    },
  });
}
