import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type EntityLinkType =
  | "retail_execution_run"
  | "retail_execution_item"
  | "marketing_execution"
  | "demand"
  | "campaign"
  | "plan"
  | "briefing";

export type RelationType = "evidence" | "reference" | "decision" | "request";

export interface HyperworksEntityLink {
  id: string;
  tenant_id: string;
  workspace_id: string | null;
  channel_id: string | null;
  message_id: string;
  entity_type: EntityLinkType;
  entity_id: string;
  relation_type: RelationType;
  label: string | null;
  excerpt: string | null;
  media_urls: string[] | null;
  created_by: string;
  created_at: string;
}

export interface CreateEntityLinkInput {
  message_id: string;
  entity_type: EntityLinkType;
  entity_id: string;
  relation_type?: RelationType;
  label?: string;
  excerpt?: string;
  media_urls?: string[];
  workspace_id?: string;
  channel_id?: string;
}

const QUERY_KEY = "hyperworks-entity-links";

export function useHyperworksEntityLinks(entity_type?: EntityLinkType, entity_id?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, entity_type, entity_id],
    queryFn: async () => {
      let query = supabase
        .from("hyperworks_entity_links" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (entity_type) query = query.eq("entity_type", entity_type);
      if (entity_id) query = query.eq("entity_id", entity_id);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as HyperworksEntityLink[];
    },
    enabled: !!entity_type && !!entity_id,
  });
}

export function useHyperworksLinksByMessage(message_id?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "by-message", message_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hyperworks_entity_links" as any)
        .select("*")
        .eq("message_id", message_id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as HyperworksEntityLink[];
    },
    enabled: !!message_id,
  });
}

export function useCreateHyperworksEntityLink() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateEntityLinkInput) => {
      if (!tenant?.id || !user?.id) throw new Error("Usuário ou tenant não encontrado");

      const { data, error } = await supabase
        .from("hyperworks_entity_links" as any)
        .insert({
          tenant_id: tenant.id,
          created_by: user.id,
          message_id: input.message_id,
          entity_type: input.entity_type,
          entity_id: input.entity_id,
          relation_type: input.relation_type || "evidence",
          label: input.label || null,
          excerpt: input.excerpt || null,
          media_urls: input.media_urls || null,
          workspace_id: input.workspace_id || null,
          channel_id: input.channel_id || null,
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as HyperworksEntityLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Vínculo criado com sucesso!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao criar vínculo: " + err.message);
    },
  });
}

export function useDeleteHyperworksEntityLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hyperworks_entity_links" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Vínculo removido!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao remover vínculo: " + err.message);
    },
  });
}
