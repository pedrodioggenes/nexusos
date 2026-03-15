import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ChecklistItem {
  id: string;
  tenant_id: string | null;
  user_id: string;
  week_start: string;
  label: string;
  is_checked: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export function useWeeklyChecklist(weekStartOverride?: string) {
  const { user, tenant } = useAuth();
  const weekStart = weekStartOverride || getWeekStart();

  return useQuery({
    queryKey: ["weekly-checklist", user?.id, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_checklist_items")
        .select("*")
        .eq("user_id", user!.id)
        .eq("week_start", weekStart)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!user?.id,
  });
}

export function useAddChecklistItem() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async ({ label, weekStart }: { label: string; weekStart?: string }) => {
      if (!user?.id) throw new Error("Não autenticado");
      const ws = weekStart || getWeekStart();

      const { data, error } = await supabase
        .from("weekly_checklist_items")
        .insert({
          user_id: user.id,
          tenant_id: tenant?.id || null,
          week_start: ws,
          label,
          is_checked: false,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-checklist"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_checked }: { id: string; is_checked: boolean }) => {
      const { error } = await supabase
        .from("weekly_checklist_items")
        .update({ is_checked })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-checklist"] });
    },
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("weekly_checklist_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-checklist"] });
    },
  });
}

export { getWeekStart };
