import * as React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
}

const BlurFade: React.FC<BlurFadeProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.4,
  yOffset = 6,
  inView = true,
  inViewMargin = "-50px",
}) => {
  const variants: Variants = {
    hidden: {
      y: yOffset,
      opacity: 0,
      filter: "blur(6px)",
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileInView={inView ? "visible" : undefined}
      viewport={{ once: true, margin: inViewMargin }}
      variants={variants}
      transition={{
        delay,
        duration,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

// Staggered list animation
interface BlurFadeListProps {
  children: React.ReactNode[];
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

const BlurFadeList: React.FC<BlurFadeListProps> = ({
  children,
  className,
  delay = 0,
  staggerDelay = 0.05,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <BlurFade key={index} delay={delay + index * staggerDelay}>
          {child}
        </BlurFade>
      ))}
    </div>
  );
};

export { BlurFade, BlurFadeList };
