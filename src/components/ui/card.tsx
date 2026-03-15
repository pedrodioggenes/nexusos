import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────
// Glass Morphism configuration
// ─────────────────────────────────────────────────
type GlassIntensity = "light" | "medium" | "strong";

interface GlassPreset {
  blur: number;        // px
  opacity: number;     // background opacity multiplier
  saturation: number;
  brightness: number;
  borderOpacity: number;
  shadowIntensity: number;
}

const GLASS_PRESETS: Record<GlassIntensity, GlassPreset> = {
  light: {
    blur: 8,
    brightness: 1.05,
    opacity: 0.07,
    saturation: 1.2,
    borderOpacity: 0.12,
    shadowIntensity: 0.12,
  },
  medium: {
    blur: 12,
    brightness: 1.08,
    opacity: 0.1,
    saturation: 1.4,
    borderOpacity: 0.18,
    shadowIntensity: 0.18,
  },
  strong: {
    blur: 20,
    brightness: 1.12,
    opacity: 0.14,
    saturation: 1.6,
    borderOpacity: 0.25,
    shadowIntensity: 0.25,
  },
};

// ─────────────────────────────────────────────────
// Card props
// ─────────────────────────────────────────────────
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable glass morphism.
   * - `true` / `"medium"` → medium intensity
   * - `"light"` → subtle blur (8 px)
   * - `"strong"` → heavy blur (20 px)
   */
  glass?: boolean | GlassIntensity;
}

function resolveGlassIntensity(glass: boolean | GlassIntensity): GlassIntensity {
  if (glass === true) return "medium";
  if (glass === false) return "medium"; // won't be called when false
  return glass;
}

function buildGlassStyle(intensity: GlassIntensity): React.CSSProperties {
  const p = GLASS_PRESETS[intensity];
  return {
    // Semi-transparent surface using the NexusOS --card variable
    background: `hsl(var(--card) / ${p.opacity})`,
    backdropFilter: `blur(${p.blur}px) saturate(${p.saturation}) brightness(${p.brightness})`,
    WebkitBackdropFilter: `blur(${p.blur}px) saturate(${p.saturation}) brightness(${p.brightness})`,
    border: `1px solid hsl(var(--border) / ${p.borderOpacity + 0.4})`,
    boxShadow: [
      `0 0 0 1px hsl(var(--border) / ${p.borderOpacity}) inset`,
      `0 4px 16px rgba(0, 0, 0, ${p.shadowIntensity})`,
      `0 8px 32px rgba(0, 0, 0, ${p.shadowIntensity * 0.6})`,
    ].join(", "),
  };
}

// ─────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, style, children, ...props }, ref) => {
    const isGlass = glass !== undefined && glass !== false;
    const intensity = isGlass ? resolveGlassIntensity(glass as boolean | GlassIntensity) : null;
    const glassStyle = intensity ? buildGlassStyle(intensity) : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-card text-card-foreground",
          // Premium transitions + hover effects
          "transition-all duration-200",
          "hover:border-white/10 hover:shadow-lg hover:shadow-black/20",
          // When glass is active the inline style overrides bg/border; keep the class for
          // browsers that don't support backdrop-filter (the @supports fallback keeps the
          // solid card background visible)
          isGlass && "relative overflow-hidden backdrop-blur-md",
          className
        )}
        style={{
          ...(glassStyle ?? {}),
          ...style,
        }}
        {...props}
      >
        {/* Top-edge highlight only for glass cards */}
        {isGlass && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.08), transparent)`,
            }}
          />
        )}
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// ─────────────────────────────────────────────────
// Sub-components — unchanged
// ─────────────────────────────────────────────────
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1 p-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-sm font-semibold leading-none tracking-tight text-foreground", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
