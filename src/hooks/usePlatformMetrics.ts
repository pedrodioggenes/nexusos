import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { subDays, format } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

export interface PlatformMetric {
  id: string;
  tenant_id: string | null;
  platform: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
  source: 'manual' | 'api' | 'import';
  metadata: Json;
  created_at: string;
}

export interface LogMetricInput {
  platform: string;
  metric_type: string;
  metric_value: number;
  metric_date?: string;
  source?: 'manual' | 'api' | 'import';
  metadata?: Json;
}

// Fetch metrics for a platform within a date range
export function usePlatformMetrics(platform: string, days = 30) {
  const { user } = useAuth();
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['platform-metrics', platform, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_platform_metrics')
        .select('*')
        .eq('platform', platform)
        .gte('metric_date', startDate)
        .lte('metric_date', endDate)
        .order('metric_date', { ascending: true });

      if (error) throw error;
      return data as PlatformMetric[];
    },
    enabled: !!user && !!platform,
  });
}

// Fetch all metrics for all platforms (aggregated)
export function useAllPlatformMetrics(days = 30) {
  const { user } = useAuth();
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['platform-metrics', 'all', days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_platform_metrics')
        .select('*')
        .gte('metric_date', startDate)
        .lte('metric_date', endDate)
        .order('metric_date', { ascending: true });

      if (error) throw error;
      return data as PlatformMetric[];
    },
    enabled: !!user,
  });
}

// Get latest metric value for a specific type
export function useLatestMetric(platform: string, metricType: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['platform-metrics', 'latest', platform, metricType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_platform_metrics')
        .select('*')
        .eq('platform', platform)
        .eq('metric_type', metricType)
        .order('metric_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PlatformMetric | null;
    },
    enabled: !!user && !!platform && !!metricType,
  });
}

// Log a new metric (upsert)
export function useLogMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LogMetricInput) => {
      const metricDate = input.metric_date || format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('team_platform_metrics')
        .upsert(
          {
            platform: input.platform,
            metric_type: input.metric_type,
            metric_value: input.metric_value,
            metric_date: metricDate,
            source: input.source,
            metadata: input.metadata,
          },
          { onConflict: 'tenant_id,platform,metric_type,metric_date' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform-metrics'] });
      toast.success(`Métrica ${variables.metric_type} registrada!`);
    },
    onError: (error) => {
      toast.error('Erro ao registrar métrica: ' + error.message);
    },
  });
}

// Bulk log metrics
export function useBulkLogMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputs: LogMetricInput[]) => {
      const metricsWithDates = inputs.map(input => ({
        platform: input.platform,
        metric_type: input.metric_type,
        metric_value: input.metric_value,
        metric_date: input.metric_date || format(new Date(), 'yyyy-MM-dd'),
        source: input.source,
        metadata: input.metadata,
      }));

      const { data, error } = await supabase
        .from('team_platform_metrics')
        .upsert(metricsWithDates, { onConflict: 'tenant_id,platform,metric_type,metric_date' })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-metrics'] });
      toast.success('Métricas atualizadas!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar métricas: ' + error.message);
    },
  });
}

// Helper to aggregate metrics by platform
export function aggregateMetricsByPlatform(metrics: PlatformMetric[]) {
  const byPlatform: Record<string, Record<string, number>> = {};

  metrics.forEach(metric => {
    if (!byPlatform[metric.platform]) {
      byPlatform[metric.platform] = {};
    }
    // Get latest value for each metric type
    byPlatform[metric.platform][metric.metric_type] = metric.metric_value;
  });

  return byPlatform;
}

// Helper to calculate growth between periods
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
