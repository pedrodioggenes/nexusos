import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export type ResponseStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface DemandResponse {
  id: string;
  demand_id: string;
  user_id: string;
  content: Json; // BlockNote JSON content
  attachments: Json;
  deliverable_urls: Json;
  is_final: boolean | null;
  status: ResponseStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateResponseInput {
  demand_id: string;
  content: Json;
  attachments?: Json;
}

export interface UpdateResponseInput {
  content?: Json;
  attachments?: Json;
  status?: ResponseStatus;
  review_notes?: string;
}

// Fetch responses for a specific demand
export function useDemandResponses(demandId: string | undefined) {
  return useQuery({
    queryKey: ["demand-responses", demandId],
    queryFn: async () => {
      if (!demandId) return [];

      const { data, error } = await supabase
        .from("demand_responses")
        .select("*")
        .eq("demand_id", demandId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DemandResponse[];
    },
    enabled: !!demandId,
  });
}

// Fetch user's own response for a demand (for colaborador view)
export function useMyDemandResponse(demandId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-demand-response", demandId, user?.id],
    queryFn: async () => {
      if (!demandId || !user?.id) return null;

      const { data, error } = await supabase
        .from("demand_responses")
        .select("*")
        .eq("demand_id", demandId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as DemandResponse | null;
    },
    enabled: !!demandId && !!user?.id,
  });
}

// Create a new response
export function useCreateDemandResponse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateResponseInput) => {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      const insertData = {
        demand_id: input.demand_id,
        user_id: user.id,
        content: input.content,
        attachments: input.attachments || [],
        status: 'draft' as const,
      };

      const { data, error } = await supabase
        .from("demand_responses")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["demand-responses", data.demand_id] });
      queryClient.invalidateQueries({ queryKey: ["my-demand-response", data.demand_id] });
      toast.success("Rascunho salvo!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });
}

// Update a response
export function useUpdateDemandResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateResponseInput & { id: string }) => {
      const updateData: Record<string, unknown> = { ...input };

      // Auto-set timestamps based on status changes
      if (input.status === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
      }
      if (input.status === 'approved' || input.status === 'rejected') {
        updateData.reviewed_at = new Date().toISOString();
      }

      if (input.content) {
        updateData.content = input.content as unknown as Record<string, unknown>;
      }

      const { data, error } = await supabase
        .from("demand_responses")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["demand-responses", data.demand_id] });
      queryClient.invalidateQueries({ queryKey: ["my-demand-response", data.demand_id] });
      
      if (data.status === 'submitted') {
        toast.success("Resposta enviada para revisão!");
      } else if (data.status === 'approved') {
        toast.success("Resposta aprovada!");
      } else if (data.status === 'rejected') {
        toast.success("Ajustes solicitados!");
      } else {
        toast.success("Resposta atualizada!");
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

// Submit response for review
export function useSubmitDemandResponse() {
  const updateResponse = useUpdateDemandResponse();

  return useMutation({
    mutationFn: async (id: string) => {
      return updateResponse.mutateAsync({ id, status: 'submitted' });
    },
  });
}

// Approve or reject response (for gestor)
export function useReviewDemandResponse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      review_notes 
    }: { 
      id: string; 
      status: 'approved' | 'rejected'; 
      review_notes?: string;
    }) => {
      // First, update the response
      const { data, error } = await supabase
        .from("demand_responses")
        .update({
          status,
          review_notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", id)
        .select("*, marketing_demands(title, tenant_id)")
        .single();

      if (error) throw error;

      // Log the review action in audit_logs
      const demandData = (data as any).marketing_demands;
      await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action: status === 'approved' ? 'response_approved' : 'response_rejected',
        resource_type: 'demand_response',
        resource_id: id,
        tenant_id: demandData?.tenant_id,
        metadata: {
          demand_id: data.demand_id,
          demand_title: demandData?.title,
          respondent_user_id: data.user_id,
          reviewer_notes: review_notes || null,
          reviewed_at: new Date().toISOString(),
        },
      });

      // Create notification for the respondent
      if (data.user_id && demandData?.tenant_id) {
        await supabase.rpc('create_notification', {
          p_user_id: data.user_id,
          p_tenant_id: demandData.tenant_id,
          p_type: 'demand_response',
          p_title: status === 'approved' ? 'Resposta Aprovada! ✅' : 'Ajustes Solicitados ⚠️',
          p_message: status === 'approved' 
            ? `Sua resposta para "${demandData.title}" foi aprovada pelo gestor.${review_notes ? ` Feedback: ${review_notes}` : ''}`
            : `O gestor solicitou ajustes na sua resposta para "${demandData.title}".${review_notes ? ` Feedback: ${review_notes}` : ''}`,
          p_resource_type: 'demand_responses',
          p_resource_id: id,
          p_severity: status === 'approved' ? 'success' : 'warning',
          p_action_url: '/app/marketing/demandas',
        });
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["demand-responses", data.demand_id] });
      queryClient.invalidateQueries({ queryKey: ["my-demand-response", data.demand_id] });
      queryClient.invalidateQueries({ queryKey: ["marketing-demands"] });
      
      toast.success(data.status === 'approved' ? "Resposta aprovada!" : "Ajustes solicitados!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao revisar: ${error.message}`);
    },
  });
}

// Response status config
export const responseStatusConfig: Record<ResponseStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: "Rascunho", color: "text-muted-foreground", bgColor: "bg-muted" },
  submitted: { label: "Enviado", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  approved: { label: "Aprovado", color: "text-green-500", bgColor: "bg-green-500/10" },
  rejected: { label: "Ajustes", color: "text-orange-500", bgColor: "bg-orange-500/10" },
};
