import React from "react";
import { DndCardsContainer } from "./components";
import { StatCardsProps } from "./types";
import { StatCardSkeleton } from "./components";
import { convertStatToCard } from "./utils";
import { useIsMobile, useStatCardsState } from "./hooks";

export default function StatCards({
  data,
  enableDnd,
  onReorder,
  saveOrder,
  storageKey,
  gridCols = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  gap = "gap-4",
  className,
  enableNoise = true,
  enableLighting = true,
  loading = false,
  translations,
}: StatCardsProps) {
  const { stats, handleReorder } = useStatCardsState(data, onReorder);
  const isMobile = useIsMobile();
  const isDndEnabled = enableDnd !== undefined ? enableDnd : !isMobile;
  const cardData = React.useMemo(() => stats.map(convertStatToCard), [stats]);

  if (loading) {
    return (
      <div className={`w-full ${className || ""}`}>
        <div className={`${gridCols} ${gap}`}>
          {[...Array(data.length || 4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className || ""}`}>
      <DndCardsContainer
        cards={cardData}
        enableDnd={isDndEnabled}
        onReorder={handleReorder}
        {...(saveOrder ? { saveOrder: true, storageKey: storageKey! } : { saveOrder: false })}
        gridCols={gridCols}
        gap={gap}
        enableNoise={enableNoise}
        enableLighting={enableLighting}
        translations={{
          dragHandle: translations?.dragHandle || "Drag to reorder",
          trends: {
            ariaLabel: translations?.trends?.ariaLabel || "Trend {direction} {value}",
          },
        }}
      />
    </div>
  );
}
