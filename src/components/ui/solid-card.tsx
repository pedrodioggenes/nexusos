import * as React from "react";
import { cn } from "@/lib/utils";

interface SolidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card opacity variant */
  variant?: "subtle" | "default" | "strong";
  /** Whether to show inner gradient */
  withGradient?: boolean;
  /** Hover effect */
  hoverable?: boolean;
  /** Classes to apply to the inner content wrapper (for flex propagation) */
  contentClassName?: string;
}

const SolidCard = React.forwardRef<HTMLDivElement, SolidCardProps>(
  (
    {
      className,
      children,
      variant = "default",
      withGradient = false,
      hoverable = false,
      contentClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-3xl border overflow-hidden transition-all duration-300",
          // Theme-aware variants using semantic tokens
          variant === "subtle" && "bg-card/85 border-border/60",
          variant === "default" && "bg-card border-border",
          variant === "strong" && "bg-card-elevated border-border",
          // Inset shadow for depth
          "shadow-[inset_0_1px_3px_hsl(var(--background)/0.25),inset_0_0_0_1px_hsl(var(--background)/0.08)]",
          hoverable && "hover:border-border/80",
          className
        )}
        style={{ isolation: 'isolate' }}
        {...props}
      >
        {/* Optional inner gradient - subtle top highlight */}
        {withGradient && (
          <div
            className="absolute inset-0 rounded-[inherit] pointer-events-none"
            style={{
              background: `linear-gradient(180deg, 
                hsl(var(--foreground) / 0.02) 0%, 
                transparent 40%
              )`,
            }}
          />
        )}
        
        <div className={cn("relative z-10", contentClassName || "h-full")}>{children}</div>
      </div>
    );
  }
);

SolidCard.displayName = "SolidCard";

// Composable parts
const SolidCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
));
SolidCardHeader.displayName = "SolidCardHeader";

const SolidCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
SolidCardTitle.displayName = "SolidCardTitle";

const SolidCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SolidCardDescription.displayName = "SolidCardDescription";

const SolidCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
SolidCardContent.displayName = "SolidCardContent";

const SolidCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
SolidCardFooter.displayName = "SolidCardFooter";

export {
  SolidCard,
  SolidCardHeader,
  SolidCardTitle,
  SolidCardDescription,
  SolidCardContent,
  SolidCardFooter,
};