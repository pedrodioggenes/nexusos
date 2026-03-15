import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BudgetAllocation {
  id: string;
  tenant_id: string | null;
  period_start: string;
  period_end: string;
  category_id: string | null;
  campaign_id: string | null;
  planned_amount: number;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  // Joined
  category_name?: string;
  campaign_name?: string;
}

export interface BudgetVarianceRow {
  label: string;
  type: 'category' | 'campaign';
  entity_id: string;
  planned: number;
  realized: number;
  variance: number;
  variance_pct: number;
}

export function useBudgetAllocations(periodStart?: string, periodEnd?: string) {
  return useQuery({
    queryKey: ['budget-allocations', periodStart, periodEnd],
    queryFn: async () => {
      let query = supabase
        .from('marketing_budget_allocations')
        .select('*')
        .order('period_start', { ascending: false });

      if (periodStart) query = query.gte('period_start', periodStart);
      if (periodEnd) query = query.lte('period_end', periodEnd);

      const { data, error } = await query;
      if (error) throw error;
      return data as BudgetAllocation[];
    },
  });
}

export function useCreateBudgetAllocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (allocation: {
      tenant_id?: string | null;
      period_start: string;
      period_end: string;
      category_id?: string | null;
      campaign_id?: string | null;
      planned_amount: number;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('marketing_budget_allocations')
        .insert([allocation])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['budget-variance'] });
      toast({ title: 'Alocação criada' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar alocação', variant: 'destructive' });
    },
  });
}

export function useDeleteBudgetAllocation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketing_budget_allocations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['budget-variance'] });
      toast({ title: 'Alocação removida' });
    },
  });
}

/**
 * Budget variance analysis: planned (allocations) vs realized (transactions)
 * Grouped by category or campaign.
 */
export function useBudgetVariance(periodStart?: string, periodEnd?: string) {
  return useQuery({
    queryKey: ['budget-variance', periodStart, periodEnd],
    queryFn: async () => {
      // Fetch allocations in period
      let allocQuery = supabase
        .from('marketing_budget_allocations')
        .select('*');
      if (periodStart) allocQuery = allocQuery.gte('period_start', periodStart);
      if (periodEnd) allocQuery = allocQuery.lte('period_end', periodEnd);

      const { data: allocations = [] } = await allocQuery;

      // Fetch budget categories for labels
      const { data: categories = [] } = await supabase
        .from('marketing_budget_categories')
        .select('id, name');

      // Fetch campaigns for labels
      const campaignIds = [...new Set((allocations || []).filter(a => a.campaign_id).map(a => a.campaign_id))];
      let campaigns: Array<{ id: string; name: string; planned_budget: number | null; spent_amount: number | null }> = [];
      if (campaignIds.length > 0) {
        const { data } = await supabase
          .from('marketing_campaigns')
          .select('id, name, planned_budget, spent_amount')
          .in('id', campaignIds as string[]);
        campaigns = (data || []) as typeof campaigns;
      }

      // Fetch transactions in period
      let txQuery: any = supabase
        .from('financial_transactions')
        .select('category, amount, type, reference_type, reference_id');
      if (periodStart) txQuery = txQuery.gte('date', periodStart);
      if (periodEnd) txQuery = txQuery.lte('date', periodEnd);

      const { data: transactions = [] } = await txQuery;

      // Build variance by category
      const categoryMap = new Map<string, { planned: number; realized: number; name: string }>();
      
      for (const alloc of (allocations || [])) {
        if (alloc.category_id && !alloc.campaign_id) {
          const existing = categoryMap.get(alloc.category_id) || { planned: 0, realized: 0, name: '' };
          existing.planned += Number(alloc.planned_amount) || 0;
          const cat = (categories || []).find(c => c.id === alloc.category_id);
          if (cat) existing.name = cat.name;
          categoryMap.set(alloc.category_id, existing);
        }
      }

      // Aggregate transactions by category
      for (const tx of (transactions || [])) {
        const amount = Number(tx.amount) || 0;
        const txCategory = tx.category as string;
        // Match by category name
        const matchedCat = (categories || []).find(c => c.name === txCategory);
        if (matchedCat && categoryMap.has(matchedCat.id)) {
          const entry = categoryMap.get(matchedCat.id)!;
          if (tx.type === 'custo') {
            entry.realized += amount;
          }
        }
      }

      const byCategory: BudgetVarianceRow[] = Array.from(categoryMap.entries()).map(([id, data]) => ({
        label: data.name || 'Sem nome',
        type: 'category' as const,
        entity_id: id,
        planned: data.planned,
        realized: data.realized,
        variance: data.planned - data.realized,
        variance_pct: data.planned > 0 ? ((data.planned - data.realized) / data.planned) * 100 : 0,
      }));

      // Build variance by campaign
      const byCampaign: BudgetVarianceRow[] = campaigns.map(c => {
        const campaignAllocs = (allocations || []).filter(a => a.campaign_id === c.id);
        const planned = campaignAllocs.reduce((sum, a) => sum + (Number(a.planned_amount) || 0), 0) || (Number(c.planned_budget) || 0);
        const realized = Number(c.spent_amount) || 0;
        return {
          label: c.name,
          type: 'campaign' as const,
          entity_id: c.id,
          planned,
          realized,
          variance: planned - realized,
          variance_pct: planned > 0 ? ((planned - realized) / planned) * 100 : 0,
        };
      });

      // Totals
      const totalPlanned = byCategory.reduce((s, r) => s + r.planned, 0) + byCampaign.reduce((s, r) => s + r.planned, 0);
      const totalRealized = byCategory.reduce((s, r) => s + r.realized, 0) + byCampaign.reduce((s, r) => s + r.realized, 0);

      return {
        byCategory,
        byCampaign,
        totalPlanned,
        totalRealized,
        totalVariance: totalPlanned - totalRealized,
        totalVariancePct: totalPlanned > 0 ? ((totalPlanned - totalRealized) / totalPlanned) * 100 : 0,
      };
    },
  });
}
