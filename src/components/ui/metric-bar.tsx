import * as React from "react";
import { cn } from "@/lib/utils";

interface MetricBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Height in pixels */
  height?: number;
  /** Width in pixels */
  width?: number;
  /** Bar opacity variant */
  variant?: "subtle" | "default" | "strong";
}

const MetricBar = React.forwardRef<HTMLDivElement, MetricBarProps>(
  (
    {
      className,
      height = 100,
      width = 48,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      subtle: {
        background: "rgba(42, 40, 46, 0.6)",
        border: "rgba(255, 255, 255, 0.03)",
      },
      default: {
        background: "rgba(42, 40, 46, 0.8)",
        border: "rgba(255, 255, 255, 0.05)",
      },
      strong: {
        background: "rgba(52, 50, 56, 0.9)",
        border: "rgba(255, 255, 255, 0.07)",
      },
    };

    const currentVariant = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={cn("rounded-xl border transition-all duration-300", className)}
        style={{
          height: `${height}px`,
          width: `${width}px`,
          backgroundColor: currentVariant.background,
          borderColor: currentVariant.border,
          boxShadow: `
            0 4px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.02)
          `,
        }}
        {...props}
      />
    );
  }
);

MetricBar.displayName = "MetricBar";

// Tile variant for stat blocks
interface MetricTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tile opacity variant */
  variant?: "subtle" | "default" | "strong";
  /** Hover effect */
  hoverable?: boolean;
}

const MetricTile = React.forwardRef<HTMLDivElement, MetricTileProps>(
  (
    {
      className,
      children,
      variant = "default",
      hoverable = false,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      subtle: {
        background: "rgba(42, 40, 46, 0.5)",
        border: "rgba(255, 255, 255, 0.03)",
      },
      default: {
        background: "rgba(42, 40, 46, 0.7)",
        border: "rgba(255, 255, 255, 0.05)",
      },
      strong: {
        background: "rgba(52, 50, 56, 0.85)",
        border: "rgba(255, 255, 255, 0.07)",
      },
    };

    const currentVariant = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border p-4 transition-all duration-300",
          hoverable && "hover:-translate-y-0.5 hover:border-white/[0.08]",
          className
        )}
        style={{
          backgroundColor: currentVariant.background,
          borderColor: currentVariant.border,
          boxShadow: `
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.02)
          `,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MetricTile.displayName = "MetricTile";

export { MetricBar, MetricTile };
