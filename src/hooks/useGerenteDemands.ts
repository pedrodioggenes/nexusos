import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GerenteDemand {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
  channels: string[];
  assigned_to: string | null;
  tenant_id: string;
}

export function useGerenteDemands() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["gerente-demands", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("marketing_demands")
        .select("id, title, type, priority, status, due_date, created_at, channels, assigned_to, tenant_id")
        .in("status", ["approved", "completed"])
        .eq("assigned_to", user.id)
        .order("due_date", { ascending: true, nullsFirst: false });

      if (error) throw error;

      return (data || []).map((d) => ({
        ...d,
        channels: Array.isArray(d.channels) ? (d.channels as string[]) : [],
      })) as GerenteDemand[];
    },
    enabled: !!user?.id,
  });
}

export function useGerenteExecutions(demandIds: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["gerente-executions", user?.id, demandIds],
    queryFn: async () => {
      if (!user?.id || demandIds.length === 0) return [];

      const { data, error } = await supabase
        .from("marketing_executions")
        .select("*")
        .eq("entity_type", "demand")
        .in("entity_id", demandIds)
        .eq("created_by", user.id)
        .order("execution_date", { ascending: false });

      if (error) throw error;
      return (data || []).map((d) => ({
        ...d,
        evidence_urls: Array.isArray(d.evidence_urls) ? (d.evidence_urls as string[]) : [],
      }));
    },
    enabled: !!user?.id && demandIds.length > 0,
  });
}
