import { useCallback, useEffect } from "react";

export default function useLockXScroll() {
  const lock = useCallback(() => {
    try {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } catch {}
  }, []);

  const unlock = useCallback(() => {
    try {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    } catch {}
  }, []);

  useEffect(() => {
    return () => { unlock(); };
  }, [unlock]);

  return { lock, unlock };
}
