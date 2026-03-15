import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";

// ─── Types ─────────────────────────────────────────────────────
export type GoalScope = 'personal' | 'team' | 'department' | 'network';
export type GoalStatus = 'draft' | 'active' | 'completed' | 'archived';
export type GoalPriority = 'low' | 'medium' | 'high';

export interface HWGoal {
  id: string;
  tenant_id: string;
  user_id: string;
  title: string;
  description: string | null;
  scope: GoalScope;
  scope_target_id: string | null;
  assigned_to: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  period: string;
  status: GoalStatus;
  priority: GoalPriority;
  deadline: string | null;
  parent_goal_id: string | null;
  campaign_id: string | null;
  created_at: string;
  updated_at: string;
  key_results?: HWKeyResult[];
  checkins?: HWGoalCheckin[];
  // Joined
  creator_name?: string;
}

export interface HWKeyResult {
  id: string;
  goal_id: string;
  title: string;
  target: number;
  current: number;
  weight: number;
  unit: string;
}

export interface HWGoalCheckin {
  id: string;
  goal_id: string;
  user_id: string;
  note: string | null;
  progress_snapshot: number;
  created_at: string;
}

export interface HWGoalCampaign {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  scope_required: string;
  min_goals_required: number;
  starts_at: string;
  ends_at: string;
  reward_description: string | null;
  reward_badge_name: string | null;
  created_by: string;
  status: string;
  created_at: string;
  // Computed
  participants_count?: number;
  my_participation?: { goals_created_count: number; completed_at: string | null } | null;
}

export interface HWGoalBadge {
  id: string;
  user_id: string;
  badge_key: string;
  badge_label: string;
  badge_icon: string;
  badge_color: string;
  earned_at: string;
  goal_id: string | null;
  campaign_id: string | null;
}

// ─── Goals Hook ────────────────────────────────────────────────
export function useHWGoals(scope?: GoalScope) {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();

  return useQuery({
    queryKey: ["hw-goals", tenantId, scope],
    queryFn: async (): Promise<HWGoal[]> => {
      if (!tenantId) return [];
      let q = (supabase as any)
        .from("hw_goals")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      if (scope) q = q.eq("scope", scope);
      const { data, error } = await q.limit(200);
      if (error) throw error;

      // Fetch key results
      const goalIds = (data || []).map((g: any) => g.id);
      let keyResults: any[] = [];
      if (goalIds.length > 0) {
        const { data: krs } = await (supabase as any)
          .from("hw_key_results")
          .select("*")
          .in("goal_id", goalIds);
        keyResults = krs || [];
      }

      return (data || []).map((g: any) => ({
        ...g,
        key_results: keyResults.filter((kr: any) => kr.goal_id === g.id),
      }));
    },
    enabled: !!tenantId && !!user?.id,
    staleTime: 30_000,
  });
}

// ─── Create Goal ───────────────────────────────────────────────
export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goal: {
      tenant_id: string;
      user_id: string;
      title: string;
      description?: string;
      scope?: GoalScope;
      scope_target_id?: string;
      assigned_to?: string;
      target_value?: number;
      unit?: string;
      period?: string;
      priority?: GoalPriority;
      deadline?: string;
      parent_goal_id?: string;
      campaign_id?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("hw_goals")
        .insert({
          ...goal,
          scope: goal.scope || 'personal',
          priority: goal.priority || 'medium',
          status: 'active',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-goals"] }),
  });
}

// ─── Update Goal ───────────────────────────────────────────────
export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await (supabase as any)
        .from("hw_goals")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-goals"] }),
  });
}

// ─── Update Progress ──────────────────────────────────────────
export function useUpdateGoalProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, current_value, status }: { id: string; current_value: number; status?: GoalStatus }) => {
      const updates: any = { current_value, updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      const { error } = await (supabase as any)
        .from("hw_goals")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-goals"] }),
  });
}

// ─── Delete Goal ──────────────────────────────────────────────
export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("hw_goals")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-goals"] }),
  });
}

