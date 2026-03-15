/**
 * Unified Notification Badge — Apple-level consistency.
 *
 * Rules:
 * - 1 digit  → perfect circle (h × h)
 * - 2+ digits → horizontal pill with proportional padding
 * - Fixed height, border-radius, font-size, font-weight
 * - Consistent positioning (absolute top-right by default)
 *
 * Variants:
 * - "dot"      → collapsed sidebar: absolute positioned mini badge
 * - "inline"   → expanded sidebar: inline pill
 * - "overlay"  → desk icon overlay: absolute positioned
 */
import { memo } from "react";

type BadgeVariant = "dot" | "inline" | "overlay";

interface NotificationBadgeProps {
  count: number;
  variant?: BadgeVariant;
  color?: string;          // background color (HSL string)
  maxCount?: number;       // truncate above this (default 99)
  visible?: boolean;       // control visibility externally
  className?: string;      // extra positioning classes
  easing?: string;         // transition easing
}

const BADGE_HEIGHT = 16;   // h-4 — universal
const FONT_SIZE = 9;       // consistent across all variants
const MIN_WIDTH = 16;      // ensures circle for 1 digit
const H_PADDING = 5;       // px padding for 2+ digit pills
const BORDER_RADIUS = 999; // full pill

function NotificationBadgeRaw({
  count,
  variant = "inline",
  color = "#EF4444",
  maxCount = 99,
  visible = true,
  className = "",
  easing = "cubic-bezier(0.32, 0.72, 0, 1)",
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const label = count > maxCount ? `${maxCount}+` : `${count}`;
  const isMultiChar = label.length > 1;

  const baseStyle: React.CSSProperties = {
    backgroundColor: color,
    color: "#FFFFFF",
    height: BADGE_HEIGHT,
    minWidth: MIN_WIDTH,
    paddingLeft: isMultiChar ? H_PADDING : 0,
    paddingRight: isMultiChar ? H_PADDING : 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: BORDER_RADIUS,
    fontSize: FONT_SIZE,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.02em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFeatureSettings: "'tnum'",         // tabular numbers
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap" as const,
    boxSizing: "border-box" as const,
    // Ensure perfect circle for single char
    ...(isMultiChar ? {} : { width: BADGE_HEIGHT }),
  };

  if (variant === "dot") {
    return (
      <span
        className={`absolute z-10 pointer-events-none ${className}`}
        style={{
          ...baseStyle,
          top: -2,
          right: -2,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0)",
          transition: `opacity 200ms ${easing}, transform 300ms ${easing}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        }}
      >
        {label}
      </span>
    );
  }

  if (variant === "overlay") {
    return (
      <span
        className={`absolute z-10 pointer-events-none ${className}`}
        style={{
          ...baseStyle,
          top: -3,
          right: -3,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0)",
          transition: `opacity 200ms ${easing}, transform 300ms ${easing}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
        }}
      >
        {label}
      </span>
    );
  }

  // inline variant
  return (
    <span
      className={`shrink-0 ${className}`}
      style={{
        ...baseStyle,
        opacity: visible ? 1 : 0,
        maxWidth: visible ? 48 : 0,
        overflow: "hidden",
        transition: `opacity 300ms ${easing}, max-width 400ms ${easing}`,
        marginLeft: visible ? "auto" : 0,
      }}
    >
      {label}
    </span>
  );
}

export const NotificationBadge = memo(NotificationBadgeRaw);
