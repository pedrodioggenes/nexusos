import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MovingBorderProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  borderRadius?: string;
  containerClassName?: string;
  borderClassName?: string;
}

const MovingBorder: React.FC<MovingBorderProps> = ({
  children,
  duration = 3,
  borderRadius = "1rem",
  containerClassName,
  borderClassName,
  className,
}) => {
  return (
    <div
      className={cn(
        "relative p-[1px] overflow-hidden rounded-2xl",
        containerClassName
      )}
      style={{ borderRadius }}
    >
      {/* Animated gradient border */}
      <motion.div
        className={cn("absolute inset-0", borderClassName)}
        style={{
          borderRadius,
          background: `linear-gradient(
            var(--border-angle, 0deg),
            hsl(var(--primary)) 0%,
            hsl(var(--accent)) 25%,
            hsl(var(--primary) / 0.5) 50%,
            hsl(var(--accent)) 75%,
            hsl(var(--primary)) 100%
          )`,
        }}
        animate={{
          "--border-angle": ["0deg", "360deg"],
        } as any}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Inner content with background */}
      <div
        className={cn("relative bg-background rounded-2xl", className)}
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      >
        {children}
      </div>
    </div>
  );
};

// Button variant with moving border
interface MovingBorderButtonProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  borderRadius?: string;
  containerClassName?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const MovingBorderButton: React.FC<MovingBorderButtonProps> = ({
  children,
  duration = 3,
  borderRadius = "0.75rem",
  containerClassName,
  className,
  disabled,
  onClick,
  type = "button",
}) => {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "relative p-[1.5px] overflow-hidden",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        containerClassName
      )}
      style={{ borderRadius }}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0"
        style={{
          borderRadius,
          background: `conic-gradient(
            from var(--border-angle, 0deg),
            hsl(var(--primary)) 0%,
            hsl(var(--accent)) 25%,
            hsl(var(--primary) / 0.3) 50%,
            hsl(var(--accent)) 75%,
            hsl(var(--primary)) 100%
          )`,
        }}
        animate={
          !disabled
            ? ({
                "--border-angle": ["0deg", "360deg"],
              } as any)
            : undefined
        }
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Button content */}
      <span
        className={cn(
          "relative block bg-card px-4 py-2",
          "text-sm font-medium text-foreground",
          "transition-colors duration-200",
          "hover:bg-card/80",
          className
        )}
        style={{ borderRadius: `calc(${borderRadius} - 1.5px)` }}
      >
        {children}
      </span>
    </motion.button>
  );
};

export { MovingBorder, MovingBorderButton };
