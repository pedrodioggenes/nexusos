import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExperimentVariant {
  name: string;
  description: string;
}

export interface ExperimentResults {
  variant_a?: Record<string, number>;
  variant_b?: Record<string, number>;
  winner?: string;
  confidence?: string;
  notes?: string;
}

export interface Experiment {
  id: string;
  tenant_id: string;
  title: string;
  hypothesis: string | null;
  metric_key: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'planned' | 'running' | 'completed' | 'archived';
  linked_campaign_id: string | null;
  variants: ExperimentVariant[];
  results: ExperimentResults;
  decision: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  campaign?: { id: string; name: string } | null;
}

export function useExperiments(status?: string) {
  return useQuery({
    queryKey: ['experiments', status],
    queryFn: async () => {
      let query = supabase
        .from('experiments')
        .select('*, campaign:marketing_campaigns(id, name)')
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        variants: Array.isArray(d.variants) ? d.variants : [],
        results: d.results && typeof d.results === 'object' && !Array.isArray(d.results) ? d.results : {},
      })) as Experiment[];
    },
  });
}

export function useCreateExperiment() {
  const qc = useQueryClient();
  const { tenant, user } = useAuth();

  return useMutation({
    mutationFn: async (experiment: {
      title: string;
      hypothesis?: string;
      metric_key?: string;
      start_date?: string;
      end_date?: string;
      linked_campaign_id?: string;
      variants?: ExperimentVariant[];
    }) => {
      const { data, error } = await supabase
        .from('experiments')
        .insert({
          title: experiment.title,
          hypothesis: experiment.hypothesis || null,
          metric_key: experiment.metric_key || null,
          start_date: experiment.start_date || null,
          end_date: experiment.end_date || null,
          linked_campaign_id: experiment.linked_campaign_id || null,
          tenant_id: tenant!.id,
          created_by: user?.id || null,
          variants: (experiment.variants || []) as any,
          results: {} as any,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiments'] }),
  });
}

export function useUpdateExperiment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Experiment>) => {
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.hypothesis !== undefined) payload.hypothesis = updates.hypothesis;
      if (updates.metric_key !== undefined) payload.metric_key = updates.metric_key;
      if (updates.start_date !== undefined) payload.start_date = updates.start_date;
      if (updates.end_date !== undefined) payload.end_date = updates.end_date;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.linked_campaign_id !== undefined) payload.linked_campaign_id = updates.linked_campaign_id;
      if (updates.variants !== undefined) payload.variants = updates.variants;
      if (updates.results !== undefined) payload.results = updates.results;
      if (updates.decision !== undefined) payload.decision = updates.decision;

      const { data, error } = await supabase
        .from('experiments')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiments'] }),
  });
}
