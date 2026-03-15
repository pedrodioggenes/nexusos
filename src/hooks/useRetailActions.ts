import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const RETAIL_ACTION_TYPES = [
  { value: 'encarte', label: 'Encarte' },
  { value: 'degustacao', label: 'Degustação' },
  { value: 'sazonal', label: 'Sazonal' },
  { value: 'ofertas', label: 'Ofertas' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'trade', label: 'Trade' },
  { value: 'evento_loja', label: 'Evento de Loja' },
  { value: 'outro', label: 'Outro' },
] as const;

export const RETAIL_ACTION_STATUSES = [
  { value: 'draft', label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  { value: 'planned', label: 'Planejada', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'in_production', label: 'Em Produção', color: 'bg-amber-500/10 text-amber-500' },
  { value: 'ready', label: 'Pronta', color: 'bg-emerald-500/10 text-emerald-500' },
  { value: 'running', label: 'Em Execução', color: 'bg-violet-500/10 text-violet-500' },
  { value: 'completed', label: 'Concluída', color: 'bg-green-600/10 text-green-600' },
  { value: 'cancelled', label: 'Cancelada', color: 'bg-destructive/10 text-destructive' },
] as const;

export const CHANNEL_OPTIONS = [
  'whatsapp', 'encarte', 'loja', 'tv_interna', 'instagram', 'facebook', 'tiktok', 'google_ads', 'email', 'outdoor',
] as const;

export interface RetailAction {
  id: string;
  tenant_id: string;
  title: string;
  type: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  stores_scope: any;
  categories_scope: any;
  products_scope: any;
  mechanics: string | null;
  channels: any;
  owner_user_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RetailActionLink {
  id: string;
  tenant_id: string;
  retail_action_id: string;
  linked_type: string;
  linked_id: string;
  created_at: string;
}

export interface CreateRetailActionInput {
  title: string;
  type: string;
  status?: string;
  period_start?: string | null;
  period_end?: string | null;
  stores_scope?: any;
  categories_scope?: any;
  products_scope?: any;
  mechanics?: string;
  channels?: string[];
  notes?: string;
}

export function useRetailActions() {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = tenant?.id;

  const actionsQuery = useQuery({
    queryKey: ['retail-actions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('retail_actions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RetailAction[];
    },
    enabled: !!tenantId,
  });

  const createAction = useMutation({
    mutationFn: async (input: CreateRetailActionInput) => {
      if (!tenantId) throw new Error('No tenant');
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('retail_actions')
        .insert({
          tenant_id: tenantId,
          title: input.title,
          type: input.type,
          status: input.status || 'draft',
          period_start: input.period_start || null,
          period_end: input.period_end || null,
          stores_scope: input.stores_scope || [],
          categories_scope: input.categories_scope || [],
          products_scope: input.products_scope || [],
          mechanics: input.mechanics || null,
          channels: input.channels || [],
          notes: input.notes || null,
          owner_user_id: userData?.user?.id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-actions'] });
      toast.success('Ação comercial criada');
    },
    onError: () => toast.error('Erro ao criar ação comercial'),
  });

  const updateAction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RetailAction> & { id: string }) => {
      const { data, error } = await supabase
        .from('retail_actions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-actions'] });
      toast.success('Ação comercial atualizada');
    },
    onError: () => toast.error('Erro ao atualizar'),
  });

  const deleteAction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('retail_actions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-actions'] });
      toast.success('Ação comercial removida');
    },
    onError: () => toast.error('Erro ao remover'),
  });

  return { ...actionsQuery, actions: actionsQuery.data || [], createAction, updateAction, deleteAction };
}

export function useRetailActionLinks(actionId: string | null) {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = tenant?.id;

  const linksQuery = useQuery({
    queryKey: ['retail-action-links', actionId],
    queryFn: async () => {
      if (!actionId || !tenantId) return [];
      const { data, error } = await supabase
        .from('retail_action_links')
        .select('*')
        .eq('retail_action_id', actionId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RetailActionLink[];
    },
    enabled: !!actionId && !!tenantId,
  });

  const addLink = useMutation({
    mutationFn: async ({ linkedType, linkedId }: { linkedType: string; linkedId: string }) => {
      if (!tenantId || !actionId) throw new Error('Missing context');
      const { data, error } = await supabase
        .from('retail_action_links')
        .insert({
          tenant_id: tenantId,
          retail_action_id: actionId,
          linked_type: linkedType,
          linked_id: linkedId,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-action-links', actionId] });
      toast.success('Vínculo adicionado');
    },
    onError: () => toast.error('Erro ao vincular'),
  });

  const removeLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from('retail_action_links').delete().eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-action-links', actionId] });
      toast.success('Vínculo removido');
    },
    onError: () => toast.error('Erro ao remover vínculo'),
  });

  return { ...linksQuery, links: linksQuery.data || [], addLink, removeLink };
}
