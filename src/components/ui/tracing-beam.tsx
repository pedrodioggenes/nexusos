"use client";

import * as React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TracingBeamProps {
  children: React.ReactNode;
  className?: string;
}

export const TracingBeam: React.FC<TracingBeamProps> = ({
  children,
  className,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = React.useState(0);

  React.useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]),
    {
      stiffness: 500,
      damping: 90,
    }
  );

  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]),
    {
      stiffness: 500,
      damping: 90,
    }
  );

  return (
    <motion.div
      ref={ref}
      className={cn("relative w-full max-w-4xl mx-auto", className)}
    >
      <div className="absolute left-4 md:left-8 top-3">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          animate={{
            boxShadow:
              scrollYProgress.get() > 0
                ? "none"
                : "rgba(212, 175, 55, 0.24) 0px 10px 50px 10px",
          }}
          className="border-2 border-amber-500 w-3 h-3 rounded-full flex items-center justify-center ml-[13px]"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            animate={{
              backgroundColor:
                scrollYProgress.get() > 0
                  ? "hsl(var(--foreground))"
                  : "#D4AF37",
              borderColor:
                scrollYProgress.get() > 0
                  ? "hsl(var(--foreground))"
                  : "#D4AF37",
            }}
            className="h-1.5 w-1.5 rounded-full border border-amber-500 bg-amber-500"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="block ml-2"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="gradient-beam"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="1" />
              <stop offset="50%" stopColor="#B87333" stopOpacity="1" />
              <stop offset="100%" stopColor="#CD7F32" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.path
            d={`M 10 0 V ${svgHeight * 0.8} Q 10 ${svgHeight * 0.8 + 50} 10 ${svgHeight}`}
            fill="none"
            stroke="url(#gradient-beam)"
            strokeOpacity="0.16"
            strokeWidth="1.25"
            transition={{
              duration: 10,
            }}
          />
          <motion.path
            d={`M 10 0 V ${svgHeight * 0.8} Q 10 ${svgHeight * 0.8 + 50} 10 ${svgHeight}`}
            fill="none"
            stroke="url(#gradient-beam)"
            strokeWidth="1.25"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
            style={{
              pathLength: scrollYProgress,
            }}
          />
          <motion.circle
            cx="10"
            cy={y1}
            r="4"
            fill="#D4AF37"
            className="motion-reduce:hidden"
          />
          <motion.circle
            cx="10"
            cy={y1}
            r="10"
            fill="transparent"
            stroke="#D4AF37"
            strokeOpacity="0.2"
            strokeWidth="1"
            className="motion-reduce:hidden"
          />
        </svg>
      </div>
      <div ref={contentRef} className="ml-12 md:ml-20">
        {children}
      </div>
    </motion.div>
  );
};
