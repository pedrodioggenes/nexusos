import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StorePerformance {
  id: string;
  tenant_id: string | null;
  unit_id: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  investment: number;
  revenue: number;
  roi: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_rate: number;
  foot_traffic: number;
  average_ticket: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  unit?: {
    id: string;
    name: string;
    city: string;
  };
}

export function useStorePerformance(periodType: string = 'monthly', periodStart?: string) {
  return useQuery({
    queryKey: ['store-performance', periodType, periodStart],
    queryFn: async () => {
      let query = supabase
        .from('marketing_store_performance')
        .select(`
          *,
          unit:units(id, name, city)
        `)
        .eq('period_type', periodType)
        .order('roi', { ascending: false });

      if (periodStart) {
        query = query.eq('period_start', periodStart);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StorePerformance[];
    },
  });
}

export function useStorePerformanceByUnit(unitId: string) {
  return useQuery({
    queryKey: ['store-performance-unit', unitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_store_performance')
        .select('*')
        .eq('unit_id', unitId)
        .order('period_start', { ascending: false })
        .limit(12); // Last 12 periods

      if (error) throw error;
      return data as StorePerformance[];
    },
    enabled: !!unitId,
  });
}

export function useTopPerformingStores(limit: number = 10) {
  return useQuery({
    queryKey: ['store-performance-top', limit],
    queryFn: async () => {
      const currentMonth = new Date();
      const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('marketing_store_performance')
        .select(`
          *,
          unit:units(id, name, city)
        `)
        .eq('period_type', 'monthly')
        .eq('period_start', periodStart)
        .order('roi', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as StorePerformance[];
    },
  });
}

export function useBottomPerformingStores(limit: number = 10) {
  return useQuery({
    queryKey: ['store-performance-bottom', limit],
    queryFn: async () => {
      const currentMonth = new Date();
      const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('marketing_store_performance')
        .select(`
          *,
          unit:units(id, name, city)
        `)
        .eq('period_type', 'monthly')
        .eq('period_start', periodStart)
        .order('roi', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as StorePerformance[];
    },
  });
}

export function useCreateStorePerformance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (performance: Omit<StorePerformance, 'id' | 'created_at' | 'updated_at' | 'roi' | 'conversion_rate' | 'unit'>) => {
      const { data, error } = await supabase
        .from('marketing_store_performance')
        .insert(performance)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-performance'] });
      toast({
        title: "Dados registrados",
        description: "Performance da loja registrada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar os dados",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateStorePerformance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StorePerformance> & { id: string }) => {
      const { data, error } = await supabase
        .from('marketing_store_performance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-performance'] });
      toast({
        title: "Dados atualizados",
        description: "Performance da loja atualizada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados",
        variant: "destructive",
      });
    },
  });
}

// Aggregated stats
export function useStorePerformanceStats() {
  return useQuery({
    queryKey: ['store-performance-stats'],
    queryFn: async () => {
      const currentMonth = new Date();
      const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('marketing_store_performance')
        .select('investment, revenue, roi, conversions')
        .eq('period_type', 'monthly')
        .eq('period_start', periodStart);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalInvestment: 0,
          totalRevenue: 0,
          averageRoi: 0,
          totalConversions: 0,
          storeCount: 0,
        };
      }

      const totalInvestment = data.reduce((sum, s) => sum + (s.investment || 0), 0);
      const totalRevenue = data.reduce((sum, s) => sum + (s.revenue || 0), 0);
      const averageRoi = data.reduce((sum, s) => sum + (s.roi || 0), 0) / data.length;
      const totalConversions = data.reduce((sum, s) => sum + (s.conversions || 0), 0);

      return {
        totalInvestment,
        totalRevenue,
        averageRoi,
        totalConversions,
        storeCount: data.length,
      };
    },
  });
}
