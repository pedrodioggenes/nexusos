import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const METRIC_KEYS = [
  { value: 'receita', label: 'Receita' },
  { value: 'margem', label: 'Margem' },
  { value: 'giro', label: 'Giro' },
  { value: 'ruptura', label: 'Ruptura' },
  { value: 'cesta_media', label: 'Cesta Média' },
  { value: 'fluxo', label: 'Fluxo' },
  { value: 'outro', label: 'Outro' },
] as const;

export interface RetailActionMetric {
  id: string;
  tenant_id: string;
  retail_action_id: string;
  store_id: string | null;
  metric_key: string;
  baseline_value: number | null;
  during_value: number | null;
  post_value: number | null;
  source: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMetricInput {
  retail_action_id: string;
  store_id?: string | null;
  metric_key: string;
  baseline_value?: number | null;
  during_value?: number | null;
  post_value?: number | null;
  source?: string;
}

/** Calculates percentage delta between two values */
export function calcDelta(baseline: number | null, compare: number | null): number | null {
  if (baseline == null || compare == null || baseline === 0) return null;
  return ((compare - baseline) / Math.abs(baseline)) * 100;
}

/** Generates insight alerts based on metrics + execution score */
export function generateAlerts(
  metrics: RetailActionMetric[],
  executionScore?: number | null
): { type: 'warning' | 'info'; message: string }[] {
  const alerts: { type: 'warning' | 'info'; message: string }[] = [];
  const networkMetrics = metrics.filter(m => !m.store_id);

  for (const m of networkMetrics) {
    const delta = calcDelta(m.baseline_value, m.during_value);
    if (delta == null) continue;

    if (delta < 0 && executionScore != null && executionScore >= 80) {
      alerts.push({
        type: 'info',
        message: `${METRIC_KEYS.find(k => k.value === m.metric_key)?.label || m.metric_key}: impacto negativo (${delta.toFixed(1)}%) com execução alta (${executionScore}%). Possível problema de mecânica/preço/mix.`,
      });
    }

    if (executionScore != null && executionScore < 50 && Math.abs(delta) < 5) {
      alerts.push({
        type: 'warning',
        message: `${METRIC_KEYS.find(k => k.value === m.metric_key)?.label || m.metric_key}: baixo impacto + baixa execução (${executionScore}%). Falha de execução provável.`,
      });
    }
  }

  return alerts;
}

export function useRetailActionMetrics(actionId: string | undefined) {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = tenant?.id;

  const metricsQuery = useQuery({
    queryKey: ['retail-action-metrics', actionId],
    queryFn: async () => {
      if (!actionId || !tenantId) return [];
      const { data, error } = await supabase
        .from('retail_action_metrics')
        .select('*')
        .eq('retail_action_id', actionId)
        .order('metric_key');
      if (error) throw error;
      return data as RetailActionMetric[];
    },
    enabled: !!actionId && !!tenantId,
  });

  const upsertMetric = useMutation({
    mutationFn: async (input: CreateMetricInput) => {
      if (!tenantId) throw new Error('No tenant');
      const { data, error } = await supabase
        .from('retail_action_metrics')
        .upsert({
          tenant_id: tenantId,
          retail_action_id: input.retail_action_id,
          store_id: input.store_id || null,
          metric_key: input.metric_key,
          baseline_value: input.baseline_value ?? null,
          during_value: input.during_value ?? null,
          post_value: input.post_value ?? null,
          source: input.source || 'manual',
        }, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-action-metrics', actionId] });
      toast.success('Métrica salva');
    },
    onError: () => toast.error('Erro ao salvar métrica'),
  });

  const createMetric = useMutation({
    mutationFn: async (input: CreateMetricInput) => {
      if (!tenantId) throw new Error('No tenant');
      const { data, error } = await supabase
        .from('retail_action_metrics')
        .insert({
          tenant_id: tenantId,
          retail_action_id: input.retail_action_id,
          store_id: input.store_id || null,
          metric_key: input.metric_key,
          baseline_value: input.baseline_value ?? null,
          during_value: input.during_value ?? null,
          post_value: input.post_value ?? null,
          source: input.source || 'manual',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-action-metrics', actionId] });
      toast.success('Métrica adicionada');
    },
    onError: () => toast.error('Erro ao adicionar métrica'),
  });

  const updateMetric = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RetailActionMetric> & { id: string }) => {
      const { data, error } = await supabase
        .from('retail_action_metrics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-action-metrics', actionId] });
      toast.success('Métrica atualizada');
    },
    onError: () => toast.error('Erro ao atualizar'),
  });

  const deleteMetric = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('retail_action_metrics').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-action-metrics', actionId] });
      toast.success('Métrica removida');
    },
    onError: () => toast.error('Erro ao remover'),
  });

  return {
    ...metricsQuery,
    metrics: metricsQuery.data || [],
    createMetric,
    updateMetric,
    deleteMetric,
    upsertMetric,
  };
}
