import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ===== TRACKING LINKS =====

export interface CampaignTrackingLink {
  id: string;
  tenant_id: string;
  campaign_id: string;
  channel: string;
  base_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string | null;
  utm_term: string | null;
  final_url: string;
  short_url: string | null;
  clicks_count: number;
  created_at: string;
}

export function useCampaignTrackingLinks(campaignId: string) {
  return useQuery({
    queryKey: ['campaign-tracking-links', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_tracking_links')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CampaignTrackingLink[];
    },
    enabled: !!campaignId,
  });
}

export function buildUTMUrl(baseUrl: string, params: {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
}): string {
  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
  url.searchParams.set('utm_source', params.utm_source);
  url.searchParams.set('utm_medium', params.utm_medium);
  url.searchParams.set('utm_campaign', params.utm_campaign);
  if (params.utm_content) url.searchParams.set('utm_content', params.utm_content);
  if (params.utm_term) url.searchParams.set('utm_term', params.utm_term);
  return url.toString();
}

export function useCreateTrackingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (link: Omit<CampaignTrackingLink, 'id' | 'created_at' | 'clicks_count' | 'short_url'>) => {
      const { data, error } = await supabase
        .from('campaign_tracking_links')
        .insert(link)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['campaign-tracking-links', vars.campaign_id] });
    },
  });
}

export function useDeleteTrackingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, campaignId }: { id: string; campaignId: string }) => {
      const { error } = await supabase
        .from('campaign_tracking_links')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return campaignId;
    },
    onSuccess: (campaignId) => {
      qc.invalidateQueries({ queryKey: ['campaign-tracking-links', campaignId] });
    },
  });
}

// ===== CAMPAIGN RESULTS =====

export interface KpiSnapshot {
  impressions?: number;
  clicks?: number;
  leads?: number;
  conversions?: number;
  reach?: number;
  ctr?: number;
  cpc?: number;
  cpl?: number;
  revenue?: number;
  [key: string]: number | undefined;
}

export interface CampaignResult {
  id: string;
  tenant_id: string;
  campaign_id: string;
  period_start: string;
  period_end: string;
  kpi_snapshot: KpiSnapshot;
  total_investment: number;
  total_revenue: number;
  calculated_roi: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useCampaignResults(campaignId: string) {
  return useQuery({
    queryKey: ['campaign-results', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_results')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('period_start', { ascending: false });
      if (error) throw error;
      return (data || []).map(r => ({
        ...r,
        kpi_snapshot: (r.kpi_snapshot || {}) as KpiSnapshot,
      })) as CampaignResult[];
    },
    enabled: !!campaignId,
  });
}

export function useCreateCampaignResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (result: {
      tenant_id: string;
      campaign_id: string;
      period_start: string;
      period_end: string;
      kpi_snapshot: KpiSnapshot;
      total_investment: number;
      total_revenue: number;
      notes?: string;
      created_by?: string;
    }) => {
      const roi = result.total_investment > 0
        ? ((result.total_revenue - result.total_investment) / result.total_investment) * 100
        : null;

      const { data, error } = await supabase
        .from('campaign_results')
        .insert({
          ...result,
          kpi_snapshot: result.kpi_snapshot as unknown as Json,
          calculated_roi: roi,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['campaign-results', vars.campaign_id] });
      qc.invalidateQueries({ queryKey: ['marketing-campaigns'] });
    },
  });
}

// ===== CAMPAIGN ATTRIBUTION SUMMARY =====

export interface CampaignAttribution {
  campaignId: string;
  campaignName: string;
  totalInvestment: number;
  totalRevenue: number;
  roi: number | null;
  trackingLinksCount: number;
  resultsCount: number;
  linkedTransactionsCount: number;
  executionsCount: number;
}

export function useCampaignAttributions() {
  return useQuery({
    queryKey: ['campaign-attributions'],
    queryFn: async () => {
      const { data: campaigns, error } = await supabase
        .from('marketing_campaigns')
        .select('id, name, planned_budget, spent_amount, actual_roi')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!campaigns || campaigns.length === 0) return [];

      const campaignIds = campaigns.map(c => c.id);

      // Fetch related data in parallel
      const [linksRes, resultsRes, txLinksRes] = await Promise.all([
        supabase.from('campaign_tracking_links').select('campaign_id').in('campaign_id', campaignIds),
        supabase.from('campaign_results').select('campaign_id, total_investment, total_revenue, calculated_roi').in('campaign_id', campaignIds),
        supabase.from('financial_transaction_links').select('linked_id').eq('linked_type', 'campaign').in('linked_id', campaignIds),
      ]);

      const links = linksRes.data || [];
      const results = resultsRes.data || [];
      const txLinks = txLinksRes.data || [];

      return campaigns.map(c => {
        const campaignLinks = links.filter(l => l.campaign_id === c.id);
        const campaignResults = results.filter(r => r.campaign_id === c.id);
        const campaignTxLinks = txLinks.filter(t => t.linked_id === c.id);

        const totalInvestment = campaignResults.reduce((s, r) => s + (r.total_investment || 0), 0) || c.spent_amount || 0;
        const totalRevenue = campaignResults.reduce((s, r) => s + (r.total_revenue || 0), 0);
        const latestRoi = campaignResults.length > 0
          ? campaignResults[0].calculated_roi
          : c.actual_roi;

        return {
          campaignId: c.id,
          campaignName: c.name,
          totalInvestment,
          totalRevenue,
          roi: latestRoi,
          trackingLinksCount: campaignLinks.length,
          resultsCount: campaignResults.length,
          linkedTransactionsCount: campaignTxLinks.length,
          executionsCount: 0, // Will be enriched when executions are linked
        } as CampaignAttribution;
      });
    },
  });
}
