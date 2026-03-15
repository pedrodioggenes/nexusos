import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  glowColor?: "primary" | "accent" | "module-ia" | "aurora" | "aurora-soft" | "aurora-minimal" | "portal";
  variant?: "default" | "aurora" | "aurora-soft" | "aurora-minimal" | "portal";
}

const glowMap = {
  primary: "hsl(357 76% 45% / 0.3)",
  accent: "hsl(45 99% 62% / 0.3)",
  "module-ia": "hsl(280 70% 55% / 0.3)",
  aurora: "hsl(44 75% 56% / 0.4)",
  "aurora-soft": "transparent",
  "aurora-minimal": "transparent",
  portal: "transparent",
};

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, glowColor = "accent", variant = "default", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const isAurora = variant === "aurora";
    const isAuroraSoft = variant === "aurora-soft";
    const isAuroraMinimal = variant === "aurora-minimal";
    const isPortal = variant === "portal";
    const effectiveGlow = isPortal ? "portal" : isAurora ? "aurora" : (isAuroraSoft || isAuroraMinimal) ? "aurora-minimal" : glowColor;

    return (
      <motion.div
        className="relative"
      animate={{
          boxShadow: isFocused 
            ? isPortal
              ? "0 0 0 2px rgba(255, 255, 255, 0.08)"
              : (isAuroraSoft || isAuroraMinimal)
              ? "0 0 0 2px hsl(44 50% 55% / 0.15)" 
              : `0 0 30px -10px ${glowMap[effectiveGlow]}`
            : "0 0 0 0 transparent",
        }}
        transition={{ duration: 0.3 }}
        style={{ borderRadius: "0.75rem" }}
      >
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border px-4 py-2 text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none",
            "transition-all duration-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isPortal
              ? "input-portal"
              : isAurora 
              ? "border-transparent aurora-border focus:border-[hsl(var(--aurora3-highlight-1)/0.5)] bg-secondary/50"
              : isAuroraSoft
              ? "aurora-input-soft text-[hsl(44_50%_65%)] placeholder:text-[hsl(44_30%_50%/0.6)]"
              : isAuroraMinimal
              ? "aurora-input-minimal text-white/80 placeholder:text-white/40"
              : "border-border focus:border-muted-foreground/40 bg-secondary/50",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </motion.div>
    );
  }
);

PremiumInput.displayName = "PremiumInput";

// Premium Textarea variant
interface PremiumTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  glowColor?: "primary" | "accent" | "module-ia";
}

export const PremiumTextarea = forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ className, glowColor = "module-ia", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <motion.div
        className="relative"
        animate={{
          boxShadow: isFocused ? `0 0 30px -10px ${glowMap[glowColor]}` : "0 0 0 0 transparent",
        }}
        transition={{ duration: 0.3 }}
        style={{ borderRadius: "1rem" }}
      >
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:border-muted-foreground/40",
            "transition-colors duration-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </motion.div>
    );
  }
);

PremiumTextarea.displayName = "PremiumTextarea";
