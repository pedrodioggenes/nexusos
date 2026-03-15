import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FinancialTransaction {
  id: string;
  tenant_id: string;
  type: 'receita' | 'custo';
  category: string;
  subcategory: string | null;
  amount: number;
  description: string;
  date: string;
  payment_method: string | null;
  status: 'confirmado' | 'pendente' | 'cancelado';
  reference_type: string | null;
  reference_id: string | null;
  tags: string[];
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: 'receita' | 'custo' | 'all';
  category?: string;
  status?: string;
  search?: string;
}

export interface FinancialSummary {
  totalReceita: number;
  totalCusto: number;
  saldo: number;
  byCategory: { category: string; amount: number; type: string }[];
  bySubcategory: { category: string; subcategory: string; amount: number }[];
  byMonth: { month: string; receita: number; custo: number }[];
  byCategoryMonth: { month: string; category: string; amount: number }[];
  receitaTrend: number;
  custoTrend: number;
}

export function useFinancialTransactions(filters: FinancialFilters = {}) {
  return useQuery({
    queryKey: ['financial-transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false });

      if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
      if (filters.dateTo) query = query.lte('date', filters.dateTo);
      if (filters.type && filters.type !== 'all') query = query.eq('type', filters.type);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.search) query = query.ilike('description', `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as FinancialTransaction[];
    },
  });
}

export function useFinancialSummary(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['financial-summary', dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('financial_transactions')
        .select('*')
        .neq('status', 'cancelado');

      if (dateFrom) query = query.gte('date', dateFrom);
      if (dateTo) query = query.lte('date', dateTo);

      const { data, error } = await query;
      if (error) throw error;

      const transactions = (data || []) as FinancialTransaction[];

      const totalReceita = transactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalCusto = transactions
        .filter(t => t.type === 'custo')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      // By category
      const categoryMap = new Map<string, { amount: number; type: string }>();
      transactions.forEach(t => {
        const key = `${t.category}-${t.type}`;
        const existing = categoryMap.get(key);
        if (existing) {
          existing.amount += Number(t.amount);
        } else {
          categoryMap.set(key, { amount: Number(t.amount), type: t.type });
        }
      });
      const byCategory = Array.from(categoryMap.entries()).map(([key, val]) => ({
        category: key.split('-')[0],
        ...val,
      }));

      // By subcategory (costs only)
      const subMap = new Map<string, number>();
      transactions.filter(t => t.type === 'custo').forEach(t => {
        const sub = t.subcategory || 'Sem subcategoria';
        const key = `${t.category}|||${sub}`;
        subMap.set(key, (subMap.get(key) || 0) + Number(t.amount));
      });
      const bySubcategory = Array.from(subMap.entries()).map(([key, amount]) => {
        const [category, subcategory] = key.split('|||');
        return { category, subcategory, amount };
      });

      // By month
      const monthMap = new Map<string, { receita: number; custo: number }>();
      transactions.forEach(t => {
        const month = t.date.substring(0, 7); // YYYY-MM
        const existing = monthMap.get(month) || { receita: 0, custo: 0 };
        if (t.type === 'receita') existing.receita += Number(t.amount);
        else existing.custo += Number(t.amount);
        monthMap.set(month, existing);
      });
      const byMonth = Array.from(monthMap.entries())
        .map(([month, val]) => ({ month, ...val }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // By category + month (costs only, for evolution chart)
      const catMonthMap = new Map<string, number>();
      transactions.filter(t => t.type === 'custo').forEach(t => {
        const month = t.date.substring(0, 7);
        const key = `${month}|||${t.category}`;
        catMonthMap.set(key, (catMonthMap.get(key) || 0) + Number(t.amount));
      });
      const byCategoryMonth = Array.from(catMonthMap.entries())
        .map(([key, amount]) => {
          const [month, category] = key.split('|||');
          return { month, category, amount };
        })
        .sort((a, b) => a.month.localeCompare(b.month));

      // Simple trend calculation (current month vs previous)
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      
      const currentData = monthMap.get(currentMonth) || { receita: 0, custo: 0 };
      const prevData = monthMap.get(prevMonth) || { receita: 0, custo: 0 };

      const receitaTrend = prevData.receita > 0 
        ? Math.round(((currentData.receita - prevData.receita) / prevData.receita) * 100) 
        : 0;
      const custoTrend = prevData.custo > 0 
        ? Math.round(((currentData.custo - prevData.custo) / prevData.custo) * 100) 
        : 0;

      return {
        totalReceita,
        totalCusto,
        saldo: totalReceita - totalCusto,
        byCategory,
        bySubcategory,
        byMonth,
        byCategoryMonth,
        receitaTrend,
        custoTrend,
      } as FinancialSummary;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<FinancialTransaction, 'id' | 'tenant_id' | 'created_by' | 'created_at' | 'updated_at'>) => {
      if (!tenant?.id || !user?.id) {
        throw new Error('Usuário ou tenant não disponível. Faça login novamente.');
      }
      const { data: result, error } = await supabase
        .from('financial_transactions')
        .insert({
          ...data,
          tenant_id: tenant.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Transação registrada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao registrar transação');
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FinancialTransaction> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('financial_transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Transação atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar transação');
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      toast.success('Transação excluída!');
    },
    onError: () => {
      toast.error('Erro ao excluir transação');
    },
  });
}
