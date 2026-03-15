import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-lg border border-border bg-card text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      size: {
        sm: "h-7 px-2.5 py-1 text-xs",
        default: "h-8 px-3 py-1.5 text-sm",
        lg: "h-9 px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  /** Icon rendered inside the left edge of the input */
  startIcon?: React.ReactNode;
  /** Icon rendered inside the right edge of the input (ignored for type="password") */
  endIcon?: React.ReactNode;
  /** Error message displayed below the input; also sets aria-invalid */
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, startIcon, endIcon, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    // Right slot: password toggle overrides endIcon for password fields
    const rightSlot = isPassword ? (
      <button
        type="button"
        tabIndex={-1}
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword((v) => !v)}
        className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    ) : (
      endIcon ?? null
    );

    const hasRight = !!rightSlot;
    const hasLeft = !!startIcon;

    // Icon offset classes keyed by size variant
    const iconOffset = {
      sm: { left: "left-2", right: "right-2", padLeft: "pl-7", padRight: "pr-7" },
      default: { left: "left-2.5", right: "right-2.5", padLeft: "pl-8", padRight: "pr-8" },
      lg: { left: "left-3", right: "right-3", padLeft: "pl-9", padRight: "pr-9" },
    }[size ?? "default"];

    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {hasLeft && (
            <span
              className={cn(
                "pointer-events-none absolute flex items-center text-muted-foreground [&_svg]:h-4 [&_svg]:w-4",
                iconOffset.left
              )}
            >
              {startIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            data-slot="input"
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              inputVariants({ size }),
              error && "border-destructive focus-visible:ring-destructive/40 focus-visible:border-destructive/60",
              hasLeft && iconOffset.padLeft,
              hasRight && iconOffset.padRight,
              className
            )}
            {...props}
          />

          {hasRight && (
            <span
              className={cn(
                "absolute flex items-center text-muted-foreground [&_svg]:h-4 [&_svg]:w-4",
                iconOffset.right
              )}
            >
              {rightSlot}
            </span>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-1.5 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
