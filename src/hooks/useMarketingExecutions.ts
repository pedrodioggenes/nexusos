import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ExecutionChannel =
  | "instagram" | "facebook" | "whatsapp" | "offline" | "tv" | "encarte" | "outro"
  // New categories
  | "tiktok" | "youtube" | "linkedin" | "site" | "email"
  | "loja" | "tv_interna"
  | "endomarketing" | "compras" | "treinamento" | "producao_fisica" | "outros";

export type ExecutionEntityType = "demand" | "campaign" | "plan";

export interface MarketingExecution {
  id: string;
  tenant_id: string;
  entity_type: ExecutionEntityType;
  entity_id: string;
  channel: ExecutionChannel;
  execution_date: string;
  link_url: string | null;
  evidence_urls: string[];
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CreateExecutionInput {
  entity_type: ExecutionEntityType;
  entity_id: string;
  channel: ExecutionChannel;
  execution_date?: string;
  link_url?: string;
  evidence_urls?: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
}

/** Unified execution category config — replaces old channelConfig */
export const executionCategoryConfig: Record<string, { label: string; icon: string }> = {
  // Digital
  instagram: { label: "Instagram", icon: "📸" },
  facebook: { label: "Facebook", icon: "📘" },
  tiktok: { label: "TikTok", icon: "🎵" },
  youtube: { label: "YouTube", icon: "▶️" },
  linkedin: { label: "LinkedIn", icon: "💼" },
  site: { label: "Site", icon: "🌐" },
  email: { label: "E-mail", icon: "📧" },
  // Direct
  whatsapp: { label: "WhatsApp", icon: "💬" },
  loja: { label: "Loja Física", icon: "🏬" },
  tv_interna: { label: "TV Interna", icon: "📺" },
  encarte: { label: "Encarte", icon: "📰" },
  // Operational
  endomarketing: { label: "Endomarketing", icon: "👔" },
  compras: { label: "Compras / Aquisição", icon: "🛒" },
  treinamento: { label: "Treinamento", icon: "🎓" },
  producao_fisica: { label: "Produção Física", icon: "🏗️" },
  outros: { label: "Outros", icon: "📋" },
  // Legacy keys (backwards compat)
  offline: { label: "Offline", icon: "🏪" },
  tv: { label: "TV Interna", icon: "📺" },
  outro: { label: "Outro", icon: "📋" },
};

/** @deprecated Use executionCategoryConfig */
export const channelConfig = executionCategoryConfig;

export const entityTypeConfig: Record<ExecutionEntityType, { label: string }> = {
  demand: { label: "Demanda" },
  campaign: { label: "Campanha" },
  plan: { label: "Planejamento" },
};

export interface ExecutionFilters {
  channel?: ExecutionChannel;
  entity_type?: ExecutionEntityType;
  dateFrom?: string;
  dateTo?: string;
}

export function useMarketingExecutions(filters?: ExecutionFilters) {
  return useQuery({
    queryKey: ["marketing-executions", filters],
    queryFn: async () => {
      let query = supabase
        .from("marketing_executions")
        .select("*")
        .order("execution_date", { ascending: false });

      if (filters?.channel) {
        query = query.eq("channel", filters.channel);
      }
      if (filters?.entity_type) {
        query = query.eq("entity_type", filters.entity_type);
      }
      if (filters?.dateFrom) {
        query = query.gte("execution_date", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("execution_date", filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((d) => ({
        ...d,
        evidence_urls: Array.isArray(d.evidence_urls) ? d.evidence_urls as string[] : [],
      })) as MarketingExecution[];
    },
  });
}

export function useExecutionStats() {
  const { data: executions = [] } = useMarketingExecutions();

  const total = executions.length;
  const withEvidence = executions.filter((e) => e.evidence_urls.length > 0).length;
  const withLink = executions.filter((e) => e.link_url).length;

  const byChannel: Record<string, number> = {};
  executions.forEach((e) => {
    byChannel[e.channel] = (byChannel[e.channel] || 0) + 1;
  });

  return {
    total,
    withEvidence,
    withoutEvidence: total - withEvidence,
    evidenceRate: total > 0 ? Math.round((withEvidence / total) * 100) : 0,
    withLink,
    byChannel,
  };
}

export function useCreateExecution() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateExecutionInput) => {
      if (!tenant?.id || !user?.id) throw new Error("Usuário ou tenant não encontrado");

      const { data, error } = await supabase
        .from("marketing_executions")
        .insert({
          tenant_id: tenant.id,
          created_by: user.id,
          entity_type: input.entity_type,
          entity_id: input.entity_id,
          channel: input.channel,
          execution_date: input.execution_date || new Date().toISOString(),
          link_url: input.link_url || null,
          evidence_urls: input.evidence_urls || [],
          notes: input.notes || null,
          metadata: input.metadata || {},
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-executions"] });
      toast.success("Execução registrada com sucesso!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao registrar execução: " + err.message);
    },
  });
}

export interface UpdateExecutionInput {
  id: string;
  channel?: ExecutionChannel;
  execution_date?: string;
  link_url?: string | null;
  evidence_urls?: string[];
  notes?: string | null;
}

export function useUpdateExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateExecutionInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("marketing_executions")
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-executions"] });
      toast.success("Execução atualizada!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao atualizar: " + err.message);
    },
  });
}

export function useDeleteExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketing_executions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-executions"] });
      toast.success("Execução removida!");
    },
    onError: (err: Error) => {
      toast.error("Erro ao remover: " + err.message);
    },
  });
}

export function useExecutionsByDemand(demandId: string | undefined) {
  return useQuery({
    queryKey: ["marketing-executions", "demand", demandId],
    queryFn: async () => {
      if (!demandId) return [];
      const { data, error } = await supabase
        .from("marketing_executions")
        .select("*")
        .eq("entity_type", "demand")
        .eq("entity_id", demandId)
        .order("execution_date", { ascending: false });

      if (error) throw error;
      return (data || []).map((d) => ({
        ...d,
        evidence_urls: Array.isArray(d.evidence_urls) ? d.evidence_urls as string[] : [],
      })) as MarketingExecution[];
    },
    enabled: !!demandId,
  });
}
