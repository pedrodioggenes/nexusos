import React from "react";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  GripHorizontal,
} from "lucide-react";
import { BaseCard, CardTranslations, TrendDirection } from "../types";
import DotsPattern from "@/components/ui/DotsPattern";
import RaysLighting from "@/components/ui/RaysLighting";

interface StatCardProps extends BaseCard {
  translations?: CardTranslations;
  enableDragHandle?: boolean;
  className?: string;
  enableNoise?: boolean;
  enableLighting?: boolean;
}

export default function StatCard({
  id,
  title,
  value,
  icon,
  trend,
  color,
  translations,
  enableDragHandle = false,
  className = "",
  enableNoise = false,
  enableLighting = false,
}: StatCardProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getTrendIcon = (direction: TrendDirection) => {
    const iconClassName = "mr-1 h-3.5 w-3.5";
    switch (direction) {
      case "up":   return <TrendingUp className={iconClassName} />;
      case "down": return <TrendingDown className={iconClassName} />;
      case "stable": return <ArrowRight className={iconClassName} />;
      default: return null;
    }
  };

  const getTrendColor = (direction: TrendDirection) => {
    switch (direction) {
      case "up":     return "text-emerald-500";
      case "down":   return "text-red-500";
      case "stable": return "text-muted-foreground";
      default:       return "text-muted-foreground";
    }
  };

  const valueColor = color || "text-foreground";
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  const defaultTranslations: CardTranslations = {
    dragHandle: "Drag to reorder",
    trends: { ariaLabel: "Trend {direction} {value}" },
  };
  const t = translations || defaultTranslations;

  return (
    <div
      className={`bg-card py-4 px-4 rounded-2xl border border-border/60 h-full select-none min-h-[110px] w-full flex flex-col justify-between relative overflow-hidden ${className}`}
      data-card-id={id}
      tabIndex={0}
      role="article"
      aria-label={`${title}: ${displayValue}${trend ? `, trend ${trend.direction} ${trend.value}` : ""}`}
    >
      {!trend && icon && (
        <div
          className="absolute bottom-4 right-6 text-muted-foreground opacity-[0.07] pointer-events-none"
          aria-hidden="true"
          style={{ transform: "scale(2.3)" }}
        >
          <div className="w-5 h-5">{icon}</div>
        </div>
      )}

      {enableNoise && (
        <DotsPattern opacity={0.8} dotSize={3} spacing={5} rotation={40} />
      )}

      {enableLighting && (
        <RaysLighting position="top-left" intensity={0.09} width={1200} height={600} zIndex={20} />
      )}

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center">
          {icon && (
            <div
              className="mr-2 text-muted-foreground bg-secondary p-1.5 rounded-md"
              aria-hidden="true"
            >
              <div className="w-5 h-5">{icon}</div>
            </div>
          )}
          <div className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
            {title}
          </div>
        </div>
        {enableDragHandle && !isMobile && (
          <div
            className="opacity-30 hover:opacity-100 transition-opacity cursor-grab p-0.5"
            aria-hidden="true"
            title={t.dragHandle}
          >
            <GripHorizontal size={14} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between relative z-10">
        <div className={`text-lg sm:text-xl font-bold ${valueColor} leading-tight`}>
          {displayValue}
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs sm:text-sm ${getTrendColor(trend.direction)}`}
            aria-label={t.trends.ariaLabel
              .replace("{direction}", trend.directionLabel || trend.direction)
              .replace("{value}", trend.value)}
          >
            {getTrendIcon(trend.direction)}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
