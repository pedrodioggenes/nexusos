import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "./useHWTenantId";

export interface HWNotifPrefs {
  id: string;
  dnd_active: boolean;
  dnd_start: string;
  dnd_end: string;
  mute_channels: boolean;
  mute_mentions: boolean;
  digest_enabled: boolean;
}

const DEFAULTS: Omit<HWNotifPrefs, "id"> = {
  dnd_active: false,
  dnd_start: "22:00",
  dnd_end: "07:00",
  mute_channels: false,
  mute_mentions: false,
  digest_enabled: true,
};

export function useHWNotifPreferences() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const qc = useQueryClient();
  const key = ["hw-notif-prefs", user?.id];

  const { data: prefs, ...rest } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<HWNotifPrefs> => {
      const { data, error } = await supabase
        .from("hw_notification_preferences")
        .select("id, dnd_active, dnd_start, dnd_end, mute_channels, mute_mentions, digest_enabled")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as HWNotifPrefs;
      // Create default row
      const { data: inserted, error: insertErr } = await supabase
        .from("hw_notification_preferences")
        .insert({ user_id: user!.id, tenant_id: tenantId || null })
        .select("id, dnd_active, dnd_start, dnd_end, mute_channels, mute_mentions, digest_enabled")
        .single();
      if (insertErr) throw insertErr;
      return inserted as HWNotifPrefs;
    },
    enabled: !!user?.id,
  });

  const update = useMutation({
    mutationFn: async (updates: Partial<Omit<HWNotifPrefs, "id">>) => {
      if (!prefs?.id) return;
      const { error } = await supabase
        .from("hw_notification_preferences")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", prefs.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { prefs: prefs || (DEFAULTS as HWNotifPrefs), update, ...rest };
}
