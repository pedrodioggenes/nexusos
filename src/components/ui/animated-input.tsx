import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "default" | "glow" | "underline";
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, label, error, variant = "default", type, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const variantStyles = {
      default: cn(
        "border border-border bg-card",
        "focus:border-primary focus:ring-2 focus:ring-primary/20"
      ),
      glow: cn(
        "border border-border bg-card/50 backdrop-blur-sm",
        "focus:border-primary",
        isFocused && "shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
      ),
      underline: cn(
        "border-0 border-b-2 border-border bg-transparent rounded-none",
        "focus:border-primary",
        "px-0"
      ),
    };

    return (
      <div className="relative w-full">
        {/* Floating label */}
        {label && (
          <motion.label
            initial={false}
            animate={{
              y: isFocused || hasValue ? -24 : 0,
              scale: isFocused || hasValue ? 0.85 : 1,
              x: isFocused || hasValue ? -4 : 0,
              color: isFocused
                ? "hsl(var(--primary))"
                : error
                ? "hsl(var(--destructive))"
                : "hsl(var(--muted-foreground))",
            }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              "text-sm pointer-events-none origin-left",
              "transition-colors duration-200",
              variant === "underline" && "left-0"
            )}
          >
            {label}
          </motion.label>
        )}

        {/* Input with animated border */}
        <div className="relative">
          <input
            ref={ref}
            type={type}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={cn(
              "flex h-11 w-full rounded-xl px-4 py-2",
              "text-foreground text-sm",
              "placeholder:text-transparent",
              "transition-all duration-200",
              "outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              variantStyles[variant],
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              className
            )}
            {...props}
          />

          {/* Animated focus indicator for glow variant */}
          {variant === "glow" && (
            <motion.div
              initial={false}
              animate={{
                opacity: isFocused ? 1 : 0,
                scale: isFocused ? 1 : 0.95,
              }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)`,
              }}
            />
          )}

          {/* Underline animation */}
          {variant === "underline" && (
            <motion.div
              initial={false}
              animate={{
                scaleX: isFocused ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-center"
            />
          )}
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);
AnimatedInput.displayName = "AnimatedInput";

export { AnimatedInput };
