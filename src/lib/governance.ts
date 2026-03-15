/**
 * Governance utilities for RBAC, module access, and quota enforcement
 * 
 * This module provides client-side helpers that mirror server-side checks.
 * CRITICAL: These are UI helpers only. Real enforcement happens via RLS and RPC.
 */

import { supabase } from '@/integrations/supabase/client';

// App types
export type AppId = 'ia' | 'marketing' | 'trade' | 'ofertas';
/** @deprecated Use AppId instead */
export type ModuleId = AppId;

// Feature flags
export type FeatureFlag =
  | 'ia'
  | 'marketing'
  | 'trade'
  | 'ofertas'
  | 'advanced_analytics'
  | 'api_access'
  | 'whatsapp_integration'
  | 'erp_integration';

// Quota types
export type QuotaType = 'ai_queries' | 'campaigns' | 'storage';

// Usage metrics response shape
export interface UsageMetrics {
  ai_queries: {
    used: number;
    limit: number;
    percentage: number;
    reset_at: string;
  };
  campaigns: {
    used: number;
    limit: number;
    percentage: number;
    reset_at: string;
  };
  storage: {
    used_bytes: number;
    limit_bytes: number;
    used_formatted: string;
    limit_formatted: string;
    percentage: number;
  };
  features: Record<FeatureFlag, boolean>;
}

/**
 * Check if a quota can be used (and increment if so)
 * This calls the server-side RPC function
 */
export async function checkQuota(
  tenantId: string,
  quotaType: QuotaType
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_quota', {
    p_tenant_id: tenantId,
    p_quota_type: quotaType,
  });

  if (error) {
    console.error('Quota check failed:', error);
    return false;
  }

  return data === true;
}

/**
 * Get usage metrics for current user's tenant
 */
export async function getUsageMetrics(
  tenantId?: string
): Promise<UsageMetrics | null> {
  const { data, error } = await supabase.rpc('get_usage_metrics', {
    p_tenant_id: tenantId ?? null,
  });

  if (error) {
    console.error('Failed to get usage metrics:', error);
    return null;
  }

  return data as unknown as UsageMetrics;
}

/**
 * Check if an app is enabled for a user
 */
export async function isAppEnabled(
  userId: string,
  appId: AppId
): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_module_enabled', {
    p_user_id: userId,
    p_module: appId,
  });

  if (error) {
    console.error('App check failed:', error);
    return false;
  }

  return data === true;
}

/** @deprecated Use isAppEnabled instead */
export const isModuleEnabled = isAppEnabled;

/**
 * Check if a feature flag is enabled for a user
 */
export async function isFeatureEnabled(
  userId: string,
  feature: FeatureFlag
): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_feature_enabled', {
    p_user_id: userId,
    p_feature: feature,
  });

  if (error) {
    console.error('Feature check failed:', error);
    return false;
  }

  return data === true;
}

/**
 * Log an audit entry
 */
export async function logAudit(params: {
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}): Promise<string | null> {
  const { data, error } = await supabase.rpc('log_audit', {
    p_action: params.action,
    p_resource_type: params.resourceType,
    p_resource_id: params.resourceId ?? null,
    p_resource_name: params.resourceName ?? null,
    p_old_values: (params.oldValues ?? null) as unknown as null,
    p_new_values: (params.newValues ?? null) as unknown as null,
    p_metadata: (params.metadata ?? {}) as unknown as Record<string, never>,
    p_severity: params.severity ?? 'info',
  });

  if (error) {
    console.error('Audit log failed:', error);
    return null;
  }

  return data as string;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get quota warning level
 */
export function getQuotaWarningLevel(
  percentage: number
): 'normal' | 'warning' | 'critical' {
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'warning';
  return 'normal';
}
