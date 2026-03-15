import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useHWTrainings(tenantId?: string, userId?: string) {
  return useQuery({
    queryKey: ["hw-trainings", tenantId, userId],
    queryFn: async () => {
      if (!tenantId) return [];

      let query = supabase
        .from("hw_training_assignments")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("assigned_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(t => ({
        id: t.id,
        title: t.training_title,
        description: t.training_description,
        status: t.status as 'completed' | 'in_progress' | 'pending',
        mandatory: t.mandatory,
        completedAt: t.completed_at ? new Date(t.completed_at).toLocaleDateString('pt-BR') : undefined,
        assignedAt: t.assigned_at,
        userId: t.user_id,
        teamId: t.team_id,
        dueDate: (t as any).due_date || undefined,
      }));
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useAssignHWTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (training: {
      tenant_id: string;
      user_id: string;
      training_title: string;
      training_description?: string;
      mandatory: boolean;
      assigned_by: string;
      team_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("hw_training_assignments")
        .insert([training])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hw-trainings", variables.tenant_id] });
    },
  });
}
