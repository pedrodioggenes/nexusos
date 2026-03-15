import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const kbdVariants = cva(
  "inline-flex items-center justify-center rounded border font-mono text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "border-border bg-muted text-muted-foreground shadow-[0_2px_0_0] shadow-border",
        outline: "border-border bg-transparent text-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground",
      },
      size: {
        sm: "h-5 min-w-5 px-1",
        default: "h-6 min-w-6 px-1.5",
        lg: "h-7 min-w-7 px-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        data-slot="kbd"
        className={cn(kbdVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Kbd.displayName = "Kbd";

export { Kbd, kbdVariants };
