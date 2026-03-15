import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHWCandidates(tenantId?: string) {
  return useQuery({
    queryKey: ["hw-candidates", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("hw_candidates")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        initials: c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
        position: c.position,
        status: c.status as 'novo' | 'em_analise' | 'aprovado' | 'reprovado',
        submittedAt: new Date(c.submitted_at).toLocaleDateString('pt-BR'),
        aiRecommended: c.ai_recommended,
        email: c.email || '',
        phone: c.phone || '',
        notes: c.notes,
        resumePath: c.resume_path,
        kanbanStage: (c as any).kanban_stage || undefined,
        rating: (c as any).rating || 0,
      }));
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useUpdateHWCandidateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, tenantId }: { id: string; status: string; tenantId: string }) => {
      const { error } = await supabase
        .from("hw_candidates")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-candidates", variables.tenantId] });
    },
  });
}
