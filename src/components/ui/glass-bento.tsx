import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassBentoCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
  glowColor?: string;
  onClick?: () => void;
}

/**
 * Premium Glass Card with Bento Grid styling
 * Aceternity/Magic UI inspired glassmorphism
 */
const GlassBentoCard: React.FC<GlassBentoCardProps> = ({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  glowColor,
  onClick,
}) => {
  const colSpanClass = {
    1: "",
    2: "md:col-span-2",
  }[colSpan];

  const rowSpanClass = {
    1: "",
    2: "row-span-2",
  }[rowSpan];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "group relative rounded-2xl overflow-hidden",
        // Glassmorphism - Light mode
        "bg-white/70 dark:bg-black/20",
        "backdrop-blur-xl backdrop-saturate-150",
        // Border with gradient
        "border border-white/30 dark:border-white/10",
        // Shadow
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        // Hover state
        "transition-all duration-300",
        "hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)]",
        "hover:border-white/50 dark:hover:border-white/20",
        onClick && "cursor-pointer",
        colSpanClass,
        rowSpanClass,
        className
      )}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/5 pointer-events-none" />

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>

      {/* Glow effect */}
      {glowColor && (
        <div
          className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

// Glass card content wrapper
interface GlassBentoContentProps {
  children: React.ReactNode;
  className?: string;
}

const GlassBentoContent: React.FC<GlassBentoContentProps> = ({
  children,
  className,
}) => {
  return <div className={cn("p-4 md:p-5", className)}>{children}</div>;
};

// Glass card header
interface GlassBentoHeaderProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const GlassBentoHeader: React.FC<GlassBentoHeaderProps> = ({
  children,
  className,
  icon,
  action,
}) => {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-9 w-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center backdrop-blur-sm">
            {icon}
          </div>
        )}
        <div>{children}</div>
      </div>
      {action}
    </div>
  );
};

// Glass card title
interface GlassBentoTitleProps {
  children: React.ReactNode;
  className?: string;
}

const GlassBentoTitle: React.FC<GlassBentoTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h3
      className={cn(
        "text-sm font-semibold text-foreground/90",
        className
      )}
    >
      {children}
    </h3>
  );
};

// Glass card description
interface GlassBentoDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const GlassBentoDescription: React.FC<GlassBentoDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>{children}</p>
  );
};

export {
  GlassBentoCard,
  GlassBentoContent,
  GlassBentoHeader,
  GlassBentoTitle,
  GlassBentoDescription,
};
