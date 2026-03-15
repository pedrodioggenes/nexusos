import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReportBlock {
  type: 'budget_summary' | 'campaign_performance' | 'kpi_cards' | 'store_ranking' | 'demand_status' | 'alert_summary' | 'experiment_results';
  label: string;
  enabled: boolean;
}

export interface ReportFilters {
  period_start?: string;
  period_end?: string;
  unit_ids?: string[];
  channels?: string[];
}

export interface ReportDefinition {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  blocks: ReportBlock[];
  filters: ReportFilters;
  schedule: any | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportRun {
  id: string;
  tenant_id: string;
  definition_id: string;
  generated_at: string;
  generated_by: string | null;
  output_meta: Record<string, any>;
  file_url: string | null;
  created_at: string;
}

export const AVAILABLE_BLOCKS: ReportBlock[] = [
  { type: 'budget_summary', label: 'Resumo Orçamentário', enabled: true },
  { type: 'campaign_performance', label: 'Performance de Campanhas', enabled: true },
  { type: 'kpi_cards', label: 'KPIs Principais', enabled: true },
  { type: 'store_ranking', label: 'Ranking de Lojas', enabled: false },
  { type: 'demand_status', label: 'Status de Demandas', enabled: false },
  { type: 'alert_summary', label: 'Resumo de Alertas', enabled: false },
  { type: 'experiment_results', label: 'Resultados de Experimentos', enabled: false },
];

export function useReportDefinitions() {
  return useQuery({
    queryKey: ['report-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_definitions')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        blocks: Array.isArray(d.blocks) ? d.blocks : [],
        filters: d.filters && typeof d.filters === 'object' && !Array.isArray(d.filters) ? d.filters : {},
      })) as ReportDefinition[];
    },
  });
}

export function useCreateReportDefinition() {
  const qc = useQueryClient();
  const { tenant, user } = useAuth();
  return useMutation({
    mutationFn: async (def: { name: string; description?: string; blocks: ReportBlock[]; filters: ReportFilters; schedule?: any }) => {
      const { data, error } = await supabase
        .from('report_definitions')
        .insert({
          name: def.name,
          description: def.description || null,
          blocks: def.blocks as any,
          filters: def.filters as any,
          schedule: def.schedule || null,
          tenant_id: tenant!.id,
          created_by: user?.id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['report-definitions'] }),
  });
}

export function useUpdateReportDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; blocks?: ReportBlock[]; filters?: ReportFilters; schedule?: any }) => {
      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.blocks !== undefined) payload.blocks = updates.blocks;
      if (updates.filters !== undefined) payload.filters = updates.filters;
      if (updates.schedule !== undefined) payload.schedule = updates.schedule;

      const { data, error } = await supabase
        .from('report_definitions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['report-definitions'] }),
  });
}

export function useDeleteReportDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('report_definitions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['report-definitions'] }),
  });
}

export function useReportRuns(definitionId?: string) {
  return useQuery({
    queryKey: ['report-runs', definitionId],
    queryFn: async () => {
      let query = supabase
        .from('report_runs')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(50);
      if (definitionId) query = query.eq('definition_id', definitionId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ReportRun[];
    },
    enabled: !!definitionId,
  });
}

export function useCreateReportRun() {
  const qc = useQueryClient();
  const { tenant, user } = useAuth();
  return useMutation({
    mutationFn: async (run: { definition_id: string; output_meta: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('report_runs')
        .insert({
          definition_id: run.definition_id,
          output_meta: run.output_meta as any,
          tenant_id: tenant!.id,
          generated_by: user?.id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['report-runs'] }),
  });
}
