import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface HWInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  interviewerId: string | null;
  interviewerName: string | null;
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  type: string;
  notes: string;
  result: string;
}

export function useHWInterviews(tenantId?: string, candidateId?: string) {
  return useQuery({
    queryKey: ["hw-interviews", tenantId, candidateId],
    queryFn: async () => {
      if (!tenantId) return [];
      let q = supabase
        .from("hw_interviews")
        .select("*, hw_candidates(name)")
        .eq("tenant_id", tenantId)
        .order("scheduled_at", { ascending: true });

      if (candidateId) q = q.eq("candidate_id", candidateId);

      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map((i: any) => ({
        id: i.id,
        candidateId: i.candidate_id,
        candidateName: i.hw_candidates?.name || '',
        interviewerId: i.interviewer_id,
        interviewerName: null,
        scheduledAt: i.scheduled_at,
        durationMinutes: i.duration_minutes || 30,
        location: i.location || '',
        type: i.type || 'presencial',
        notes: i.notes || '',
        result: i.result || 'pending',
      })) as HWInterview[];
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useCreateHWInterview() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      tenantId: string;
      candidateId: string;
      scheduledAt: string;
      durationMinutes?: number;
      location?: string;
      type?: string;
      interviewerId?: string;
      notes?: string;
    }) => {
      const { error } = await supabase.from("hw_interviews").insert({
        tenant_id: input.tenantId,
        candidate_id: input.candidateId,
        scheduled_at: input.scheduledAt,
        duration_minutes: input.durationMinutes || 30,
        location: input.location || '',
        type: input.type || 'presencial',
        interviewer_id: input.interviewerId || null,
        notes: input.notes || '',
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["hw-interviews", v.tenantId] });
    },
  });
}

export function useUpdateHWInterviewResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, result, tenantId }: { id: string; result: string; tenantId: string }) => {
      const { error } = await supabase.from("hw_interviews").update({ result }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["hw-interviews", v.tenantId] });
    },
  });
}
