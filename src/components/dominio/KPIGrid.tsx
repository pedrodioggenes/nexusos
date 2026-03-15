import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SparklineChart } from "./SparklineChart";
import type { KPICardData } from "@/data/dominio/types";

interface KPIGridProps {
  items: KPICardData[];
  columns?: number;
}

export function KPIGrid({ items, columns = 4 }: KPIGridProps) {
  const gridCols = columns === 6 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
    : columns === 3 ? "grid-cols-1 sm:grid-cols-3"
    : "grid-cols-2 md:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {items.map((item, i) => (
        <KPICard key={i} data={item} />
      ))}
    </div>
  );
}

function KPICard({ data }: { data: KPICardData }) {
  const VariationIcon = data.variation_type === "positive" ? TrendingUp
    : data.variation_type === "negative" ? TrendingDown : Minus;

  const variationColor = data.variation_type === "positive" ? "text-green-500"
    : data.variation_type === "negative" ? "text-red-500" : "text-muted-foreground";

  return (
    <Card className="p-4 bg-card border-border hover:scale-[1.01]">
      <p className="text-xs text-muted-foreground truncate">{data.label}</p>
      <div className="flex items-end justify-between mt-1 gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold text-foreground truncate">{data.formatted_value}</p>
          {data.variation_pct !== undefined && (
            <div className="flex items-center gap-1 mt-0.5">
              <VariationIcon className={`h-3 w-3 ${variationColor}`} />
              <span className={`text-xs ${variationColor}`}>
                {data.variation_pct > 0 ? "+" : ""}{data.variation_pct.toFixed(1)}%
              </span>
            </div>
          )}
          {data.impact_label && (
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{data.impact_label}</p>
          )}
        </div>
        {data.trend && data.trend.length > 1 && (
          <SparklineChart data={data.trend} />
        )}
      </div>
    </Card>
  );
}
