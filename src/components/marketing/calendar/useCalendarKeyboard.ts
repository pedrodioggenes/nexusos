import { useEffect } from "react";

interface UseCalendarKeyboardProps {
  onNewEvent: () => void;
  onToday: () => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onEscape: () => void;
  enabled?: boolean;
}

export function useCalendarKeyboard({
  onNewEvent,
  onToday,
  onPreviousMonth,
  onNextMonth,
  onEscape,
  enabled = true,
}: UseCalendarKeyboardProps) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

      switch (e.key) {
        case "n":
        case "N":
          e.preventDefault();
          onNewEvent();
          break;
        case "t":
        case "T":
          e.preventDefault();
          onToday();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onPreviousMonth();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNextMonth();
          break;
        case "Escape":
          onEscape();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onNewEvent, onToday, onPreviousMonth, onNextMonth, onEscape]);
}