// ─── Key Results ──────────────────────────────────────────────
export function useCreateKeyResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (kr: { goal_id: string; tenant_id: string; title: string; target?: number; weight?: number; unit?: string }) => {
      const { error } = await (supabase as any)
        .from("hw_key_results")
        .insert(kr);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-goals"] }),
  });
}

export function useUpdateKeyResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; current?: number; title?: string }) => {
      const { error } = await (supabase as any)
        .from("hw_key_results")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-goals"] }),
  });
}

// ─── Checkins ─────────────────────────────────────────────────
export function useGoalCheckins(goalId?: string) {
  return useQuery({
    queryKey: ["hw-goal-checkins", goalId],
    queryFn: async (): Promise<HWGoalCheckin[]> => {
      const { data, error } = await (supabase as any)
        .from("hw_goal_checkins")
        .select("*")
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!goalId,
  });
}

export function useCreateCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (checkin: { goal_id: string; user_id: string; tenant_id: string; note?: string; progress_snapshot: number }) => {
      const { error } = await (supabase as any)
        .from("hw_goal_checkins")
        .insert(checkin);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["hw-goal-checkins", vars.goal_id] });
      qc.invalidateQueries({ queryKey: ["hw-goals"] });
    },
  });
}

// ─── Campaigns ────────────────────────────────────────────────
export function useGoalCampaigns() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();

  return useQuery({
    queryKey: ["hw-goal-campaigns", tenantId],
    queryFn: async (): Promise<HWGoalCampaign[]> => {
      if (!tenantId) return [];
      const { data, error } = await (supabase as any)
        .from("hw_goal_campaigns")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get participant counts and user participation
      const campaignIds = (data || []).map((c: any) => c.id);
      let participants: any[] = [];
      if (campaignIds.length > 0) {
        const { data: parts } = await (supabase as any)
          .from("hw_goal_campaign_participants")
          .select("*")
          .in("campaign_id", campaignIds);
        participants = parts || [];
      }

      return (data || []).map((c: any) => {
        const campParts = participants.filter((p: any) => p.campaign_id === c.id);
        const myPart = campParts.find((p: any) => p.user_id === user?.id);
        return {
          ...c,
          participants_count: campParts.length,
          my_participation: myPart ? { goals_created_count: myPart.goals_created_count, completed_at: myPart.completed_at } : null,
        };
      });
    },
    enabled: !!tenantId,
    staleTime: 60_000,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: {
      tenant_id: string;
      title: string;
      description?: string;
      scope_required?: string;
      min_goals_required?: number;
      ends_at: string;
      reward_description?: string;
      reward_badge_name?: string;
      created_by: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("hw_goal_campaigns")
        .insert(campaign)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-goal-campaigns"] }),
  });
}

export function useJoinCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { campaign_id: string; user_id: string; tenant_id: string }) => {
      const { error } = await (supabase as any)
        .from("hw_goal_campaign_participants")
        .insert(params);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hw-goal-campaigns"] }),
  });
}

// ─── Badges ───────────────────────────────────────────────────
export function useGoalBadges(userId?: string) {
  const { data: tenantId } = useHWTenantId();

  return useQuery({
    queryKey: ["hw-goal-badges", userId],
    queryFn: async (): Promise<HWGoalBadge[]> => {
      if (!userId || !tenantId) return [];
      const { data, error } = await (supabase as any)
        .from("hw_goal_badges")
        .select("*")
        .eq("user_id", userId)
        .eq("tenant_id", tenantId)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && !!tenantId,
  });
}

export function useAwardBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (badge: {
      user_id: string;
      tenant_id: string;
      badge_key: string;
      badge_label: string;
      badge_icon?: string;
      badge_color?: string;
      goal_id?: string;
      campaign_id?: string;
    }) => {
      const { error } = await (supabase as any)
        .from("hw_goal_badges")
        .upsert(badge, { onConflict: "user_id,badge_key" });
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["hw-goal-badges", vars.user_id] }),
  });
}
