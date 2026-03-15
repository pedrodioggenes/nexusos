import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
  label?: React.ReactNode;
  children?: React.ReactNode;
}

const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      value,
      size = 48,
      strokeWidth = 4,
      className,
      trackClassName,
      indicatorClassName,
      showLabel = false,
      label,
      children,
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div
        ref={ref}
        data-slot="progress-ring"
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
      >
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Track */}
          <circle
            data-slot="progress-ring-track"
            className={cn("text-secondary", trackClassName)}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
          {/* Indicator */}
          <motion.circle
            data-slot="progress-ring-indicator"
            className={cn("text-primary", indicatorClassName)}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (showLabel && (
            <span
              data-slot="progress-ring-label"
              className="text-sm font-medium"
            >
              {label ?? `${Math.round(value)}%`}
            </span>
          ))}
        </div>
      </div>
    );
  }
);
ProgressRing.displayName = "ProgressRing";

export { ProgressRing };
