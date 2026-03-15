import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketingKPIByChannel {
  id: string;
  kpi_id: string;
  channel: string;
  investment: number | null;
  revenue: number | null;
  roi: number | null;
  leads: number | null;
  conversions: number | null;
  conversion_rate: number | null;
  cac: number | null;
  created_at: string;
}

export interface MarketingKPI {
  id: string;
  tenant_id: string | null;
  period_type: string;
  period_start: string;
  period_end: string;
  roi: number | null;
  cac: number | null;
  ltv: number | null;
  conversion_rate: number | null;
  nps: number | null;
  average_ticket: number | null;
  impressions: number | null;
  clicks: number | null;
  visits: number | null;
  leads: number | null;
  conversions: number | null;
  revenue: number | null;
  created_at: string;
  updated_at: string;
  marketing_kpis_by_channel?: MarketingKPIByChannel[];
}

export function useMarketingKPIs(periodType?: string, periodStart?: Date) {
  return useQuery({
    queryKey: ['marketing-kpis', periodType, periodStart?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from('marketing_kpis')
        .select(`
          *,
          marketing_kpis_by_channel (*)
        `)
        .order('period_start', { ascending: false });
      
      if (periodType) {
        query = query.eq('period_type', periodType);
      }
      
      if (periodStart) {
        query = query.eq('period_start', periodStart.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query.limit(12);
      
      if (error) throw error;
      return data as MarketingKPI[];
    }
  });
}

export function useLatestMarketingKPI(periodType: string = 'monthly') {
  return useQuery({
    queryKey: ['marketing-kpi-latest', periodType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_kpis')
        .select(`
          *,
          marketing_kpis_by_channel (*)
        `)
        .eq('period_type', periodType)
        .order('period_start', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as MarketingKPI | null;
    }
  });
}

export function useCreateMarketingKPI() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      period_type: string;
      period_start: string;
      period_end: string;
      tenant_id?: string;
      roi?: number;
      cac?: number;
      ltv?: number;
      conversion_rate?: number;
      nps?: number;
      average_ticket?: number;
      impressions?: number;
      clicks?: number;
      visits?: number;
      leads?: number;
      conversions?: number;
      revenue?: number;
    }) => {
      const { data: kpi, error } = await supabase
        .from('marketing_kpis')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return kpi;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-kpi-latest'] });
    }
  });
}

export function useUpdateMarketingKPI() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<MarketingKPI>) => {
      const { data: kpi, error } = await supabase
        .from('marketing_kpis')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return kpi;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-kpi-latest'] });
    }
  });
}

export function useCreateKPIByChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      kpi_id: string;
      channel: string;
      investment?: number;
      revenue?: number;
      roi?: number;
      leads?: number;
      conversions?: number;
      conversion_rate?: number;
      cac?: number;
    }) => {
      const { data: kpiChannel, error } = await supabase
        .from('marketing_kpis_by_channel')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return kpiChannel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-kpis'] });
    }
  });
}
