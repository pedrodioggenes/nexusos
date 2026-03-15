"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface DockItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface FloatingDockProps {
  items: DockItem[];
  className?: string;
  direction?: "horizontal" | "vertical";
  activeIndex?: number;
  onItemClick?: (index: number) => void;
}

/**
 * FloatingDock - MATTE ARCHITECTURE Edition
 * Solid backgrounds, no blur, terracotta accents
 */
export const FloatingDock: React.FC<FloatingDockProps> = ({
  items,
  className,
  direction = "vertical",
  activeIndex,
  onItemClick,
}) => {
  const mousePosition = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => {
        if (direction === "vertical") {
          mousePosition.set(e.clientY);
        } else {
          mousePosition.set(e.clientX);
        }
      }}
      onMouseLeave={() => mousePosition.set(Infinity)}
      className={cn(
        "fixed z-50",
        direction === "vertical"
          ? "left-4 top-1/2 -translate-y-1/2 flex-col"
          : "bottom-6 left-1/2 -translate-x-1/2",
        "flex gap-3 p-3 rounded-2xl",
        className
      )}
      style={{
        backgroundColor: '#18181B',
        border: '1px solid #27272A',
      }}
    >
      {items.map((item, index) => (
        <DockIcon
          key={index}
          item={item}
          mousePosition={mousePosition}
          direction={direction}
          isActive={activeIndex === index}
          onClick={() => onItemClick?.(index)}
        />
      ))}
    </motion.div>
  );
};

interface DockIconProps {
  item: DockItem;
  mousePosition: ReturnType<typeof useMotionValue<number>>;
  direction: "horizontal" | "vertical";
  isActive?: boolean;
  onClick?: () => void;
}

const DockIcon: React.FC<DockIconProps> = ({
  item,
  mousePosition,
  direction,
  isActive,
  onClick,
}) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const distance = useTransform(mousePosition, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, x: 0, height: 0, width: 0 };
    const center = direction === "vertical" 
      ? bounds.y + bounds.height / 2 
      : bounds.x + bounds.width / 2;
    return val - center;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 56, 40]);
  const heightSync = useTransform(distance, [-150, 0, 150], [40, 56, 40]);

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <div className="relative">
      <motion.button
        ref={ref}
        style={{ width, height }}
        onClick={() => {
          onClick?.();
          item.onClick?.();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "aspect-square rounded-xl flex items-center justify-center transition-all duration-200",
        )}
        // Inline styles for matte architecture
        // Default: zinc-800, hover: zinc-700, active: terracotta
        // Using inline to avoid tailwind color conflicts
        {...(isActive ? {
          style: {
            backgroundColor: 'rgba(124, 45, 18, 0.25)',
            color: '#EA580C',
            boxShadow: 'inset 0 0 0 1px rgba(124, 45, 18, 0.4)',
          }
        } : {
          style: {
            backgroundColor: '#27272A',
            color: '#A1A1AA',
          }
        })}
      >
        <div className="w-5 h-5">
          {item.icon}
        </div>
      </motion.button>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: direction === "vertical" ? 10 : 0, y: direction === "horizontal" ? 10 : 0 }}
            animate={{ opacity: 1, x: direction === "vertical" ? 0 : 0, y: 0 }}
            exit={{ opacity: 0, x: direction === "vertical" ? 10 : 0, y: direction === "horizontal" ? 10 : 0 }}
            className={cn(
              "absolute whitespace-nowrap px-3 py-1.5 rounded-lg text-xs",
              direction === "vertical" ? "left-full ml-2 top-1/2 -translate-y-1/2" : "bottom-full mb-3 left-1/2 -translate-x-1/2"
            )}
            style={{
              backgroundColor: '#18181B',
              border: '1px solid #27272A',
              color: '#D4D4D8',
            }}
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
