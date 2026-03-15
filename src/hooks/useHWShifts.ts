import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HWShift {
  id: string;
  team_id: string;
  user_id: string;
  tenant_id: string;
  shift_date: string;
  shift_type: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  created_by: string | null;
}

export const SHIFT_TYPES: Record<string, { label: string; color: string; bg: string; start: string; end: string }> = {
  morning: { label: 'Manhã', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', start: '06:00', end: '14:00' },
  afternoon: { label: 'Tarde', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', start: '14:00', end: '22:00' },
  night: { label: 'Noite', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', start: '22:00', end: '06:00' },
  day_off: { label: 'Folga', color: '#71717A', bg: 'rgba(113, 113, 122, 0.15)', start: '', end: '' },
};

export function useHWShifts(tenantId?: string, weekStart?: string, weekEnd?: string) {
  return useQuery({
    queryKey: ["hw-shifts", tenantId, weekStart, weekEnd],
    queryFn: async (): Promise<HWShift[]> => {
      if (!tenantId || !weekStart || !weekEnd) return [];
      const { data, error } = await supabase
        .from("hw_shifts")
        .select("*")
        .eq("tenant_id", tenantId)
        .gte("shift_date", weekStart)
        .lte("shift_date", weekEnd)
        .order("shift_date");
      if (error) throw error;
      return (data || []) as HWShift[];
    },
    enabled: !!tenantId && !!weekStart && !!weekEnd,
    staleTime: 60_000,
  });
}

export function useUpsertShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (shift: {
      team_id: string; user_id: string; tenant_id: string;
      shift_date: string; shift_type: string;
      start_time?: string; end_time?: string; notes?: string; created_by?: string;
    }) => {
      const { data, error } = await supabase
        .from("hw_shifts")
        .upsert({
          team_id: shift.team_id,
          user_id: shift.user_id,
          tenant_id: shift.tenant_id,
          shift_date: shift.shift_date,
          shift_type: shift.shift_type,
          start_time: shift.start_time || null,
          end_time: shift.end_time || null,
          notes: shift.notes || null,
          created_by: shift.created_by || null,
        }, { onConflict: 'team_id,user_id,shift_date' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hw-shifts"] });
    },
  });
}
