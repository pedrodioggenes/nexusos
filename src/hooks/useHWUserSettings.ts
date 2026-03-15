import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useRef } from "react";

export interface HWSettings {
  theme: "dark" | "light" | "system";
  accentColor: string;
  density: "compact" | "default" | "comfortable";
  defaultView: string;
  soundEnabled: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
  notifyMessages: boolean;
  notifyMural: boolean;
  notifyTrainings: boolean;
  notifyBirthdays: boolean;
  notifyTeam: boolean;
  showOnline: boolean;
  readReceipts: boolean;
  typingIndicator: boolean;
  reduceMotion: boolean;
  fontSize: number;
  highContrast: boolean;
}

export const DEFAULT_SETTINGS: HWSettings = {
  theme: "dark",
  accentColor: "#EA580C",
  density: "default",
  defaultView: "home",
  soundEnabled: true,
  quietHours: false,
  quietStart: "22:00",
  quietEnd: "07:00",
  notifyMessages: true,
  notifyMural: true,
  notifyTrainings: true,
  notifyBirthdays: false,
  notifyTeam: true,
  showOnline: true,
  readReceipts: true,
  typingIndicator: true,
  reduceMotion: false,
  fontSize: 100,
  highContrast: false,
};

export function useHWUserSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["hw-user-settings", user?.id];
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: settings, isLoading } = useQuery({
    queryKey: key,
    queryFn: async (): Promise<HWSettings> => {
      const { data, error } = await (supabase as any)
        .from("hw_user_settings")
        .select("settings")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (data?.settings) {
        return { ...DEFAULT_SETTINGS, ...(data.settings as Partial<HWSettings>) };
      }
      return DEFAULT_SETTINGS;
    },
    enabled: !!user?.id,
  });

  const upsertMutation = useMutation({
    mutationFn: async (newSettings: HWSettings) => {
      const { error } = await (supabase as any)
        .from("hw_user_settings")
        .upsert(
          {
            user_id: user!.id,
            settings: newSettings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateSetting = useCallback(
    <K extends keyof HWSettings>(settingKey: K, value: HWSettings[K]) => {
      const current = qc.getQueryData<HWSettings>(key) ?? DEFAULT_SETTINGS;
      const updated = { ...current, [settingKey]: value };
      // Optimistic update
      qc.setQueryData(key, updated);
      // Debounced persist
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        upsertMutation.mutate(updated);
      }, 500);
    },
    [qc, key, upsertMutation, user?.id]
  );

  return {
    settings: settings ?? DEFAULT_SETTINGS,
    isLoading,
    updateSetting,
  };
}
