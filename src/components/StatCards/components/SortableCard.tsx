import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StatCard from "./StatCard";
import { BaseCard, CardTranslations } from "../types";

interface SortableCardProps extends BaseCard {
  translations?: CardTranslations;
  className?: string;
  enableNoise?: boolean;
  enableLighting?: boolean;
}

export default function SortableCard({
  id,
  title,
  value,
  icon,
  trend,
  color,
  translations,
  className = "",
  enableNoise = false,
  enableLighting = false,
}: SortableCardProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isMobile,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto" as React.CSSProperties["zIndex"],
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isMobile ? {} : listeners)}
      className={`${isDragging ? "cursor-grabbing" : ""} ${className}`}
    >
      <StatCard
        id={id}
        title={title}
        value={value}
        icon={icon}
        trend={trend}
        color={color}
        translations={translations}
        enableDragHandle={!isMobile}
        className={isDragging ? "shadow-lg" : ""}
        enableNoise={enableNoise}
        enableLighting={enableLighting}
      />
    </div>
  );
}
