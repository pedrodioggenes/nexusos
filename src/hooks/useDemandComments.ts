import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DemandComment {
  id: string;
  demand_id: string;
  user_id: string;
  tenant_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useDemandComments(demandId: string | undefined) {
  return useQuery({
    queryKey: ["demand-comments", demandId],
    queryFn: async () => {
      if (!demandId) return [];

      const { data, error } = await supabase
        .from("demand_comments")
        .select("*")
        .eq("demand_id", demandId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as DemandComment[];
    },
    enabled: !!demandId,
  });
}

export function useCreateDemandComment() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async ({ demandId, content }: { demandId: string; content: string }) => {
      if (!user?.id) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("demand_comments")
        .insert({
          demand_id: demandId,
          user_id: user.id,
          tenant_id: tenant?.id || null,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["demand-comments", data.demand_id] });
      toast.success("Comentário adicionado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao comentar: ${error.message}`);
    },
  });
}

export function useDeleteDemandComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ commentId, demandId }: { commentId: string; demandId: string }) => {
      if (!user?.id) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("demand_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
      return { demandId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["demand-comments", data.demandId] });
      toast.success("Comentário excluído!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });
}
