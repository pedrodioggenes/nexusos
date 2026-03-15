import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AgencyBriefing {
  id: string;
  tenant_id: string | null;
  agency_id: string | null;
  title: string;
  type: 'campaign' | 'social' | 'trade' | 'encarte' | 'video' | 'design' | 'other';
  objective: string | null;
  target_audience: string | null;
  deadline: string | null;
  budget: number | null;
  assets: Array<{ name: string; url: string }>;
  references_urls: string[];
  status: 'draft' | 'sent' | 'received' | 'in_production' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export type BriefingStatus = AgencyBriefing['status'];
export type BriefingType = AgencyBriefing['type'];
export type BriefingPriority = AgencyBriefing['priority'];

export const BRIEFING_TYPE_LABELS: Record<BriefingType, string> = {
  campaign: 'Campanha',
  social: 'Social Media',
  trade: 'Trade Marketing',
  encarte: 'Encarte',
  video: 'Vídeo',
  design: 'Design',
  other: 'Outros',
};

export const BRIEFING_STATUS_LABELS: Record<BriefingStatus, string> = {
  draft: 'Rascunho',
  sent: 'Enviado',
  received: 'Recebido',
  in_production: 'Em Produção',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export const BRIEFING_PRIORITY_LABELS: Record<BriefingPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export function useAgencyBriefings(agencyId?: string) {
  const { tenant, user } = useAuth();
  const tenantId = tenant?.id;
  const queryClient = useQueryClient();

  // Fetch all briefings
  const { data: briefings = [], isLoading, error } = useQuery({
    queryKey: ['agency-briefings', tenantId, agencyId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from('agency_briefings')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (agencyId) {
        query = query.eq('agency_id', agencyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(b => ({
        ...b,
        assets: Array.isArray(b.assets) ? b.assets : [],
        references_urls: Array.isArray(b.references_urls) ? b.references_urls : []
      })) as AgencyBriefing[];
    },
    enabled: !!tenantId,
  });

  // Briefings by status
  const draftBriefings = briefings.filter(b => b.status === 'draft');
  const sentBriefings = briefings.filter(b => b.status === 'sent');
  const inProductionBriefings = briefings.filter(b => b.status === 'in_production');
  const deliveredBriefings = briefings.filter(b => b.status === 'delivered');

  // Stats
  const stats = {
    total: briefings.length,
    draft: draftBriefings.length,
    sent: sentBriefings.length,
    inProduction: inProductionBriefings.length,
    delivered: deliveredBriefings.length,
  };

  // Create briefing
  const createBriefing = useMutation({
    mutationFn: async (briefingData: Omit<Partial<AgencyBriefing>, 'tenant_id' | 'created_by'>) => {
      if (!tenantId || !briefingData.title || !briefingData.type) {
        throw new Error('Missing required fields');
      }
      const { data, error } = await supabase
        .from('agency_briefings')
        .insert({
          title: briefingData.title,
          type: briefingData.type,
          tenant_id: tenantId,
          agency_id: briefingData.agency_id,
          objective: briefingData.objective,
          target_audience: briefingData.target_audience,
          deadline: briefingData.deadline,
          budget: briefingData.budget,
          assets: briefingData.assets || [],
          references_urls: briefingData.references_urls || [],
          status: briefingData.status || 'draft',
          priority: briefingData.priority || 'medium',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-briefings'] });
      toast.success('Briefing criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar briefing: ' + error.message);
    },
  });

  // Update briefing
  const updateBriefing = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgencyBriefing> & { id: string }) => {
      const { data, error } = await supabase
        .from('agency_briefings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-briefings'] });
      toast.success('Briefing atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar briefing: ' + error.message);
    },
  });

  // Send briefing to agency
  const sendBriefing = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('agency_briefings')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-briefings'] });
      toast.success('Briefing enviado para a agência!');
    },
    onError: (error) => {
      toast.error('Erro ao enviar briefing: ' + error.message);
    },
  });

  // Delete briefing
  const deleteBriefing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agency_briefings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency-briefings'] });
      toast.success('Briefing excluído!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir briefing: ' + error.message);
    },
  });

  return {
    briefings,
    isLoading,
    error,
    stats,
    draftBriefings,
    sentBriefings,
    inProductionBriefings,
    deliveredBriefings,
    createBriefing,
    updateBriefing,
    sendBriefing,
    deleteBriefing,
  };
}
