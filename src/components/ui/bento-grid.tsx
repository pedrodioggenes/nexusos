import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

const BentoGrid: React.FC<BentoGridProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(180px,_auto)]",
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoGridItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
  gradient?: boolean;
  glowColor?: string;
}

const BentoGridItem: React.FC<BentoGridItemProps> = ({
  className,
  children,
  colSpan = 1,
  rowSpan = 1,
  gradient = false,
  glowColor,
}) => {
  const colSpanClass = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3 lg:col-span-3",
  }[colSpan];

  const rowSpanClass = {
    1: "row-span-1",
    2: "row-span-2",
  }[rowSpan];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "group relative rounded-2xl overflow-hidden",
        "bg-card/60 dark:bg-card/40",
        "backdrop-blur-xl",
        "border border-border/50 dark:border-white/10",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40",
        "hover:border-border dark:hover:border-white/20",
        colSpanClass,
        rowSpanClass,
        className
      )}
      style={glowColor ? {
        '--glow-color': glowColor,
      } as React.CSSProperties : undefined}
    >
      {/* Gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      )}
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Glow effect */}
      {glowColor && (
        <div 
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${glowColor}20, transparent 70%)` }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

export { BentoGrid, BentoGridItem };
