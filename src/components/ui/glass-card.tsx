import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  /** Glass opacity variant */
  variant?: "subtle" | "default" | "strong";
  /** Whether to show inner gradient */
  withGradient?: boolean;
  /** Hover effect */
  hoverable?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      children,
      variant = "default",
      withGradient = false,
      hoverable = false,
      onClick,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        onClick={onClick}
        data-slot="glass-card"
        whileHover={hoverable ? { y: -4, scale: 1.01 } : undefined}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative rounded-3xl border backdrop-blur-xl transition-all duration-300",
          // Theme-aware variants
          variant === "subtle" && "bg-card/30 border-border/40",
          variant === "default" && "bg-card/50 border-border/60",
          variant === "strong" && "bg-card/70 border-border/80",
          // Shadow
          "shadow-[0_8px_32px_hsl(var(--background)/0.3),0_4px_16px_hsl(var(--background)/0.2),inset_0_1px_0_hsl(var(--foreground)/0.05)]",
          hoverable && "cursor-pointer",
          className
        )}
      >
        {/* Optional inner gradient */}
        {withGradient && (
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `linear-gradient(180deg, 
                hsl(var(--foreground) / 0.03) 0%, 
                transparent 40%
              )`,
            }}
          />
        )}

        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

// Composable parts
const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="glass-card-header"
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
));
GlassCardHeader.displayName = "GlassCardHeader";

const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="glass-card-title"
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
GlassCardTitle.displayName = "GlassCardTitle";

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="glass-card-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
GlassCardDescription.displayName = "GlassCardDescription";

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="glass-card-content"
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="glass-card-footer"
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
GlassCardFooter.displayName = "GlassCardFooter";

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
};
