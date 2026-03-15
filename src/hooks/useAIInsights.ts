import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface AISuggestion {
  id: string;
  text: string;
  action_type: string;
  route?: string;
}

export interface AIInsight {
  id: string;
  tenant_id: string | null;
  insight_type: 'dashboard' | 'budget' | 'kpi' | 'campaign' | 'store' | 'trade';
  context_data: Json;
  insight_text: string;
  suggestions: Json;
  confidence_score: number | null;
  is_dismissed: boolean;
  expires_at: string | null;
  created_at: string;
}

export function useAIInsights(type?: string) {
  return useQuery({
    queryKey: ['ai-insights', type],
    queryFn: async () => {
      let query = supabase
        .from('marketing_ai_insights')
        .select('*')
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (type) {
        query = query.eq('insight_type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter out expired insights
      const now = new Date();
      return (data as AIInsight[]).filter(insight => 
        !insight.expires_at || new Date(insight.expires_at) > now
      );
    },
  });
}

// Hook para histórico completo (inclui dispensados)
export function useAllInsights() {
  return useQuery({
    queryKey: ['ai-insights-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as AIInsight[];
    },
  });
}

export function useLatestInsight(type: string) {
  return useQuery({
    queryKey: ['ai-insight-latest', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_ai_insights')
        .select('*')
        .eq('insight_type', type)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Check if expired
      if (data?.expires_at && new Date(data.expires_at) < new Date()) {
        return null;
      }
      
      return data as AIInsight | null;
    },
  });
}

export function useDismissInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('marketing_ai_insights')
        .update({ is_dismissed: true })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insight-latest'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights-all'] });
    },
  });
}

export function useRestoreInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('marketing_ai_insights')
        .update({ is_dismissed: false })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insight-latest'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights-all'] });
    },
  });
}

export function useCreateInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insight: Omit<AIInsight, 'id' | 'created_at' | 'is_dismissed'>) => {
      const { data, error } = await supabase
        .from('marketing_ai_insights')
        .insert([{
          tenant_id: insight.tenant_id,
          insight_type: insight.insight_type,
          context_data: insight.context_data,
          insight_text: insight.insight_text,
          suggestions: insight.suggestions,
          confidence_score: insight.confidence_score,
          expires_at: insight.expires_at,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insight-latest'] });
    },
  });
}

// Hook para gerar insights via edge function dedicada
export function useGenerateInsight() {
  const { toast } = useToast();
  const createInsight = useCreateInsight();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      type, 
      contextData,
      prompt 
    }: { 
      type: AIInsight['insight_type']; 
      contextData: Record<string, unknown>;
      prompt: string;
    }) => {
      // Call dedicated insight generation edge function
      const { data, error } = await supabase.functions.invoke('generate-insight', {
        body: {
          type,
          contextData,
          prompt,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Erro ao gerar insight');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const insightText = data?.insight || 'Não foi possível gerar o insight.';
      const confidenceScore = data?.confidence_score || 85;
      const suggestions = data?.suggestions || [];
      
      // Create and save the insight to the database
      const newInsight = await createInsight.mutateAsync({
        tenant_id: null,
        insight_type: type,
        context_data: contextData as Json,
        insight_text: insightText,
        suggestions: suggestions as Json,
        confidence_score: confidenceScore,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      return newInsight;
    },
    onSuccess: () => {
      toast({
        title: "Insight gerado",
        description: "A análise da IA foi concluída com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insight-latest'] });
    },
    onError: (error: Error) => {
      console.error('Generate insight error:', error);
      toast({
        title: "Erro ao gerar insight",
        description: error.message || "Não foi possível gerar o insight. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}
