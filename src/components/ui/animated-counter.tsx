import { useRef, useEffect } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  color: string;
}

/**
 * Animated counter component that animates from 0 to target value
 * when scrolled into view. Used for metrics displays.
 */
export function AnimatedCounter({ 
  value, 
  suffix = '', 
  duration = 2,
  color 
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [isInView, value, count, duration]);

  return (
    <motion.span 
      ref={ref} 
      className={`font-bold ${color}`}
    >
      <motion.span>{rounded}</motion.span>
      {suffix && <span>{suffix}</span>}
    </motion.span>
  );
}
