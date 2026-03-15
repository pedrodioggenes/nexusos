import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type DemandType = 'social_media' | 'design' | 'copywriting' | 'video' | 'general';
export type DemandPriority = 'urgent' | 'high' | 'medium' | 'low';
export type DemandStatus = 'open' | 'in_progress' | 'review' | 'approved' | 'completed' | 'cancelled';

export interface MarketingDemand {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  type: DemandType;
  priority: DemandPriority;
  status: DemandStatus;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  campaign_id: string | null;
  document_id: string | null;
  budget_id: string | null;
  tags: string[];
  attachments: string[];
  estimated_hours: number | null;
  actual_hours: number | null;
  comments_count: number;
  activity_log: Record<string, unknown>[];
  deliverable_kind: string | null;
  destination_scope: Record<string, unknown> | null;
  channels: string[] | null;
}

export interface DemandFilters {
  status?: DemandStatus | DemandStatus[];
  priority?: DemandPriority;
  assigned_to?: string;
  type?: DemandType;
  search?: string;
}

export interface CreateDemandInput {
  title: string;
  description?: string;
  type: DemandType;
  priority: DemandPriority;
  due_date?: string;
  assigned_to?: string;
  campaign_id?: string;
  document_id?: string;
  budget_id?: string;
  tags?: string[];
  estimated_hours?: number;
  attachments?: string[];
  deliverable_kind?: string;
  destination_scope?: Record<string, unknown>;
  channels?: string[];
}

export interface UpdateDemandInput extends Partial<CreateDemandInput> {
  status?: DemandStatus;
  actual_hours?: number;
}

export function useMarketingDemands(filters?: DemandFilters) {
  const { tenant } = useAuth();

  return useQuery({
    queryKey: ["marketing-demands", tenant?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from("marketing_demands")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in("status", filters.status);
        } else {
          query = query.eq("status", filters.status);
        }
      }

      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters?.assigned_to) {
        query = query.eq("assigned_to", filters.assigned_to);
      }

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MarketingDemand[];
    },
    enabled: !!tenant?.id,
  });
}

export function useDemandStats() {
  const { tenant } = useAuth();

  return useQuery({
    queryKey: ["demand-stats", tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_demands")
        .select("status, priority, due_date");

      if (error) throw error;

      const demands = data || [];
      const today = new Date().toISOString().split('T')[0];

      return {
        total: demands.length,
        open: demands.filter(d => d.status === 'open').length,
        inProgress: demands.filter(d => d.status === 'in_progress').length,
        review: demands.filter(d => d.status === 'review').length,
        approved: demands.filter(d => d.status === 'approved').length,
        completed: demands.filter(d => d.status === 'completed').length,
        cancelled: demands.filter(d => d.status === 'cancelled').length,
        overdue: demands.filter(d => 
          d.due_date && 
          d.due_date < today && 
          !['completed', 'cancelled', 'approved'].includes(d.status)
        ).length,
        urgent: demands.filter(d => d.priority === 'urgent' && !['completed', 'cancelled', 'approved'].includes(d.status)).length,
      };
    },
    enabled: !!tenant?.id,
  });
}

export function useCreateDemand() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateDemandInput) => {
      if (!tenant?.id || !user?.id) {
        throw new Error("Usuário ou tenant não encontrado");
      }

      const { destination_scope, channels, ...rest } = input;
      const insertData: Record<string, unknown> = {
        ...rest,
        tenant_id: tenant.id,
        created_by: user.id,
        tags: input.tags || [],
      };
      if (destination_scope) insertData.destination_scope = destination_scope;
      if (channels) insertData.channels = channels;

      const { data, error } = await supabase
        .from("marketing_demands")
        .insert([insertData as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-demands"] });
      queryClient.invalidateQueries({ queryKey: ["demand-stats"] });
      toast.success("Demanda criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar demanda: ${error.message}`);
    },
  });
}

export function useUpdateDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateDemandInput & { id: string }) => {
      const updateData: Record<string, unknown> = { ...input };

      // Auto-set timestamps based on status changes
      if (input.status === 'in_progress' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      if (input.status === 'completed' && !updateData.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("marketing_demands")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-demands"] });
      queryClient.invalidateQueries({ queryKey: ["demand-stats"] });
      toast.success("Demanda atualizada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar demanda: ${error.message}`);
    },
  });
}

export function useDeleteDemand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("marketing_demands")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-demands"] });
      queryClient.invalidateQueries({ queryKey: ["demand-stats"] });
      toast.success("Demanda excluída!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir demanda: ${error.message}`);
    },
  });
}

export function useDemandById(demandId: string | undefined) {
  return useQuery({
    queryKey: ["marketing-demand", demandId],
    queryFn: async () => {
      if (!demandId) return null;
      const { data, error } = await supabase
        .from("marketing_demands")
        .select("*")
        .eq("id", demandId)
        .maybeSingle();

      if (error) throw error;
      return data as MarketingDemand | null;
    },
    enabled: !!demandId,
  });
}

// Utility functions for demand status and priority
export const demandStatusConfig: Record<DemandStatus, { label: string; color: string; bgColor: string }> = {
  open: { label: "A Fazer", color: "text-muted-foreground", bgColor: "bg-muted" },
  in_progress: { label: "Fazendo", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  review: { label: "Revisão", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  approved: { label: "Aprovado", color: "text-green-500", bgColor: "bg-green-500/10" },
  completed: { label: "Concluído", color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
  cancelled: { label: "Cancelado", color: "text-destructive", bgColor: "bg-destructive/10" },
};

export const demandPriorityConfig: Record<DemandPriority, { label: string; color: string; bgColor: string }> = {
  urgent: { label: "Urgente", color: "text-red-500", bgColor: "bg-red-500/10" },
  high: { label: "Alta", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  medium: { label: "Média", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  low: { label: "Baixa", color: "text-slate-400", bgColor: "bg-slate-500/10" },
};

export const demandTypeConfig: Record<DemandType, { label: string; icon: string }> = {
  social_media: { label: "Social Media", icon: "📱" },
  design: { label: "Design", icon: "🎨" },
  copywriting: { label: "Copywriting", icon: "✍️" },
  video: { label: "Vídeo", icon: "🎬" },
  general: { label: "Geral", icon: "📋" },
};

export function useExecutableDemands() {
  const { tenant } = useAuth();

  return useQuery({
    queryKey: ["executable-demands", tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_demands")
        .select("*")
        .in("status", ["approved", "completed"])
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as MarketingDemand[];
    },
    enabled: !!tenant?.id,
  });
}
