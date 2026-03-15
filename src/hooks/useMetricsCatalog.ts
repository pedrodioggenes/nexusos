import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MetricCatalogEntry {
  id: string;
  tenant_id: string | null;
  metric_key: string;
  display_name_pt: string;
  unit: 'currency' | 'percent' | 'count' | 'ratio' | 'score';
  frequency: 'daily' | 'weekly' | 'monthly';
  description: string | null;
  formula_hint: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetricRecord {
  id: string;
  tenant_id: string;
  catalog_id: string;
  value: number;
  period_start: string;
  period_end: string;
  channel: string | null;
  campaign_id: string | null;
  unit_id: string | null;
  quality_flag: 'ok' | 'missing' | 'inconsistent' | 'outlier' | null;
  quality_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  catalog?: MetricCatalogEntry;
  unit?: { id: string; name: string; city: string } | null;
}

// ===== CATALOG HOOKS =====

export function useMetricsCatalog() {
  return useQuery({
    queryKey: ['metrics-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metrics_catalog')
        .select('*')
        .order('display_name_pt');
      if (error) throw error;
      return data as MetricCatalogEntry[];
    },
  });
}

export function useCreateMetricCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Omit<MetricCatalogEntry, 'id' | 'created_at' | 'updated_at' | 'is_system'>) => {
      const { data, error } = await supabase
        .from('metrics_catalog')
        .insert({ ...entry, is_system: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metrics-catalog'] }),
  });
}

export function useUpdateMetricCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<MetricCatalogEntry>) => {
      const { data, error } = await supabase
        .from('metrics_catalog')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metrics-catalog'] }),
  });
}

// ===== RECORD HOOKS =====

export function useMetricRecords(catalogId?: string, periodStart?: string) {
  return useQuery({
    queryKey: ['metric-records', catalogId, periodStart],
    queryFn: async () => {
      let query = supabase
        .from('metric_records')
        .select('*, catalog:metrics_catalog(*), unit:units(id, name, city)')
        .order('period_start', { ascending: false });

      if (catalogId) query = query.eq('catalog_id', catalogId);
      if (periodStart) query = query.eq('period_start', periodStart);

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as MetricRecord[];
    },
  });
}

export function useCreateMetricRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: {
      tenant_id: string;
      catalog_id: string;
      value: number;
      period_start: string;
      period_end: string;
      channel?: string;
      campaign_id?: string;
      unit_id?: string;
      quality_flag?: string;
      quality_notes?: string;
      created_by?: string;
    }) => {
      const { data, error } = await supabase
        .from('metric_records')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['metric-records'] });
    },
  });
}

// ===== DATA QUALITY =====

export function useMetricDataQuality() {
  return useQuery({
    queryKey: ['metric-data-quality'],
    queryFn: async () => {
      // Fetch all active catalog entries and recent records
      const [catalogRes, recordsRes] = await Promise.all([
        supabase.from('metrics_catalog').select('*').eq('is_active', true),
        supabase.from('metric_records').select('catalog_id, quality_flag, period_start').order('period_start', { ascending: false }).limit(500),
      ]);

      const catalog = (catalogRes.data || []) as MetricCatalogEntry[];
      const records = recordsRes.data || [];

      // Check for missing metrics in current period
      const now = new Date();
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

      const recordedKeys = new Set(
        records
          .filter(r => r.period_start === currentPeriodStart)
          .map(r => r.catalog_id)
      );

      const missingMetrics = catalog.filter(c => !recordedKeys.has(c.id));
      const outliers = records.filter(r => r.quality_flag === 'outlier');
      const inconsistent = records.filter(r => r.quality_flag === 'inconsistent');

      return {
        missingCount: missingMetrics.length,
        missingMetrics,
        outlierCount: outliers.length,
        inconsistentCount: inconsistent.length,
        totalRecords: records.length,
        healthScore: catalog.length > 0
          ? Math.round(((catalog.length - missingMetrics.length) / catalog.length) * 100)
          : 100,
      };
    },
  });
}

// ===== HELPERS =====

export function getUnitLabel(unit: string): string {
  switch (unit) {
    case 'currency': return 'R$';
    case 'percent': return '%';
    case 'count': return 'un.';
    case 'ratio': return 'x';
    case 'score': return 'pts';
    default: return '';
  }
}

export function getUnitPlaceholder(unit: string): string {
  switch (unit) {
    case 'currency': return '0.00';
    case 'percent': return '0.0';
    case 'count': return '0';
    case 'ratio': return '0.00';
    case 'score': return '0';
    default: return '0';
  }
}

export function formatMetricValue(value: number, unit: string): string {
  switch (unit) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'count':
      return value.toLocaleString('pt-BR');
    case 'ratio':
      return `${value.toFixed(2)}x`;
    case 'score':
      return value.toFixed(0);
    default:
      return value.toString();
  }
}
