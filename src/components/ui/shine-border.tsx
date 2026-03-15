"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  children: React.ReactNode;
  className?: string;
  colors?: [string, string];
  duration?: number;
  borderWidth?: number;
  borderRadius?: number;
}

/**
 * ShineBorder - Magic UI Inspired
 * Borda com efeito de brilho correndo animado
 * Configurado com gradiente Ouro para Bronze
 */
export const ShineBorder: React.FC<ShineBorderProps> = ({
  children,
  className,
  colors = ["#D4AF37", "#B87333"],
  duration = 3,
  borderWidth = 2,
  borderRadius = 16,
}) => {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
      }}
    >
      {/* Animated shine border */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: `${borderRadius}px`,
          background: `conic-gradient(from var(--shine-angle, 0deg), ${colors[0]}, ${colors[1]}, ${colors[0]})`,
          animation: `shine-rotate ${duration}s linear infinite`,
        }}
      />

      {/* Inner content container */}
      <div
        className="relative z-10 h-full w-full"
        style={{
          borderRadius: `${borderRadius - borderWidth}px`,
          background: "rgba(0, 0, 0, 0.85)",
        }}
      >
        {children}
      </div>

      {/* CSS Animation */}
      <style>{`
        @property --shine-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        
        @keyframes shine-rotate {
          0% {
            --shine-angle: 0deg;
          }
          100% {
            --shine-angle: 360deg;
          }
        }
      `}</style>
    </div>
  );
};

export default ShineBorder;
