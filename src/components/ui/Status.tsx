import React from "react";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "low"
  | "medium"
  | "high"
  | "critical"
  | "resolved"
  | "unresolved"
  | "ready"
  | "blocked"
  | "in-progress";

export interface StatusProps {
  variant: StatusVariant;
  label: string;
  icon?: React.ReactNode;
  showDot?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const getVariantStyles = (variant: StatusVariant): string => {
  switch (variant) {
    case "low":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-900/40";
    case "medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-900/40";
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-900/40";
    case "critical":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-900/40";
    case "resolved":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-900/40";
    case "unresolved":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-900/40";
    case "ready":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-900/40";
    case "blocked":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-900/40";
    case "in-progress":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-900/40";
    case "success":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-900/40";
    case "warning":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-900/40";
    case "error":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-900/40";
    case "info":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-900/40";
    case "neutral":
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-300 dark:border-gray-900/40";
  }
};

const getDotColor = (variant: StatusVariant): string => {
  switch (variant) {
    case "low":
    case "info":
      return "bg-blue-500";
    case "medium":
    case "warning":
    case "in-progress":
      return "bg-yellow-500";
    case "high":
      return "bg-orange-500";
    case "critical":
    case "error":
    case "blocked":
    case "unresolved":
      return "bg-red-500";
    case "resolved":
    case "success":
    case "ready":
      return "bg-green-500";
    case "neutral":
    default:
      return "bg-gray-500";
  }
};

const getSizeClasses = (size: "sm" | "md" | "lg"): string => {
  switch (size) {
    case "sm": return "px-2 py-0.5 text-xs";
    case "lg": return "px-3 py-1.5 text-sm";
    case "md":
    default: return "px-2.5 py-1 text-xs";
  }
};

export default function Status({
  variant,
  label,
  icon,
  showDot = false,
  size = "md",
  className,
}: StatusProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeClasses = getSizeClasses(size);
  const dotColor = getDotColor(variant);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-medium rounded-full border",
        variantStyles,
        sizeClasses,
        className
      )}
    >
      {showDot && <div className={cn("w-2 h-2 rounded-full", dotColor)} />}
      {icon}
      {label}
    </span>
  );
}
