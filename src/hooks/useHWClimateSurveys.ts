import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClimateSurvey {
  id: string;
  title: string;
  description: string | null;
  questions: { id: string; text: string; type: "rating" | "text" }[];
  is_anonymous: boolean;
  is_active: boolean;
  ends_at: string | null;
  created_at: string;
  response_count?: number;
  user_responded?: boolean;
}

export function useHWClimateSurveys(tenantId?: string, userId?: string) {
  return useQuery({
    queryKey: ["hw-climate-surveys", tenantId],
    queryFn: async (): Promise<ClimateSurvey[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("hw_climate_surveys" as any)
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get response counts
      const surveyIds = (data || []).map((s: any) => s.id);
      const { data: responses } = await supabase
        .from("hw_climate_responses" as any)
        .select("survey_id, user_id")
        .in("survey_id", surveyIds);

      return (data || []).map((s: any) => ({
        ...s,
        questions: s.questions || [],
        response_count: (responses || []).filter((r: any) => r.survey_id === s.id).length,
        user_responded: userId ? (responses || []).some((r: any) => r.survey_id === s.id && r.user_id === userId) : false,
      }));
    },
    enabled: !!tenantId,
  });
}

export function useCreateClimateSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { tenant_id: string; created_by: string; title: string; description?: string; questions: any[]; is_anonymous?: boolean; ends_at?: string }) => {
      const { error } = await supabase.from("hw_climate_surveys" as any).insert({
        tenant_id: params.tenant_id,
        created_by: params.created_by,
        title: params.title,
        description: params.description,
        questions: params.questions,
        is_anonymous: params.is_anonymous ?? true,
        ends_at: params.ends_at,
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["hw-climate-surveys", v.tenant_id] }),
  });
}

export function useSubmitClimateResponse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { survey_id: string; tenant_id: string; user_id: string; answers: Record<string, any>; is_anonymous: boolean }) => {
      const { error } = await supabase.from("hw_climate_responses" as any).insert({
        survey_id: params.survey_id,
        tenant_id: params.tenant_id,
        user_id: params.is_anonymous ? null : params.user_id,
        answers: params.answers,
      });
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["hw-climate-surveys", v.tenant_id] }),
  });
}

export function useClimateSurveyResults(surveyId?: string) {
  return useQuery({
    queryKey: ["hw-climate-results", surveyId],
    queryFn: async () => {
      if (!surveyId) return [];
      const { data, error } = await supabase
        .from("hw_climate_responses" as any)
        .select("answers")
        .eq("survey_id", surveyId);
      if (error) throw error;
      return (data || []).map((r: any) => r.answers);
    },
    enabled: !!surveyId,
  });
}
