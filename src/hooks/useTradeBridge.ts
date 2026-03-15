import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface TradeReference {
  id: string;
  tenant_id: string;
  retail_action_id: string;
  hypertrade_deal_id: string | null;
  supplier_id: string | null;
  status_snapshot: any;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeRequest {
  id: string;
  tenant_id: string;
  retail_action_id: string | null;
  title: string;
  period: string | null;
  stores: any;
  mechanics: string | null;
  requested_support: any;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const TRADE_REQUEST_STATUSES = [
  { value: "draft", label: "Rascunho", color: "bg-muted text-muted-foreground" },
  { value: "sent", label: "Enviado", color: "bg-blue-500/10 text-blue-500" },
  { value: "accepted", label: "Aceito", color: "bg-green-600/10 text-green-600" },
  { value: "rejected", label: "Rejeitado", color: "bg-destructive/10 text-destructive" },
] as const;

export function useTradeReferences(retailActionId?: string) {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = tenant?.id;

  const refsQuery = useQuery({
    queryKey: ["trade-references", tenantId, retailActionId],
    queryFn: async () => {
      if (!tenantId) return [];
      let query = supabase.from("trade_references").select("*").eq("tenant_id", tenantId);
      if (retailActionId) query = query.eq("retail_action_id", retailActionId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as TradeReference[];
    },
    enabled: !!tenantId,
  });

  const createRef = useMutation({
    mutationFn: async (input: {
      retail_action_id: string;
      hypertrade_deal_id?: string;
      supplier_id?: string;
      status_snapshot?: any;
    }) => {
      if (!tenantId) throw new Error("No tenant");
      const { data, error } = await supabase
        .from("trade_references")
        .insert({ tenant_id: tenantId, ...input })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-references"] });
      toast.success("Referência trade vinculada");
    },
    onError: () => toast.error("Erro ao vincular trade"),
  });

  const updateRef = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TradeReference> & { id: string }) => {
      const { data, error } = await supabase
        .from("trade_references")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-references"] });
      toast.success("Referência atualizada");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteRef = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trade_references").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-references"] });
      toast.success("Referência removida");
    },
  });

  return { refs: refsQuery.data || [], isLoading: refsQuery.isLoading, createRef, updateRef, deleteRef };
}

export function useTradeRequests(retailActionId?: string) {
  const { tenant, user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = tenant?.id;

  const requestsQuery = useQuery({
    queryKey: ["trade-requests", tenantId, retailActionId],
    queryFn: async () => {
      if (!tenantId) return [];
      let query = supabase.from("trade_requests").select("*").eq("tenant_id", tenantId);
      if (retailActionId) query = query.eq("retail_action_id", retailActionId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data as TradeRequest[];
    },
    enabled: !!tenantId,
  });

  const createRequest = useMutation({
    mutationFn: async (input: {
      retail_action_id?: string;
      title: string;
      period?: string;
      stores?: any;
      mechanics?: string;
      requested_support?: any;
    }) => {
      if (!tenantId) throw new Error("No tenant");
      const { data, error } = await supabase
        .from("trade_requests")
        .insert({
          tenant_id: tenantId,
          created_by: user?.id || null,
          ...input,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-requests"] });
      toast.success("Pedido de trade criado");
    },
    onError: () => toast.error("Erro ao criar pedido"),
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TradeRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from("trade_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-requests"] });
      toast.success("Pedido atualizado");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trade_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-requests"] });
      toast.success("Pedido removido");
    },
  });

  return {
    requests: requestsQuery.data || [],
    isLoading: requestsQuery.isLoading,
    createRequest,
    updateRequest,
    deleteRequest,
  };
}
