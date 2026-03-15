import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";

interface DataMetricProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  size?: "sm" | "md" | "lg" | "xl";
  color?: "default" | "primary" | "accent" | "success" | "warning";
  animate?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { value: "text-2xl", label: "text-xs", icon: 16 },
  md: { value: "text-3xl", label: "text-sm", icon: 20 },
  lg: { value: "text-4xl", label: "text-sm", icon: 24 },
  xl: { value: "text-5xl", label: "text-base", icon: 28 },
};

const colorStyles = {
  default: "text-foreground",
  primary: "text-primary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
};

function useCountAnimation(end: number, duration: number = 1500, animate: boolean = true) {
  const [count, setCount] = useState(animate ? 0 : end);
  const countRef = useRef(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!animate || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const startValue = 0;

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quart
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut);
      
      setCount(currentValue);
      countRef.current = currentValue;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, duration, animate]);

  return count;
}

export function DataMetric({
  label,
  value,
  prefix = "",
  suffix = "",
  icon: Icon,
  trend,
  size = "md",
  color = "default",
  animate = true,
  className,
}: DataMetricProps) {
  const styles = sizeStyles[size];
  const displayValue = useCountAnimation(value, 1500, animate);

  const formattedValue = displayValue.toLocaleString("pt-BR");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("space-y-1", className)}
    >
      {/* Label with optional icon */}
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon 
            size={styles.icon} 
            className="text-muted-foreground" 
            strokeWidth={1.5} 
          />
        )}
        <span className={cn(styles.label, "text-muted-foreground font-medium uppercase tracking-wider")}>
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className={cn(
          styles.value, 
          colorStyles[color],
          "font-semibold tracking-tight tabular-nums"
        )}>
          {prefix}{formattedValue}{suffix}
        </span>

        {/* Trend indicator */}
        {trend && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

// Compact inline version
interface DataMetricInlineProps {
  label: string;
  value: string | number;
  className?: string;
}

export function DataMetricInline({ label, value, className }: DataMetricInlineProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
