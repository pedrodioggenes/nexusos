"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightRadius?: number;
  spotlightOpacity?: number;
}

/**
 * CardSpotlight - Aceternity UI Inspired
 * Card com efeito de spotlight que segue o mouse
 * Configurado com luz dourada quente para estética Festval
 */
export const CardSpotlight: React.FC<CardSpotlightProps> = ({
  children,
  className,
  spotlightColor = "#D4AF37",
  spotlightRadius = 350,
  spotlightOpacity = 0.15,
}) => {
  const divRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-black/60 backdrop-blur-xl",
        "border border-amber-900/20",
        "transition-all duration-300",
        "hover:border-amber-800/30",
        className
      )}
    >
      {/* Spotlight gradient effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${spotlightRadius}px circle at ${spotlightX}px ${spotlightY}px, ${spotlightColor}${Math.round(spotlightOpacity * 255).toString(16).padStart(2, '0')}, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default CardSpotlight;
