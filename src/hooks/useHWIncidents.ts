import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HWIncident {
  id: string;
  user_id: string;
  tenant_id: string;
  type: string;
  description: string;
  severity: string;
  created_by: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export const INCIDENT_TYPES: Record<string, string> = {
  observation: 'Observação',
  warning: 'Advertência',
  absence: 'Falta',
  late: 'Atraso',
  praise: 'Elogio',
  other: 'Outro',
};

export const SEVERITY_LEVELS: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Baixa', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  medium: { label: 'Média', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  high: { label: 'Alta', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

export function useHWIncidents(tenantId?: string, userId?: string) {
  return useQuery({
    queryKey: ["hw-incidents", tenantId, userId],
    queryFn: async (): Promise<HWIncident[]> => {
      if (!tenantId) return [];
      let q = supabase
        .from("hw_incidents")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (userId) q = q.eq("user_id", userId);
      const { data, error } = await q.limit(50);
      if (error) throw error;
      return (data || []) as HWIncident[];
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (incident: {
      user_id: string; tenant_id: string; type: string;
      description: string; severity: string; created_by: string;
    }) => {
      const { data, error } = await supabase
        .from("hw_incidents")
        .insert([incident])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hw-incidents"] });
    },
  });
}
