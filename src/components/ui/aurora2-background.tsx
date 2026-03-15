import * as React from "react";
import { cn } from "@/lib/utils";

interface Aurora2BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show noise texture overlay */
  withNoise?: boolean;
  /** Noise opacity (0-1) */
  noiseOpacity?: number;
  /** Show vignette effect */
  withVignette?: boolean;
  /** Show spotlight effect */
  withSpotlight?: boolean;
}

const Aurora2Background = React.forwardRef<HTMLDivElement, Aurora2BackgroundProps>(
  (
    {
      className,
      children,
      withNoise = true,
      noiseOpacity = 0.04,
      withVignette = true,
      withSpotlight = true,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("relative min-h-screen w-full overflow-hidden", className)}
        style={{
          backgroundColor: "hsl(var(--aurora2-base))",
        }}
        {...props}
      >
        {/* Aurora 2 mesh gradient layer - cool/masculine tones */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, hsl(var(--aurora2-deep-blue) / 0.7) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 80% 20%, hsl(var(--aurora2-slate) / 0.5) 0%, transparent 45%),
              radial-gradient(ellipse 60% 70% at 70% 80%, hsl(var(--aurora2-steel) / 0.5) 0%, transparent 50%),
              radial-gradient(ellipse 50% 40% at 30% 70%, hsl(var(--aurora2-charcoal) / 0.6) 0%, transparent 40%)
            `,
          }}
        />

        {/* Spotlight effect - subtle blue glow */}
        {withSpotlight && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 50% 35% at 50% 40%, 
                  hsl(var(--aurora2-deep-blue) / 0.12) 0%, 
                  transparent 60%
                )
              `,
            }}
          />
        )}

        {/* Vignette overlay */}
        {withVignette && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 70% 60% at 50% 50%, 
                  transparent 30%, 
                  hsl(var(--aurora2-base) / 0.5) 70%,
                  hsl(var(--aurora2-base) / 0.9) 100%
                )
              `,
            }}
          />
        )}

        {/* Noise texture overlay */}
        {withNoise && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: noiseOpacity,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              mixBlendMode: "overlay",
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

Aurora2Background.displayName = "Aurora2Background";

export { Aurora2Background };
