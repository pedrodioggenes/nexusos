import React from "react";

interface DotsPatternProps {
  opacity?: number;
  dotSize?: number;
  spacing?: number;
  color?: string;
  rotation?: number;
  className?: string;
}

/**
 * DotsPattern - Reusable dots pattern overlay component
 * Automatically adapts to light/dark mode using Tailwind's dark: prefix.
 */
export default function DotsPattern({
  opacity = 0.8,
  dotSize = 3,
  spacing = 5,
  color,
  rotation = 40,
  className = "",
}: DotsPatternProps) {
  const lightDotColor = color || "rgba(255, 255, 255, 0.25)";
  const darkDotColor = color || "rgba(0, 0, 0, 0.4)";

  const uid = React.useId().replace(/:/g, "");
  const styleKey = `dots-pattern-${uid}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .${styleKey} {
            background-image: radial-gradient(
              circle,
              ${lightDotColor} ${dotSize}px,
              transparent ${dotSize}px
            );
          }
          .dark .${styleKey} {
            background-image: radial-gradient(
              circle,
              ${darkDotColor} ${dotSize}px,
              transparent ${dotSize}px
            );
          }
        `
      }} />
      <div
        className={`absolute -inset-[400px] pointer-events-none ${styleKey} ${className}`}
        style={{
          opacity,
          transform: `rotate(${rotation}deg)`,
          backgroundSize: `${spacing}px ${spacing}px`,
        }}
      />
    </>
  );
}
