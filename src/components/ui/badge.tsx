import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default select-none",
  {
    variants: {
      variant: {
        // ── Original variants (unchanged) ──────────────────────────────
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:shadow-sm hover:shadow-primary/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:shadow-sm hover:shadow-destructive/20",
        outline: "text-foreground hover:bg-secondary/50 hover:border-border/80",

        // ── Semantic variants — use NexusOS CSS vars ────────────────────
        success:
          "border-transparent bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.25)] hover:shadow-sm",
        warning:
          "border-transparent bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] hover:bg-[hsl(var(--warning)/0.25)] hover:shadow-sm",
        error:
          "border-transparent bg-[hsl(var(--destructive)/0.15)] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.25)] hover:shadow-sm",
      },
      size: {
        sm: "px-2 py-px text-[10px]",
        md: "px-2 py-px text-[11px]",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
