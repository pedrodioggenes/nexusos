import * as React from "react";
import { cn } from "@/lib/utils";

interface PremiumBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "aurora" | "dots" | "grid" | "gradient" | "subtle";
}

/**
 * Premium Background component with multiple variants
 * Aceternity/Magic UI inspired backgrounds
 */
const PremiumBackground: React.FC<PremiumBackgroundProps> = ({
  children,
  className,
  variant = "subtle",
}) => {
  return (
    <div className={cn("relative min-h-full w-full", className)}>
      {/* Background layers based on variant */}
      {variant === "aurora" && <AuroraLayer />}
      {variant === "dots" && <DotsLayer />}
      {variant === "grid" && <GridLayer />}
      {variant === "gradient" && <GradientLayer />}
      {variant === "subtle" && <SubtleLayer />}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Aurora effect layer
const AuroraLayer: React.FC = () => (
  <>
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.15), transparent),
          radial-gradient(ellipse 60% 40% at 20% 100%, hsl(var(--accent) / 0.1), transparent),
          radial-gradient(ellipse 50% 60% at 80% 80%, hsl(var(--primary) / 0.08), transparent)
        `,
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
  </>
);

// Dots pattern layer
const DotsLayer: React.FC = () => {
  const id = React.useId();
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={id}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle
            cx="1"
            cy="1"
            r="1"
            className="fill-muted-foreground/20 dark:fill-muted-foreground/10"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

// Grid pattern layer
const GridLayer: React.FC = () => {
  const id = React.useId();
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={id}
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            className="stroke-muted-foreground/10 dark:stroke-muted-foreground/5"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

// Gradient flow layer
const GradientLayer: React.FC = () => (
  <div
    className="absolute inset-0 pointer-events-none animate-gradient-flow"
    style={{
      background: `linear-gradient(
        -45deg,
        hsl(var(--background)) 0%,
        hsl(var(--primary) / 0.05) 25%,
        hsl(var(--accent) / 0.05) 50%,
        hsl(var(--primary) / 0.03) 75%,
        hsl(var(--background)) 100%
      )`,
      backgroundSize: "400% 400%",
    }}
  />
);

// Subtle texture layer (default)
const SubtleLayer: React.FC = () => (
  <>
    {/* Subtle radial gradient */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 100% 100% at 50% 0%, hsl(var(--muted) / 0.3), transparent 50%),
          radial-gradient(ellipse 80% 80% at 100% 100%, hsl(var(--muted) / 0.15), transparent 50%)
        `,
      }}
    />
    {/* Noise texture */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.02]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
      }}
    />
  </>
);

export { PremiumBackground };
