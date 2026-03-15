import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface HWShortcut {
  id: string;
  label: string;
  icon: string;
  shortcut_type: 'view' | 'module' | 'action';
  target: string;
  sort_order: number;
}

export function useHWShortcuts() {
  const { user, tenant } = useAuth();
  const qc = useQueryClient();
  const key = ['hw-shortcuts', user?.id];

  const { data: shortcuts = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("hw_user_shortcuts")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []).map(s => ({
        id: s.id,
        label: s.label,
        icon: s.icon,
        shortcut_type: s.shortcut_type as HWShortcut['shortcut_type'],
        target: s.target,
        sort_order: s.sort_order,
      }));
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const addShortcut = useMutation({
    mutationFn: async (shortcut: Omit<HWShortcut, 'id' | 'sort_order'>) => {
      if (!user?.id || !tenant?.id) throw new Error('No user/tenant');
      const maxOrder = shortcuts.length > 0 ? Math.max(...shortcuts.map(s => s.sort_order)) + 1 : 0;
      const { data, error } = await supabase
        .from("hw_user_shortcuts")
        .insert([{
          user_id: user.id,
          tenant_id: tenant.id,
          label: shortcut.label,
          icon: shortcut.icon,
          shortcut_type: shortcut.shortcut_type,
          target: shortcut.target,
          sort_order: maxOrder,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const removeShortcut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hw_user_shortcuts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<HWShortcut[]>(key);
      qc.setQueryData<HWShortcut[]>(key, old => (old || []).filter(s => s.id !== id));
      return { prev };
    },
    onError: (_, __, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const reorderShortcuts = useMutation({
    mutationFn: async (newOrder: string[]) => {
      const updates = newOrder.map((id, i) => ({ id, sort_order: i }));
      for (const u of updates) {
        await supabase.from("hw_user_shortcuts").update({ sort_order: u.sort_order }).eq("id", u.id);
      }
    },
    onMutate: async (newOrder) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<HWShortcut[]>(key);
      qc.setQueryData<HWShortcut[]>(key, old => {
        if (!old) return old;
        return newOrder.map((id, i) => {
          const item = old.find(s => s.id === id);
          return item ? { ...item, sort_order: i } : null;
        }).filter(Boolean) as HWShortcut[];
      });
      return { prev };
    },
    onError: (_, __, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { shortcuts, isLoading, addShortcut, removeShortcut, reorderShortcuts };
}
