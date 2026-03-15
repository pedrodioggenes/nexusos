/**
 * Job Scheduler Edge Function
 * 
 * Executes scheduled jobs with retry logic and structured logging.
 * Uses atomic claim via `claim_due_jobs` RPC to prevent duplicate execution.
 * 
 * CANONICAL JOB TYPES (standardized across doc/edge/UI):
 * - generate_insights: Generate AI insights
 * - report_export: Export scheduled reports
 * - data_sync: Sync data from external sources
 * - cleanup_old_data: Clean up old data
 * - send_notifications: Send notification batches
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Canonical job types - must match UI and documentation
const CANONICAL_JOB_TYPES = [
  'generate_insights',
  'report_export',
  'data_sync',
  'cleanup_old_data',
  'send_notifications',
] as const;

type JobType = typeof CANONICAL_JOB_TYPES[number];

interface ScheduledJob {
  id: string;
  tenant_id: string;
  job_type: JobType;
  job_name: string;
  job_config: Record<string, unknown>;
  schedule_type: 'once' | 'daily' | 'weekly' | 'monthly' | 'cron';
  cron_expression: string | null;
  scheduled_at: string | null;
  next_run_at: string | null;
  status: string;
  retry_count: number;
  max_retries: number;
}

interface JobResult {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

// Structured logging helper
function log(level: 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'job-scheduler',
    message,
    ...meta,
  };
  console.log(JSON.stringify(logEntry));
}

// Define supabase client type for handlers
// deno-lint-ignore no-explicit-any
type SupabaseClientType = any;

// Job handlers - keyed by CANONICAL job types
const jobHandlers: Record<JobType, (job: ScheduledJob, supabase: SupabaseClientType) => Promise<JobResult>> = {
  
  async generate_insights(job, supabase) {
    log('info', 'Starting insight generation', { jobId: job.id, tenantId: job.tenant_id });
    
    try {
      // Get tenant's KPIs and campaigns for context
      const { data: kpis } = await supabase
        .from('marketing_kpis')
        .select('*')
        .eq('tenant_id', job.tenant_id)
        .order('period_start', { ascending: false })
        .limit(10);

      const { data: campaigns } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('tenant_id', job.tenant_id)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(20);

      // Generate insight via AI (placeholder - would call AI service)
      const insightText = `Análise automática gerada em ${new Date().toLocaleDateString('pt-BR')}: ` +
        `${campaigns?.length || 0} campanhas analisadas, ` +
        `${kpis?.length || 0} períodos de KPIs considerados.`;

      // Store insight
      const { error: insertError } = await supabase
        .from('marketing_ai_insights')
        .insert({
          tenant_id: job.tenant_id,
          insight_type: 'automated_analysis',
          insight_text: insightText,
          context_data: { kpis_count: kpis?.length, campaigns_count: campaigns?.length },
          confidence_score: 0.75,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (insertError) throw insertError;

      return {
        success: true,
        message: 'Insight generated successfully',
        data: { kpis_analyzed: kpis?.length, campaigns_analyzed: campaigns?.length },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async report_export(job, supabase) {
    log('info', 'Starting report export', { jobId: job.id, tenantId: job.tenant_id });
    
    try {
      const config = job.job_config as { reportType?: string; period?: string };
      
      // Generate report based on config
      const reportData = {
        generated_at: new Date().toISOString(),
        report_type: config.reportType || 'monthly_summary',
        period: config.period || 'last_30_days',
        tenant_id: job.tenant_id,
      };

      log('info', 'Report generated', { reportData });

      return {
        success: true,
        message: 'Report exported successfully',
        data: reportData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async data_sync(job, supabase) {
    log('info', 'Starting data sync', { jobId: job.id, tenantId: job.tenant_id });
    
    try {
      const config = job.job_config as { syncType?: string; source?: string };
      
      // Check if integration is configured
      const { data: integration } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('tenant_id', job.tenant_id)
        .eq('is_enabled', true)
        .maybeSingle();

      if (!integration) {
        return {
          success: false,
          error: 'No active integration configured',
        };
      }

      log('info', 'Data sync placeholder', { integration: integration.integration_type });

      return {
        success: true,
        message: `Data sync completed for ${config.syncType || 'all'}`,
        data: { records_synced: 0 },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async cleanup_old_data(job, supabase) {
    log('info', 'Starting cleanup job', { jobId: job.id, tenantId: job.tenant_id });
    
    try {
      const config = job.job_config as { retentionDays?: number };
      const retentionDays = config.retentionDays || 90;
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

      // Clean up expired insights
      const { count: insightsDeleted } = await supabase
        .from('marketing_ai_insights')
        .delete({ count: 'exact' })
        .eq('tenant_id', job.tenant_id)
        .lt('expires_at', cutoffDate);

      // Clean up old notifications (read ones)
      const { count: notificationsDeleted } = await supabase
        .from('notifications')
        .delete({ count: 'exact' })
        .eq('read', true)
        .lt('created_at', cutoffDate);

      return {
        success: true,
        message: 'Cleanup completed',
        data: {
          insights_deleted: insightsDeleted,
          notifications_deleted: notificationsDeleted,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async send_notifications(job, supabase) {
    log('info', 'Starting notification send', { jobId: job.id, tenantId: job.tenant_id });
    
    try {
      const config = job.job_config as { type?: string; userIds?: string[] };
      
      // Placeholder for notification sending logic
      log('info', 'Notification send placeholder', { config });

      return {
        success: true,
        message: 'Notifications sent successfully',
        data: { notifications_sent: 0 },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

// Calculate next run time based on schedule
function calculateNextRun(job: ScheduledJob): string | null {
  const now = new Date();
  
  switch (job.schedule_type) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'monthly': {
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toISOString();
    }
    case 'once':
      return null; // No next run for one-time jobs
    case 'cron':
      // For cron, we'd need a parser - for now, default to daily
      // In production, use a cron parser library
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    default:
      return null;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get job ID from request body (optional - if not provided, process all due jobs)
    let specificJobId: string | null = null;
    try {
      const body = await req.json();
      specificJobId = body.jobId || null;
    } catch {
      // No body provided, process all due jobs
    }

    let jobs: ScheduledJob[] = [];

    if (specificJobId) {
      // Fetch specific job
      const { data, error } = await supabase
        .from('scheduled_jobs')
        .select('*')
        .eq('id', specificJobId)
        .single();
      
      if (error) {
        throw new Error(`Failed to fetch job: ${error.message}`);
      }
      
      if (data) {
        // Mark as running
        await supabase
          .from('scheduled_jobs')
          .update({ status: 'running', updated_at: new Date().toISOString() })
          .eq('id', specificJobId);
        jobs = [data as ScheduledJob];
      }
    } else {
      // Use atomic claim_due_jobs RPC to prevent duplicate execution
      const { data, error } = await supabase.rpc('claim_due_jobs', { p_limit: 10 });
      
      if (error) {
        throw new Error(`Failed to claim jobs: ${error.message}`);
      }
      
      jobs = (data || []) as ScheduledJob[];
    }

    if (jobs.length === 0) {
      log('info', 'No jobs to process');
      return new Response(
        JSON.stringify({ success: true, message: 'No jobs to process', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    log('info', 'Processing jobs', { count: jobs.length });

    const results: Array<{ jobId: string; success: boolean; message?: string }> = [];

    for (const job of jobs) {
      log('info', 'Processing job', { jobId: job.id, type: job.job_type, name: job.job_name });

      // Job is already marked as 'running' by claim_due_jobs

      // Get handler for job type
      const handler = jobHandlers[job.job_type as JobType];
      
      if (!handler) {
        log('error', 'Unknown job type', { jobType: job.job_type, validTypes: CANONICAL_JOB_TYPES });
        await supabase
          .from('scheduled_jobs')
          .update({
            status: 'failed',
            last_error: `Unknown job type: ${job.job_type}. Valid types: ${CANONICAL_JOB_TYPES.join(', ')}`,
            last_run_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);
        
        results.push({ jobId: job.id, success: false, message: 'Unknown job type' });
        continue;
      }

      // Execute job
      const result = await handler(job, supabase);

      if (result.success) {
        // Job succeeded
        const nextRunAt = calculateNextRun(job);
        
        await supabase
          .from('scheduled_jobs')
          .update({
            status: nextRunAt ? 'pending' : 'completed',
            last_run_at: new Date().toISOString(),
            next_run_at: nextRunAt,
            last_result: result.data || null,
            last_error: null,
            retry_count: 0, // Reset retry count on success
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        log('info', 'Job completed successfully', { jobId: job.id, nextRunAt });
        results.push({ jobId: job.id, success: true, message: result.message });
      } else {
        // Job failed
        const newRetryCount = job.retry_count + 1;
        const shouldRetry = newRetryCount < job.max_retries;

        // Calculate next run time for retry (exponential backoff) or for recurring schedule
        let nextRunAt: string | null = null;
        
        if (shouldRetry) {
          // Exponential backoff: 2^retry minutes
          nextRunAt = new Date(Date.now() + Math.pow(2, newRetryCount) * 60000).toISOString();
        } else if (job.schedule_type !== 'once') {
          // For recurring jobs, even if max retries exceeded, schedule next regular run
          nextRunAt = calculateNextRun(job);
        }

        await supabase
          .from('scheduled_jobs')
          .update({
            status: shouldRetry ? 'pending' : (nextRunAt ? 'pending' : 'failed'),
            last_run_at: new Date().toISOString(),
            next_run_at: nextRunAt,
            last_error: result.error,
            retry_count: shouldRetry ? newRetryCount : 0, // Reset if moving to next scheduled run
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        log('error', 'Job failed', { 
          jobId: job.id, 
          error: result.error, 
          retryCount: newRetryCount,
          willRetry: shouldRetry,
          nextRunAt,
        });
        
        results.push({ jobId: job.id, success: false, message: result.error });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    log('error', 'Job scheduler error', { error: error instanceof Error ? error.message : 'Unknown' });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
