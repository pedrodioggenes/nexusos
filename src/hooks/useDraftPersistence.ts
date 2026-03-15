import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Persists form state in sessionStorage with debounced writes.
 * Survives page navigation but clears when the tab is closed.
 */
export function useDraftPersistence<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) return JSON.parse(stored) as T;
    } catch {
      // ignore parse errors
    }
    return initialValue;
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced write to sessionStorage
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
        // storage full or unavailable
      }
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [key, value]);

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, clearDraft];
}
