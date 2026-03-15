import React from "react";

interface RaysLightingProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  width?: number;
  height?: number;
  intensity?: number;
  color?: string;
  zIndex?: number;
  className?: string;
}

/**
 * RaysLighting - Rays lighting effect component
 * Creates a radial gradient light effect from a corner or center.
 */
export default function RaysLighting({
  position = "top-left",
  width = 1200,
  height = 600,
  intensity = 0.05,
  color,
  zIndex = 20,
  className = "",
}: RaysLightingProps) {
  const positionMap: Record<string, string> = {
    "top-left": "0% 0%",
    "top-right": "100% 0%",
    "bottom-left": "0% 100%",
    "bottom-right": "100% 100%",
    center: "50% 50%",
  };

  const gradientPosition = positionMap[position];
  const lightColor = color || "205, 205, 205";

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        zIndex,
        background: `radial-gradient(ellipse ${width}px ${height}px at ${gradientPosition}, rgba(${lightColor}, ${intensity}) 0%, rgba(${lightColor}, 0) 30%, transparent 70%)`,
      }}
    />
  );
}
