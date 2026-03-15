import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShineBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
}

const sizeStyles: Record<string, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

const variantStyles: Record<string, string> = {
  default: "bg-gradient-to-r from-foreground to-muted-foreground text-background border border-border",
  outline: "bg-transparent border-2 border-border text-foreground",
  secondary: "bg-gradient-to-r from-secondary to-secondary/80 text-foreground border border-border",
};

const shineKeyframes = `
@keyframes shine {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(300%) skewX(-12deg); }
}
.shine-badge-anim {
  animation: shine 3s ease-in-out infinite;
}
`;

export function ShineBadge({
  children,
  className,
  variant = "default",
  size = "md",
}: ShineBadgeProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shineKeyframes }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full font-medium",
          "overflow-hidden group cursor-default",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
      >
        <div
          className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent
                      transform -skew-x-12 shine-badge-anim"
        />
        <span className="relative z-10">{children}</span>
      </motion.div>
    </>
  );
}
