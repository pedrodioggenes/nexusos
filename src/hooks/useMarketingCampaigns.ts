import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface MarketingCampaign {
  id: string;
  tenant_id: string | null;
  name: string;
  description: string | null;
  type: 'seasonal' | 'promotional' | 'institutional' | 'trade' | 'digital' | 'event';
  status: 'draft' | 'pending_approval' | 'approved' | 'in_production' | 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string | null;
  end_date: string | null;
  approval_deadline: string | null;
  planned_budget: number;
  approved_budget: number;
  spent_amount: number;
  supplier_id: string | null;
  coop_fund_id: string | null;
  expected_reach: number | null;
  actual_reach: number | null;
  expected_conversions: number | null;
  actual_conversions: number | null;
  expected_roi: number | null;
  actual_roi: number | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  briefing: string | null;
  learnings: string | null;
  assets: string[];
  created_at: string;
  updated_at: string;
  // Joined fields
  supplier?: {
    id: string;
    name: string;
  };
}

export const campaignTypeLabels: Record<string, string> = {
  seasonal: 'Sazonal',
  promotional: 'Promocional',
  institutional: 'Institucional',
  trade: 'Trade Marketing',
  digital: 'Digital',
  event: 'Evento',
};

export const campaignStatusLabels: Record<string, string> = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovada',
  in_production: 'Em Produção',
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

export const campaignPriorityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

export function useMarketingCampaigns(status?: string) {
  return useQuery({
    queryKey: ['marketing-campaigns', status],
    queryFn: async () => {
      let query = supabase
        .from('marketing_campaigns')
        .select(`
          *,
          supplier:suppliers(id, name)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketingCampaign[];
    },
  });
}

export function useMarketingCampaignById(id: string | undefined) {
  return useQuery({
    queryKey: ['marketing-campaign', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select(`
          *,
          supplier:suppliers(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as MarketingCampaign;
    },
    enabled: !!id,
  });
}

export function useActiveCampaigns() {
  return useQuery({
    queryKey: ['marketing-campaigns-active'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select(`
          *,
          supplier:suppliers(id, name)
        `)
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('start_date');

      if (error) throw error;
      return data as MarketingCampaign[];
    },
  });
}

export function useUpcomingCampaigns(limit: number = 5) {
  return useQuery({
    queryKey: ['marketing-campaigns-upcoming', limit],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select(`
          *,
          supplier:suppliers(id, name)
        `)
        .in('status', ['approved', 'in_production'])
        .gte('start_date', today)
        .order('start_date')
        .limit(limit);

      if (error) throw error;
      return data as MarketingCampaign[];
    },
  });
}

export function useCampaignStats() {
  return useQuery({
    queryKey: ['marketing-campaigns-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('status, planned_budget, spent_amount');

      if (error) throw error;

      const stats = {
        total: data.length,
        draft: data.filter(c => c.status === 'draft').length,
        pending: data.filter(c => c.status === 'pending_approval').length,
        active: data.filter(c => c.status === 'active').length,
        completed: data.filter(c => c.status === 'completed').length,
        totalBudget: data.reduce((sum, c) => sum + (c.planned_budget || 0), 0),
        totalSpent: data.reduce((sum, c) => sum + (c.spent_amount || 0), 0),
      };

      return stats;
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async (campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at' | 'supplier'>) => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .insert({
          ...campaign,
          tenant_id: campaign.tenant_id || tenant?.id || null,
          created_by: campaign.created_by || user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast({
        title: "Campanha criada",
        description: "A campanha foi criada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a campanha",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketingCampaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast({
        title: "Campanha atualizada",
        description: "A campanha foi atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a campanha",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('marketing_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast({
        title: "Campanha excluída",
        description: "A campanha foi excluída com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a campanha",
        variant: "destructive",
      });
    },
  });
}

export function useApproveCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ campaignId, approvedBudget }: { campaignId: string; approvedBudget: number }) => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .update({
          status: 'approved',
          approved_budget: approvedBudget,
          approved_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast({
        title: "Campanha aprovada",
        description: "A campanha foi aprovada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a campanha",
        variant: "destructive",
      });
    },
  });
}

export function useRejectCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ campaignId, reason }: { campaignId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .update({
          status: 'cancelled',
          rejection_reason: reason,
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      toast({
        title: "Campanha rejeitada",
        description: "A campanha foi rejeitada",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a campanha",
        variant: "destructive",
      });
    },
  });
}
