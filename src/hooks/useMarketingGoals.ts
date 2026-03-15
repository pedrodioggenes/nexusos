import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MarketingGoal {
  id: string;
  tenant_id: string | null;
  name: string;
  kpi_type: 'roi' | 'cac' | 'ltv' | 'conversion_rate' | 'nps' | 'revenue' | 'leads' | 'impressions' | 'clicks';
  period_type: 'monthly' | 'quarterly' | 'yearly';
  target_value: number;
  current_value: number;
  baseline_value: number | null;
  period_start: string;
  period_end: string;
  status: 'active' | 'achieved' | 'missed' | 'cancelled';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const kpiTypeLabels: Record<string, string> = {
  roi: 'ROI',
  cac: 'CAC',
  ltv: 'LTV',
  conversion_rate: 'Taxa de Conversão',
  nps: 'NPS',
  revenue: 'Receita',
  leads: 'Leads',
  impressions: 'Impressões',
  clicks: 'Cliques',
};

export function useMarketingGoals(periodType?: string) {
  return useQuery({
    queryKey: ['marketing-goals', periodType],
    queryFn: async () => {
      let query = supabase
        .from('marketing_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (periodType) {
        query = query.eq('period_type', periodType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketingGoal[];
    },
  });
}

export function useActiveGoals() {
  return useQuery({
    queryKey: ['marketing-goals-active'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('marketing_goals')
        .select('*')
        .eq('status', 'active')
        .lte('period_start', today)
        .gte('period_end', today)
        .order('kpi_type');

      if (error) throw error;
      return data as MarketingGoal[];
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (goal: Omit<MarketingGoal, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
      const { data, error } = await supabase
        .from('marketing_goals')
        .insert({ ...goal, status: 'active' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-goals'] });
      toast({
        title: "Meta criada",
        description: "A meta foi criada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a meta",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MarketingGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from('marketing_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-goals'] });
      toast({
        title: "Meta atualizada",
        description: "A meta foi atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a meta",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('marketing_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-goals'] });
      toast({
        title: "Meta excluída",
        description: "A meta foi excluída com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a meta",
        variant: "destructive",
      });
    },
  });
}
