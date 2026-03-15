"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverBorderGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  containerClassName?: string;
  as?: React.ElementType;
  duration?: number;
  clockwise?: boolean;
}

export const HoverBorderGradient: React.FC<HoverBorderGradientProps> = ({
  children,
  containerClassName,
  className,
  as: Component = "div",
  duration = 1,
  clockwise = true,
  ...props
}) => {
  const [hovered, setHovered] = React.useState(false);
  const [direction, setDirection] = React.useState<"TOP" | "LEFT" | "BOTTOM" | "RIGHT">("TOP");

  const rotateDirection = React.useCallback((currentDirection: typeof direction) => {
    const directions: Array<typeof direction> = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex + 1) % directions.length
      : (currentIndex - 1 + directions.length) % directions.length;
    return directions[nextIndex];
  }, [clockwise]);

  const movingMap: Record<string, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(263, 90%, 51%) 0%, rgba(139, 92, 246, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(263, 90%, 51%) 0%, rgba(139, 92, 246, 0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, hsl(263, 90%, 51%) 0%, rgba(139, 92, 246, 0) 100%)",
    RIGHT: "radial-gradient(16.6% 43.1% at 100% 50%, hsl(263, 90%, 51%) 0%, rgba(139, 92, 246, 0) 100%)",
  };

  const highlight = "radial-gradient(75% 181.16% at 50% 50%, #8B5CF6 0%, rgba(139, 92, 246, 0) 100%)";

  React.useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration, rotateDirection]);

  return (
    <Component
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-800/50 transition-colors duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-[1px] w-full",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto z-10 rounded-[inherit] bg-slate-900",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="absolute z-1 flex-none inset-[2px] rounded-[10px] bg-slate-900" />
    </Component>
  );
};
