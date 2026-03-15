import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const shimmerButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ShimmerButtonProps extends VariantProps<typeof shimmerButtonVariants> {
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      children,
      className,
      shimmerColor = "hsl(var(--primary))",
      shimmerSize = "0.1em",
      shimmerDuration = "2s",
      variant,
      size,
      disabled,
      type = "button",
      onClick,
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        data-slot="shimmer-button"
        className={cn(shimmerButtonVariants({ variant, size }), className)}
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
          } as React.CSSProperties
        }
      >
        {/* Shimmer effect overlay */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden rounded-xl",
            disabled && "hidden"
          )}
        >
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: `linear-gradient(
                90deg,
                transparent 0%,
                var(--shimmer-color) 50%,
                transparent 100%
              )`,
              backgroundSize: "200% 100%",
              opacity: 0.15,
            }}
          />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-primary/20 pointer-events-none" />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton, shimmerButtonVariants };
