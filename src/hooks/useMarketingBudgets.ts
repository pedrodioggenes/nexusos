import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketingBudgetCategory {
  id: string;
  budget_id: string;
  name: string;
  allocated_amount: number;
  spent_amount: number;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketingBudget {
  id: string;
  tenant_id: string | null;
  year: number;
  total_budget: number;
  created_at: string;
  updated_at: string;
  marketing_budget_categories?: MarketingBudgetCategory[];
}

export function useMarketingBudgets(year?: number) {
  const targetYear = year || new Date().getFullYear();
  
  return useQuery({
    queryKey: ['marketing-budgets', targetYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_budgets')
        .select(`
          *,
          marketing_budget_categories (*)
        `)
        .eq('year', targetYear)
        .maybeSingle();
      
      if (error) throw error;
      return data as MarketingBudget | null;
    }
  });
}

export function useMarketingBudgetCategories(budgetId?: string) {
  return useQuery({
    queryKey: ['marketing-budget-categories', budgetId],
    queryFn: async () => {
      if (!budgetId) return [];
      
      const { data, error } = await supabase
        .from('marketing_budget_categories')
        .select('*')
        .eq('budget_id', budgetId)
        .order('allocated_amount', { ascending: false });
      
      if (error) throw error;
      return data as MarketingBudgetCategory[];
    },
    enabled: !!budgetId
  });
}

export function useCreateMarketingBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { year: number; total_budget: number; tenant_id?: string }) => {
      const { data: budget, error } = await supabase
        .from('marketing_budgets')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-budgets'] });
    }
  });
}

export function useCreateBudgetCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      budget_id: string; 
      name: string; 
      allocated_amount: number;
      spent_amount?: number;
      color?: string;
    }) => {
      const { data: category, error } = await supabase
        .from('marketing_budget_categories')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-budget-categories'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-budgets'] });
    }
  });
}

export function useUpdateBudgetCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { 
      id: string; 
      name?: string; 
      allocated_amount?: number;
      spent_amount?: number;
      color?: string;
    }) => {
      const { data: category, error } = await supabase
        .from('marketing_budget_categories')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-budget-categories'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-budgets'] });
    }
  });
}

export function useDeleteBudgetCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketing_budget_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-budget-categories'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-budgets'] });
    }
  });
}

export function useUpdateMarketingBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { 
      id: string; 
      total_budget?: number;
    }) => {
      const { data: budget, error } = await supabase
        .from('marketing_budgets')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return budget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-budgets'] });
    }
  });
}
