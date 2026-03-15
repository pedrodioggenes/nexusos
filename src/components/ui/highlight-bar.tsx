import * as React from "react";
import { cn } from "@/lib/utils";

interface HighlightBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Height of the bar */
  height?: number | string;
  /** Width of the bar */
  width?: number | string;
  /** Whether to show glow effect */
  withGlow?: boolean;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Gradient direction */
  direction?: "vertical" | "horizontal";
  /** Animation on hover */
  animated?: boolean;
}

const HighlightBar = React.forwardRef<HTMLDivElement, HighlightBarProps>(
  (
    {
      className,
      height = 200,
      width = 48,
      withGlow = true,
      glowIntensity = 0.4,
      direction = "vertical",
      animated = false,
      style,
      ...props
    },
    ref
  ) => {
    const gradientDirection = direction === "vertical" ? "180deg" : "90deg";

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          animated && "hover:scale-[1.02]",
          className
        )}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          width: typeof width === "number" ? `${width}px` : width,
          background: `linear-gradient(${gradientDirection}, 
            hsl(var(--aurora-highlight-1)) 0%, 
            hsl(var(--aurora-highlight-2)) 35%, 
            hsl(var(--aurora-highlight-3)) 65%, 
            hsl(var(--aurora-highlight-4)) 100%
          )`,
          boxShadow: withGlow
            ? `
              0 0 60px -20px hsl(var(--aurora-highlight-1) / ${glowIntensity}),
              0 0 40px -10px hsl(var(--aurora-highlight-2) / ${glowIntensity * 0.75}),
              0 0 80px -30px hsl(var(--aurora-highlight-3) / ${glowIntensity * 0.5})
            `
            : "none",
          ...style,
        }}
        {...props}
      />
    );
  }
);

HighlightBar.displayName = "HighlightBar";

// Pill variant for smaller highlights
interface HighlightPillProps extends React.HTMLAttributes<HTMLDivElement> {
  withGlow?: boolean;
}

const HighlightPill = React.forwardRef<HTMLDivElement, HighlightPillProps>(
  ({ className, children, withGlow = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium text-white transition-all duration-300 hover:scale-105",
          className
        )}
        style={{
          background: `linear-gradient(135deg, 
            hsl(var(--aurora-highlight-1)) 0%, 
            hsl(var(--aurora-highlight-2)) 50%, 
            hsl(var(--aurora-highlight-3)) 100%
          )`,
          boxShadow: withGlow
            ? `
              0 0 30px -10px hsl(var(--aurora-highlight-1) / 0.5),
              0 4px 12px -4px hsl(var(--aurora-highlight-2) / 0.3)
            `
            : "none",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HighlightPill.displayName = "HighlightPill";

export { HighlightBar, HighlightPill };
