import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ModuleColor = "gestao" | "ia" | "ofertas" | "trade";

interface ModuleIconProps {
  icon: LucideIcon;
  color: ModuleColor;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: "w-10 h-10", icon: 20 },
  md: { container: "w-12 h-12", icon: 24 },
  lg: { container: "w-14 h-14", icon: 28 },
  xl: { container: "w-16 h-16", icon: 32 },
};

const colorMap: Record<ModuleColor, { bg: string; text: string; glow: string }> = {
  gestao: {
    bg: "bg-module-gestao/10",
    text: "text-module-gestao",
    glow: "hsl(260 65% 55% / 0.3)",
  },
  ia: {
    bg: "bg-module-ia/10",
    text: "text-module-ia",
    glow: "hsl(280 70% 55% / 0.3)",
  },
  ofertas: {
    bg: "bg-module-ofertas/10",
    text: "text-module-ofertas",
    glow: "hsl(170 65% 45% / 0.3)",
  },
  trade: {
    bg: "bg-module-trade/10",
    text: "text-module-trade",
    glow: "hsl(25 85% 55% / 0.3)",
  },
};

export function ModuleIcon({
  icon: Icon,
  color,
  size = "md",
  animated = false,
  className,
}: ModuleIconProps) {
  const { container, icon: iconSize } = sizeMap[size];
  const { bg, text, glow } = colorMap[color];

  const iconElement = (
    <div
      className={cn(
        container,
        bg,
        "rounded-xl flex items-center justify-center",
        className
      )}
      style={{
        boxShadow: animated ? `0 0 20px -5px ${glow}` : undefined,
      }}
    >
      <Icon size={iconSize} className={text} strokeWidth={1.5} />
    </div>
  );

  if (animated) {
    return (
      <motion.div
        animate={{
          boxShadow: [
            `0 0 20px -5px ${glow}`,
            `0 0 30px -5px ${glow}`,
            `0 0 20px -5px ${glow}`,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="rounded-xl"
      >
        {iconElement}
      </motion.div>
    );
  }

  return iconElement;
}

// Larger hero version for portal cards
interface ModuleHeroIconProps {
  icon: LucideIcon;
  color: ModuleColor;
  className?: string;
}

export function ModuleHeroIcon({ icon: Icon, color, className }: ModuleHeroIconProps) {
  const { text, glow } = colorMap[color];

  return (
    <motion.div
      className={cn(
        "w-20 h-20 rounded-2xl flex items-center justify-center relative",
        className
      )}
      style={{
        willChange: 'transform',
        background: `radial-gradient(ellipse at center, ${glow.replace("0.3", "0.15")} 0%, transparent 70%)`,
      }}
      whileHover={{
        y: -2,
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: [
            `0 0 30px -10px ${glow}`,
            `0 0 50px -10px ${glow}`,
            `0 0 30px -10px ${glow}`,
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <Icon size={40} className={cn(text, "relative z-10")} strokeWidth={1.5} />
    </motion.div>
  );
}
