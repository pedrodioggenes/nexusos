/**
 * Governance hooks for RBAC, quotas, and feature flags
 * Provides reactive access to governance data with caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { UsageMetrics, ModuleId, FeatureFlag, QuotaType } from '@/lib/governance';
import { logAudit } from '@/lib/governance';
import { toast } from 'sonner';

/**
 * Hook to get current tenant's usage metrics
 */
export function useUsageMetrics() {
  const { tenant } = useAuth();

  return useQuery({
    queryKey: ['usage-metrics', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      const { data, error } = await supabase.rpc('get_usage_metrics', {
        p_tenant_id: tenant.id,
      });

      if (error) throw error;
      return data as unknown as UsageMetrics;
    },
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}

/**
 * Hook to check and consume quota
 */
export function useQuotaCheck() {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotaType: QuotaType) => {
      if (!tenant?.id) {
        throw new Error('No tenant context');
      }

      const { data, error } = await supabase.rpc('check_quota', {
        p_tenant_id: tenant.id,
        p_quota_type: quotaType,
      });

      if (error) throw error;
      
      if (!data) {
        throw new Error(`Quota limit reached for ${quotaType}`);
      }

      return true;
    },
    onSuccess: () => {
      // Invalidate usage metrics to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['usage-metrics', tenant?.id] });
    },
    onError: (error: Error) => {
      if (error.message.includes('Quota limit')) {
        toast.error('Limite de uso atingido', {
          description: 'Você atingiu o limite para este recurso. Entre em contato com o suporte.',
        });
      }
    },
  });
}

/**
 * Hook to check if a module is enabled
 */
export function useModuleAccess(moduleId: ModuleId) {
  const { user, tenant } = useAuth();

  // First check local tenant data (fast)
  const localEnabled = tenant?.modules_enabled?.includes(moduleId) ?? false;

  // Then verify with server (authoritative)
  const { data: serverEnabled } = useQuery({
    queryKey: ['module-access', user?.id, moduleId],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase.rpc('is_module_enabled', {
        p_user_id: user.id,
        p_module: moduleId,
      });

      if (error) {
        console.error('Module access check failed:', error);
        return localEnabled; // Fallback to local
      }

      return data === true;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    isEnabled: serverEnabled ?? localEnabled,
    isLoading: serverEnabled === undefined,
  };
}

/**
 * Hook to check if a feature flag is enabled
 */
export function useFeatureFlag(feature: FeatureFlag) {
  const { user } = useAuth();

  const { data: isEnabled, isLoading } = useQuery({
    queryKey: ['feature-flag', user?.id, feature],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase.rpc('is_feature_enabled', {
        p_user_id: user.id,
        p_feature: feature,
      });

      if (error) {
        console.error('Feature flag check failed:', error);
        return false;
      }

      return data === true;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    isEnabled: isEnabled ?? false,
    isLoading,
  };
}

/**
 * Hook to log audit entries
 */
export function useAuditLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: Parameters<typeof logAudit>[0]) => {
      const result = await logAudit(params);
      if (!result) {
        throw new Error('Failed to log audit entry');
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate audit logs if they're being displayed
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

/**
 * Hook to fetch audit logs for an entity
 */
export function useEntityAuditLog(resourceType: string, resourceId?: string) {
  return useQuery({
    queryKey: ['audit-logs', resourceType, resourceId],
    queryFn: async () => {
      let query = supabase
        .from('system_audit_log')
        .select('*')
        .eq('resource_type', resourceType)
        .order('created_at', { ascending: false })
        .limit(50);

      if (resourceId) {
        query = query.eq('resource_id', resourceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!resourceType,
  });
}

/**
 * Hook to get integration configurations
 */
export function useIntegrations() {
  const { tenant } = useAuth();

  return useQuery({
    queryKey: ['integrations', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });
}

/**
 * Hook to manage scheduled jobs
 */
export function useScheduledJobs() {
  const { tenant } = useAuth();
  const queryClient = useQueryClient();

  const jobs = useQuery({
    queryKey: ['scheduled-jobs', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from('scheduled_jobs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('next_run_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });

  const createJob = useMutation({
    mutationFn: async (job: {
      job_type: string;
      job_name: string;
      job_config: Record<string, unknown>;
      schedule_type: 'once' | 'daily' | 'weekly' | 'monthly' | 'cron';
      cron_expression?: string;
      scheduled_at?: string;
    }) => {
      if (!tenant?.id) throw new Error('No tenant context');

      const { data, error } = await supabase
        .from('scheduled_jobs')
        .insert({
          job_type: job.job_type,
          job_name: job.job_name,
          job_config: job.job_config as unknown as Record<string, never>,
          schedule_type: job.schedule_type,
          cron_expression: job.cron_expression,
          scheduled_at: job.scheduled_at,
          tenant_id: tenant.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-jobs', tenant?.id] });
      toast.success('Agendamento criado');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar agendamento', {
        description: error.message,
      });
    },
  });

  const cancelJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('scheduled_jobs')
        .update({ status: 'cancelled', is_active: false })
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-jobs', tenant?.id] });
      toast.success('Agendamento cancelado');
    },
  });

  return {
    jobs: jobs.data ?? [],
    isLoading: jobs.isLoading,
    createJob,
    cancelJob,
  };
}
