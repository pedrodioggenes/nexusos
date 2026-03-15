import * as React from "react";
import { cn } from "@/lib/utils";

interface NeutralBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Height of the bar */
  height?: number | string;
  /** Width of the bar */
  width?: number | string;
  /** Opacity variant */
  variant?: "subtle" | "default" | "strong";
  /** Whether to show on hover effect */
  hoverable?: boolean;
}

const NeutralBar = React.forwardRef<HTMLDivElement, NeutralBarProps>(
  (
    {
      className,
      height = 160,
      width = 48,
      variant = "default",
      hoverable = false,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl border transition-all duration-300",
          // Theme-aware variants
          variant === "subtle" && "bg-muted/30 border-border/40",
          variant === "default" && "bg-muted/50 border-border/60",
          variant === "strong" && "bg-muted/70 border-border/80",
          // Shadow
          "shadow-[0_4px_16px_hsl(var(--background)/0.2),inset_0_1px_0_hsl(var(--foreground)/0.02)]",
          hoverable && "hover:bg-muted/70 hover:border-border",
          className
        )}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          width: typeof width === "number" ? `${width}px` : width,
          ...style,
        }}
        {...props}
      />
    );
  }
);

NeutralBar.displayName = "NeutralBar";

// Tile variant for larger neutral areas
interface NeutralTileProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "subtle" | "default" | "strong";
  hoverable?: boolean;
}

const NeutralTile = React.forwardRef<HTMLDivElement, NeutralTileProps>(
  (
    { className, children, variant = "default", hoverable = false, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl border p-4 transition-all duration-300",
          // Theme-aware variants
          variant === "subtle" && "bg-muted/20 border-border/40",
          variant === "default" && "bg-muted/40 border-border/60",
          variant === "strong" && "bg-muted/60 border-border/80",
          // Shadow
          "shadow-[0_4px_16px_hsl(var(--background)/0.15),inset_0_1px_0_hsl(var(--foreground)/0.02)]",
          hoverable && "hover:bg-muted/60 hover:border-border",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeutralTile.displayName = "NeutralTile";

export { NeutralBar, NeutralTile };