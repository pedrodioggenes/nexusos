import * as React from "react";
import { cn } from "@/lib/utils";

interface AccentBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Height in pixels */
  height?: number;
  /** Width in pixels */
  width?: number;
  /** Enable glow effect */
  withGlow?: boolean;
  /** Animate the glow */
  animated?: boolean;
}

const AccentBar = React.forwardRef<HTMLDivElement, AccentBarProps>(
  (
    {
      className,
      height = 160,
      width = 56,
      withGlow = true,
      animated = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-300",
          animated && "animate-pulse",
          className
        )}
        style={{
          height: `${height}px`,
          width: `${width}px`,
          background: `linear-gradient(180deg, 
            hsl(var(--aurora2-highlight-1)) 0%, 
            hsl(var(--aurora2-highlight-2)) 35%, 
            hsl(var(--aurora2-highlight-3)) 70%, 
            hsl(var(--aurora2-highlight-4)) 100%
          )`,
          boxShadow: withGlow
            ? `
              0 0 60px -20px hsl(var(--aurora2-highlight-1) / 0.4),
              0 0 40px -10px hsl(var(--aurora2-highlight-2) / 0.3),
              0 0 20px -5px hsl(var(--aurora2-highlight-1) / 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.15)
            `
            : `
              0 4px 12px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
        }}
        {...props}
      />
    );
  }
);

AccentBar.displayName = "AccentBar";

// Pill variant for labels/tags
interface AccentPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Enable glow effect */
  withGlow?: boolean;
}

const AccentPill = React.forwardRef<HTMLSpanElement, AccentPillProps>(
  ({ className, children, withGlow = false, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium text-white/90",
          className
        )}
        style={{
          background: `linear-gradient(90deg, 
            hsl(var(--aurora2-highlight-1)) 0%, 
            hsl(var(--aurora2-highlight-2)) 50%, 
            hsl(var(--aurora2-highlight-3)) 100%
          )`,
          boxShadow: withGlow
            ? `
              0 0 30px -10px hsl(var(--aurora2-highlight-1) / 0.5),
              0 0 20px -5px hsl(var(--aurora2-highlight-2) / 0.3)
            `
            : "0 2px 8px rgba(0, 0, 0, 0.2)",
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

AccentPill.displayName = "AccentPill";

export { AccentBar, AccentPill };
