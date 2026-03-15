import { createContext, useContext, useEffect, useMemo } from "react";
import { useHWUserSettings, type HWSettings, DEFAULT_SETTINGS } from "@/hooks/useHWUserSettings";

interface HWSettingsContextValue {
  settings: HWSettings;
  updateSetting: <K extends keyof HWSettings>(key: K, value: HWSettings[K]) => void;
  isLoading: boolean;
}

const HWSettingsContext = createContext<HWSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSetting: () => {},
  isLoading: false,
});

export const useHWSettings = () => useContext(HWSettingsContext);

export function HWSettingsProvider({ children, containerRef }: { children: React.ReactNode; containerRef?: React.RefObject<HTMLDivElement> }) {
  const { settings, updateSetting, isLoading } = useHWUserSettings();

  // Apply settings as CSS classes/variables on the container
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    // Density
    el.classList.remove("hw-density-compact", "hw-density-comfortable", "hw-density-default");
    el.classList.add(`hw-density-${settings.density}`);

    // Theme (light via CSS filter inversion)
    el.classList.remove("hw-theme-light");
    const applyLight = settings.theme === 'light' || 
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (applyLight) {
      el.classList.add("hw-theme-light");
    }

    // Reduce motion
    el.classList.toggle("hw-reduce-motion", settings.reduceMotion);

    // High contrast
    el.classList.toggle("hw-high-contrast", settings.highContrast);

    // Font size
    el.style.fontSize = `${settings.fontSize}%`;

    // Accent color as CSS variable
    el.style.setProperty("--hw-accent", settings.accentColor);
  }, [settings, containerRef]);

  const value = useMemo(
    () => ({ settings, updateSetting, isLoading }),
    [settings, updateSetting, isLoading]
  );

  return (
    <HWSettingsContext.Provider value={value}>
      {children}
    </HWSettingsContext.Provider>
  );
}
