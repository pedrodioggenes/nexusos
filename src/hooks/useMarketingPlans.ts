import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MarketingPlan {
  id: string;
  tenant_id: string | null;
  type: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  current_value: string | null;
  target_value: string | null;
  progress: number | null;
  responsible: string | null;
  color: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingPlanFilters {
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useMarketingPlans(filters?: MarketingPlanFilters) {
  return useQuery({
    queryKey: ['marketing-plans', filters],
    queryFn: async () => {
      let query = supabase
        .from('marketing_plans')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate.toISOString().split('T')[0]);
      }
      
      if (filters?.endDate) {
        query = query.lte('end_date', filters.endDate.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as MarketingPlan[];
    }
  });
}

export function useMarketingPlan(id: string) {
  return useQuery({
    queryKey: ['marketing-plan', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_plans')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as MarketingPlan;
    },
    enabled: !!id
  });
}

export function useCreateMarketingPlan() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      type: string;
      title: string;
      tenant_id?: string;
      description?: string;
      status?: string;
      start_date?: string;
      end_date?: string;
      budget?: number;
      current_value?: string;
      target_value?: string;
      progress?: number;
      responsible?: string;
      color?: string;
      created_by?: string;
    }) => {
      const { data: plan, error } = await supabase
        .from('marketing_plans')
        .insert({
          ...data,
          tenant_id: data.tenant_id || tenant?.id,
          created_by: data.created_by || user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-plans'] });
    }
  });
}

export function useUpdateMarketingPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<MarketingPlan>) => {
      const { data: plan, error } = await supabase
        .from('marketing_plans')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return plan;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-plan', variables.id] });
    }
  });
}

export function useDeleteMarketingPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketing_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-plans'] });
    }
  });
}

export function useDuplicateMarketingPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (plan: MarketingPlan) => {
      const { id, created_at, updated_at, ...planData } = plan;
      const { data, error } = await supabase
        .from('marketing_plans')
        .insert({
          ...planData,
          title: `${planData.title} (cópia)`,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-plans'] });
    }
  });
}

// Helper to get plans for a specific month (for calendar view)
export function useMarketingPlansForMonth(year: number, month: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return useMarketingPlans({
    startDate,
    endDate
  });
}
