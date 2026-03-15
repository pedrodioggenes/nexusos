import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface DemandTemplate {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  default_type: string;
  default_priority: string;
  default_steps: unknown[] | null;
  default_approvals: unknown[] | null;
  default_fields: Record<string, unknown> | null;
  created_by: string;
  created_at: string;
}

export function useDemandTemplates() {
  const { tenant } = useAuth();

  return useQuery({
    queryKey: ["demand-templates", tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demand_templates")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as DemandTemplate[];
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateDemandTemplate() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      default_type: string;
      default_priority: string;
      default_fields?: Record<string, unknown>;
      default_steps?: unknown[];
      default_approvals?: unknown[];
    }) => {
      if (!tenant?.id || !user?.id) throw new Error("Sessão inválida");

      const { data, error } = await supabase
        .from("demand_templates")
        .insert([{
          name: input.name,
          description: input.description || null,
          default_type: input.default_type,
          default_priority: input.default_priority,
          default_fields: (input.default_fields || null) as Json,
          default_steps: (input.default_steps || null) as Json,
          default_approvals: (input.default_approvals || null) as Json,
          tenant_id: tenant.id,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demand-templates"] });
      toast.success("Template criado com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar template: ${err.message}`);
    },
  });
}

export function useDeleteDemandTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("demand_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demand-templates"] });
      toast.success("Template excluído");
    },
    onError: (err: Error) => {
      toast.error(`Erro: ${err.message}`);
    },
  });
}
