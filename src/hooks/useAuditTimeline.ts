import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  user_id: string;
  user_email: string | null;
  user_type: string | null;
  tenant_id: string | null;
  created_at: string;
}

interface UseAuditTimelineOptions {
  resourceType: string;
  resourceId: string;
  limit?: number;
}

/**
 * Hook to fetch audit timeline for a specific resource
 */
export function useAuditTimeline({ 
  resourceType, 
  resourceId, 
  limit = 50 
}: UseAuditTimelineOptions) {
  return useQuery({
    queryKey: ['audit-timeline', resourceType, resourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_audit_log')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as AuditEntry[];
    },
    enabled: !!resourceId,
  });
}

/**
 * Hook to fetch recent audit logs for a tenant
 */
export function useTenantAuditLogs(tenantId?: string | null, limit = 100) {
  return useQuery({
    queryKey: ['tenant-audit-logs', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('system_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AuditEntry[];
    },
  });
}

// Action labels for display
export const auditActionLabels: Record<string, { label: string; icon: string; color: string }> = {
  create: { label: 'Criação', icon: 'plus', color: 'success' },
  update: { label: 'Atualização', icon: 'edit', color: 'accent' },
  delete: { label: 'Exclusão', icon: 'trash', color: 'destructive' },
  approve: { label: 'Aprovação', icon: 'check', color: 'success' },
  reject: { label: 'Rejeição', icon: 'x', color: 'destructive' },
  upload: { label: 'Upload', icon: 'upload', color: 'primary' },
  download: { label: 'Download', icon: 'download', color: 'muted' },
  login: { label: 'Login', icon: 'log-in', color: 'primary' },
  logout: { label: 'Logout', icon: 'log-out', color: 'muted' },
};
