import React, { useEffect, useRef, ReactNode } from "react";

interface GlowCardProps {
  children?: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
  glowMode?: "color" | "monochrome";
  glowVariant?: "chromatic" | "monochrome";
  size?: "sm" | "md" | "lg";
  width?: string | number;
  height?: string | number;
  customSize?: boolean;
}

const neutralBorderColor = "hsl(220 14% 72% / 0.55)";

const palette = {
  chromatic: { base: 280, spread: 260, saturation: 82, lightness: 62 },
  monochrome: { base: 220, spread: 0, saturation: 0, lightness: 88 },
} as const;

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowMode = "color",
  glowVariant,
  size = "md",
  width,
  height,
  customSize = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const syncPointer = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      const rect = el.getBoundingClientRect();
      const relX = Math.max(0, Math.min(x - rect.left, rect.width));
      const relY = Math.max(0, Math.min(y - rect.top, rect.height));
      el.style.setProperty("--x", relX.toFixed(2));
      el.style.setProperty("--y", relY.toFixed(2));
      const xp = rect.width > 0 ? relX / rect.width : 0;
      const yp = rect.height > 0 ? relY / rect.height : 0;
      el.style.setProperty("--xp", xp.toFixed(2));
      el.style.setProperty("--yp", yp.toFixed(2));
    };

    const handleMouseEnter = () => el.style.setProperty("--glow-opacity", "1");
    const handleMouseLeave = () => el.style.setProperty("--glow-opacity", "0");

    el.style.setProperty("--glow-opacity", "0");
    el.addEventListener("mousemove", syncPointer);
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", syncPointer);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const resolvedVariant = glowVariant
    ? glowVariant
    : glowMode === "monochrome"
    ? "monochrome"
    : "chromatic";
  const { base, spread, saturation, lightness } = palette[resolvedVariant];
  const saturationValue = `${saturation}%`;
  const lightnessValue = `${lightness}%`;
  const backdropColor = "var(--surface, hsl(var(--card)))";

  const getSizeClasses = () => {
    if (customSize) return "";
    return sizeMap[size];
  };

  const getInlineStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties & { [key: string]: string | number | undefined } = {
      "--base": base,
      "--spread": spread,
      "--saturation": saturationValue,
      "--lightness": lightnessValue,
      "--radius": "16",
      "--border": "3",
      "--backdrop": backdropColor,
      "--backup-border": neutralBorderColor,
      "--size": "200",
      "--outer": "1",
      "--border-size": "calc(var(--border, 2) * 1px)",
      "--radius-px": "calc(var(--radius) * 1px)",
      "--glow-radius": "calc((var(--radius) + var(--border)) * 0.8px)",
      "--spotlight-size": "calc(var(--size, 150) * 1px)",
      "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue) var(--saturation) var(--lightness) / calc(0.22 * var(--glow-opacity, 0))), transparent
      )`,
      backgroundColor: "var(--backdrop, transparent)",
      backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
      backgroundPosition: "50% 50%",
      backgroundAttachment: "scroll",
      border: "var(--border-size) solid var(--backup-border)",
      borderRadius: "var(--radius-px)",
      position: "relative",
      touchAction: "none",
      isolation: "isolate",
    };

    if (width !== undefined) baseStyles.width = typeof width === "number" ? `${width}px` : width;
    if (height !== undefined) baseStyles.height = typeof height === "number" ? `${height}px` : height;

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: var(--glow-radius);
      background-attachment: scroll;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue) var(--saturation) var(--lightness) / calc(0.45 * var(--glow-opacity, 0))), transparent 100%
      );
      filter: saturate(1.25);
    }
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue) var(--saturation) var(--lightness) / calc(0.6 * var(--glow-opacity, 0))), transparent 100%
      );
    }
    [data-glow] [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: var(--radius-px);
      border-width: calc(var(--border-size) * 20);
      background: radial-gradient(
        calc(var(--spotlight-size) * 0.8) calc(var(--spotlight-size) * 0.8) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue) var(--saturation) var(--lightness) / calc(0.12 * var(--glow-opacity, 0))), transparent 90%
      );
      pointer-events: none;
      border: none;
    }
    [data-glow] > [data-glow]::before {
      inset: calc(var(--border-size) * -1);
      border-width: var(--border-size);
      border-radius: var(--glow-radius);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        className={`
          ${getSizeClasses()}
          ${!customSize ? "aspect-[3/4]" : ""}
          rounded-2xl
          relative
          grid
          grid-rows-[1fr_auto]
          shadow-none
          p-4
          gap-4
          ${className}
        `}
      >
        <div ref={innerRef} data-glow></div>
        {children}
      </div>
    </>
  );
};

export { GlowCard };
export { GlowCard as MagicCard };
