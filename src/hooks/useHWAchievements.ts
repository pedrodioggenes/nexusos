import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HWAchievement {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  icon: string;
  criteria_type: string;
  criteria_value: any;
  points: number;
  created_at: string;
}

export interface HWUserBadge {
  id: string;
  user_id: string;
  achievement_id: string;
  tenant_id: string;
  earned_at: string;
  achievement?: HWAchievement;
}

export function useHWAchievements(tenantId?: string) {
  return useQuery({
    queryKey: ["hw-achievements", tenantId],
    queryFn: async (): Promise<HWAchievement[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("hw_achievements" as any)
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as HWAchievement[];
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useHWUserBadges(tenantId?: string, userId?: string) {
  return useQuery({
    queryKey: ["hw-user-badges", tenantId, userId],
    queryFn: async (): Promise<HWUserBadge[]> => {
      if (!tenantId || !userId) return [];
      const { data: badges, error } = await supabase
        .from("hw_user_badges" as any)
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });
      if (error) throw error;

      const achievementIds = (badges || []).map((b: any) => b.achievement_id);
      let achievements: any[] = [];
      if (achievementIds.length > 0) {
        const { data: achData } = await supabase
          .from("hw_achievements" as any)
          .select("*")
          .in("id", achievementIds);
        achievements = achData || [];
      }

      const achMap = new Map(achievements.map((a: any) => [a.id, a]));
      return (badges || []).map((b: any) => ({
        ...b,
        achievement: achMap.get(b.achievement_id),
      }));
    },
    enabled: !!tenantId && !!userId,
    staleTime: 60_000,
  });
}

export function useCreateAchievement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ach: { tenant_id: string; title: string; description?: string; icon?: string; criteria_type?: string; points?: number }) => {
      const { error } = await supabase.from("hw_achievements" as any).insert(ach);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-achievements"] }),
  });
}

export function useAwardBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (badge: { user_id: string; achievement_id: string; tenant_id: string }) => {
      const { error } = await supabase.from("hw_user_badges" as any).insert(badge);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-user-badges"] }),
  });
}
