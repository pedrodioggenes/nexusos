import { cn } from "@/lib/utils";

/**
 * NexusOS Input Style Utilities
 *
 * Centralizes input styling tokens so any input-like component (Input, Select,
 * Textarea, etc.) can share a consistent look using NexusOS CSS vars instead of
 * hardcoded colors.
 *
 * All functions return a className string produced by `cn()` so the caller can
 * still pass extra classes for one-off overrides.
 */

// ─── Base input classes ───────────────────────────────────────────────────────

/**
 * Returns the canonical set of classes for a single-line input element.
 *
 * @param error   - optional error message; truthy value activates error state
 * @param hasIcon - whether a start/end icon is present (adds padding offsets)
 */
export const getInputBaseStyles = (
  error?: string,
  hasIcon?: { start?: boolean; end?: boolean }
) =>
  cn(
    // Layout & shape
    "flex h-8 w-full rounded-lg border",
    // Surface — NexusOS card background
    "bg-card text-foreground",
    // Border — NexusOS border token
    "border-border",
    // Placeholder
    "placeholder:text-muted-foreground",
    // Typography
    "text-sm px-3 py-1.5",
    // Focus ring — NexusOS primary (crimson)
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-primary/30 focus-visible:border-primary/50",
    // Transitions
    "transition-all duration-200",
    // Disabled state
    "disabled:cursor-not-allowed disabled:opacity-50",
    // Icon padding offsets
    hasIcon?.start && "ps-9",
    hasIcon?.end   && "pe-9",
    // Error state — NexusOS destructive token
    error && [
      "border-destructive",
      "focus-visible:ring-destructive/40 focus-visible:border-destructive/60",
    ]
  );

// ─── Wrapper container ────────────────────────────────────────────────────────

/**
 * Wrapper div that provides relative positioning for icon slots.
 *
 * @param className - extra classes merged at the end
 */
export const getInputContainerStyles = (className?: string) =>
  cn("relative flex w-full items-center", className);

// ─── Icon positioning ─────────────────────────────────────────────────────────

/**
 * Returns positioning + color classes for an icon placed inside the input.
 *
 * @param position - "start" (left / inline-start) or "end" (right / inline-end)
 */
export const getInputIconStyles = (position: "start" | "end") =>
  cn(
    "pointer-events-none absolute flex items-center",
    "text-muted-foreground [&_svg]:h-4 [&_svg]:w-4",
    position === "start" ? "left-2.5"  : "right-2.5"
  );

// ─── Error message ────────────────────────────────────────────────────────────

/**
 * Classes for the error text rendered below an input.
 */
export const getInputErrorStyles = () =>
  cn("mt-1.5 text-xs text-destructive");

// ─── Label ────────────────────────────────────────────────────────────────────

/**
 * Classes for the <label> element paired with an input.
 */
export const getInputLabelStyles = () =>
  cn("mb-1.5 block text-sm font-medium text-foreground");
