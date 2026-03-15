import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ModuleColor = "gestao" | "ia" | "ofertas" | "trade" | "primary" | "accent";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: ModuleColor;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  interactive?: boolean;
}

const glowColorMap: Record<ModuleColor, { border: string; glow: string; bg: string }> = {
  gestao: {
    border: "hsl(0 0% 35%)",
    glow: "hsl(0 0% 100% / 0.08)",
    bg: "hsl(0 0% 100% / 0.02)",
  },
  ia: {
    border: "hsl(0 0% 35%)",
    glow: "hsl(0 0% 100% / 0.08)",
    bg: "hsl(0 0% 100% / 0.02)",
  },
  ofertas: {
    border: "hsl(0 0% 35%)",
    glow: "hsl(0 0% 100% / 0.08)",
    bg: "hsl(0 0% 100% / 0.02)",
  },
  trade: {
    border: "hsl(0 0% 35%)",
    glow: "hsl(0 0% 100% / 0.08)",
    bg: "hsl(0 0% 100% / 0.02)",
  },
  primary: {
    border: "hsl(0 0% 35%)",
    glow: "hsl(0 0% 100% / 0.08)",
    bg: "hsl(0 0% 100% / 0.02)",
  },
  accent: {
    border: "hsl(0 0% 35%)",
    glow: "hsl(0 0% 100% / 0.08)",
    bg: "hsl(0 0% 100% / 0.02)",
  },
};

export function GlowCard({
  children,
  className,
  glowColor = "primary",
  onClick,
  href,
  disabled = false,
  interactive = true,
}: GlowCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = glowColorMap[glowColor];

  const cardContent = (
    <motion.div
      className={cn(
        "relative rounded-2xl border bg-card overflow-hidden",
        interactive && !disabled && "cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!disabled ? onClick : undefined}
      initial={false}
      animate={{
        borderColor: isHovered ? colors.border : "hsl(0 0% 12%)",
        boxShadow: isHovered 
          ? `0 4px 20px -4px rgba(0, 0, 0, 0.5), 0 0 40px -10px ${colors.glow}`
          : "0 0 0 0 transparent",
        y: isHovered ? -4 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ willChange: 'transform' }}
      whileTap={interactive && !disabled ? { scale: 0.98 } : undefined}
    >
      {/* Glow background on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(ellipse at center, ${colors.bg} 0%, transparent 70%)`,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );

  if (href && !disabled) {
    return (
      <a href={href} className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

// Simpler version for non-interactive displays
interface GlowCardStaticProps {
  children: ReactNode;
  className?: string;
  glowColor?: ModuleColor;
  glowIntensity?: "subtle" | "medium" | "strong";
}

export function GlowCardStatic({
  children,
  className,
  glowColor = "primary",
  glowIntensity = "subtle",
}: GlowCardStaticProps) {
  const colors = glowColorMap[glowColor];
  
  const intensityMap = {
    subtle: 0.15,
    medium: 0.3,
    strong: 0.5,
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card overflow-hidden",
        className
      )}
      style={{
        borderColor: colors.border,
        boxShadow: `0 0 40px -10px ${colors.glow.replace(/[\d.]+\)$/, `${intensityMap[glowIntensity]})`)}`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.bg} 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
