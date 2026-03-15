import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 relative overflow-hidden select-none active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-secondary text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary text-muted-foreground hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        // Aurora gradient variants - Vibrantes
        aurora: "aurora-gradient text-black font-semibold hover:brightness-110 active:brightness-95",
        "aurora-outline": "border-2 border-transparent aurora-border text-white hover:aurora-gradient hover:text-black",
        // Aurora Soft variants - Apple-like with depth
        "aurora-soft": "aurora-btn-soft text-[hsl(44_50%_65%)] transition-all duration-200",
        "aurora-subtle": "aurora-btn-subtle text-[hsl(44_50%_65%)] transition-all duration-200",
        // Portal variant - Matching module portal aesthetic
        portal: "btn-portal font-medium rounded-lg transition-all duration-200",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-9 rounded-lg px-4",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Ripple CSS injected once into <head>
const RIPPLE_STYLE = `
.nx-btn-ripple-wrap {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.nx-btn-ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: nx-ripple 550ms ease-out forwards;
  background-color: var(--nx-ripple-color, rgba(255, 255, 255, 0.22));
}
@keyframes nx-ripple {
  0%   { transform: scale(0); opacity: 0.55; }
  60%  { opacity: 0.2; }
  100% { transform: scale(4); opacity: 0; }
}
`;

let rippleStyleInjected = false;
function ensureRippleStyle() {
  if (rippleStyleInjected) return;
  const el = document.createElement("style");
  el.dataset.nexusRipple = "1";
  el.textContent = RIPPLE_STYLE;
  document.head.appendChild(el);
  rippleStyleInjected = true;
}

// Spinner component (pure SVG, no extra deps)
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows spinner and optionally replaces label. Disables the button. */
  loading?: boolean;
  /** Text shown instead of children while loading */
  loadingText?: string;
  /** Icon rendered before the label */
  startIcon?: React.ReactNode;
  /** Icon rendered after the label */
  endIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      startIcon,
      endIcon,
      onClick,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Inject ripple styles once on first render
    React.useEffect(() => {
      ensureRippleStyle();
    }, []);

    // Ripple click handler
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;

        let wrap = button.querySelector<HTMLSpanElement>(".nx-btn-ripple-wrap");
        if (!wrap) {
          wrap = document.createElement("span");
          wrap.className = "nx-btn-ripple-wrap";
          wrap.setAttribute("aria-hidden", "true");
          button.prepend(wrap);
        }

        const ripple = document.createElement("span");
        const rect = button.getBoundingClientRect();
        const diameter = Math.max(rect.width, rect.height) * 2;
        const x = event.clientX - rect.left - diameter / 2;
        const y = event.clientY - rect.top - diameter / 2;

        // Pick ripple color based on variant
        let rippleColor = "rgba(255,255,255,0.22)";
        if (variant === "accent") {
          rippleColor = "rgba(0,0,0,0.12)";
        } else if (variant === "outline" || variant === "ghost" || variant === "secondary") {
          rippleColor = "rgba(255,255,255,0.10)";
        } else if (variant === "link") {
          rippleColor = "rgba(255,255,255,0.08)";
        }

        ripple.className = "nx-btn-ripple";
        ripple.style.setProperty("--nx-ripple-color", rippleColor);
        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        wrap.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);

        onClick?.(event);
      },
      [onClick, variant]
    );

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    const isDisabled = loading || disabled;
    const label = loading && loadingText ? loadingText : children;

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading ? "true" : undefined}
        aria-disabled={isDisabled ? "true" : undefined}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple layer (prepended via JS, but keep placeholder so overflow:hidden works) */}
        <span className="nx-btn-ripple-wrap" aria-hidden="true" />

        {/* Content layer above ripple */}
        <span className="relative z-[1] inline-flex items-center gap-2">
          {loading ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            startIcon && <span className="inline-flex shrink-0">{startIcon}</span>
          )}

          {label}

          {!loading && endIcon && (
            <span className="inline-flex shrink-0">{endIcon}</span>
          )}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
