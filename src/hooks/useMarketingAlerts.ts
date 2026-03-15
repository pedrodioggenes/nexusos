import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface MarketingAlert {
  id: string;
  tenant_id: string | null;
  type: 'budget' | 'roi' | 'execution' | 'supplier' | 'goal' | 'anomaly';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string | null;
  data: Json;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_read: boolean;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  ai_suggestion: string | null;
  created_at: string;
  rule_key: string | null;
  evidence: string | null;
  action_link: string | null;
  impact: string | null;
}

export function useMarketingAlerts(options?: { unreadOnly?: boolean; type?: string }) {
  return useQuery({
    queryKey: ['marketing-alerts', options],
    queryFn: async () => {
      let query = supabase
        .from('marketing_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.unreadOnly) {
        query = query.eq('is_read', false);
      }

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketingAlert[];
    },
  });
}

export function useUnreadAlertsCount() {
  return useQuery({
    queryKey: ['marketing-alerts-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('marketing_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('is_resolved', false);

      if (error) throw error;
      return count || 0;
    },
  });
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('marketing_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-alerts-count'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível marcar o alerta como lido",
        variant: "destructive",
      });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('marketing_alerts')
        .update({ 
          is_resolved: true, 
          is_read: true,
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-alerts-count'] });
      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível resolver o alerta",
        variant: "destructive",
      });
    },
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: Omit<MarketingAlert, 'id' | 'created_at' | 'is_read' | 'is_resolved' | 'resolved_at' | 'resolved_by'>) => {
      const { data, error } = await supabase
        .from('marketing_alerts')
        .insert([{
          tenant_id: alert.tenant_id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          data: alert.data,
          related_entity_type: alert.related_entity_type,
          related_entity_id: alert.related_entity_id,
          ai_suggestion: alert.ai_suggestion,
          rule_key: alert.rule_key,
          evidence: alert.evidence,
          action_link: alert.action_link,
          impact: alert.impact,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-alerts-count'] });
    },
  });
}
