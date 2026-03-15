import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SparklineData {
  value: number;
}

interface StatCardWithSparklineProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  sparklineData?: SparklineData[];
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

function MiniSparkline({ data }: { data: SparklineData[] }) {
  if (!data || data.length < 2) return null;
  
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  
  const height = 24;
  const width = 60;
  const padding = 2;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg width={width} height={height} className="text-module-gestao opacity-60">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function StatCardWithSparkline({
  title,
  value,
  change,
  changeType = "positive",
  icon,
  sparklineData,
  isLoading = false,
  onClick,
  className,
}: StatCardWithSparklineProps) {
  const isPositive = changeType === "positive";
  const isNegative = changeType === "negative";
  
  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl border border-border bg-card",
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-module-gestao/30",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium">{title}</p>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-module-gestao group-hover:bg-module-gestao/10 transition-colors">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
          
          {change && !isLoading && (
            <div className={cn(
              "flex items-center gap-1 mt-1 text-xs font-medium",
              isPositive && "text-emerald-500",
              isNegative && "text-destructive",
              !isPositive && !isNegative && "text-muted-foreground"
            )}>
              {isPositive && <ArrowUpRight className="h-3 w-3" />}
              {isNegative && <ArrowDownRight className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        
        {sparklineData && sparklineData.length > 0 && !isLoading && (
          <MiniSparkline data={sparklineData} />
        )}
      </div>
    </motion.div>
  );
}
