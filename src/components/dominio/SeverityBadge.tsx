import { Badge } from "@/components/ui/badge";

interface SeverityBadgeProps {
  severity: "critical" | "warning";
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge
      variant={severity === "critical" ? "destructive" : "secondary"}
      className={`text-[10px] ${className || ""}`}
    >
      {severity === "critical" ? "Crítico" : "Atenção"}
    </Badge>
  );
}

interface ImpactEstimateProps {
  value: number;
  className?: string;
}

export function ImpactEstimate({ value, className }: ImpactEstimateProps) {
  const formatted = value >= 1000000
    ? `R$ ${(value / 1000000).toFixed(1)}M`
    : value >= 1000
    ? `R$ ${(value / 1000).toFixed(1)}k`
    : `R$ ${value.toFixed(0)}`;

  return (
    <span className={`text-xs font-semibold text-red-500 ${className || ""}`}>
      {formatted}
    </span>
  );
}
