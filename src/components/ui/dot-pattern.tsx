import * as React from "react";
import { cn } from "@/lib/utils";

interface DotPatternProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
}

const DotPattern = React.forwardRef<SVGSVGElement, DotPatternProps>(
  (
    {
      width = 16,
      height = 16,
      cx = 1,
      cy = 1,
      cr = 1,
      className,
      ...props
    },
    ref
  ) => {
    const id = React.useId();

    return (
      <svg
        ref={ref}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full fill-muted-foreground/20",
          className
        )}
        {...props}
      >
        <defs>
          <pattern
            id={id}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            patternContentUnits="userSpaceOnUse"
          >
            <circle cx={cx} cy={cy} r={cr} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      </svg>
    );
  }
);
DotPattern.displayName = "DotPattern";

// Grid pattern variant
interface GridPatternProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

const GridPattern = React.forwardRef<SVGSVGElement, GridPatternProps>(
  (
    {
      width = 40,
      height = 40,
      strokeWidth = 1,
      className,
      ...props
    },
    ref
  ) => {
    const id = React.useId();

    return (
      <svg
        ref={ref}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full stroke-muted-foreground/10",
          className
        )}
        {...props}
      >
        <defs>
          <pattern
            id={id}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${width} 0 L 0 0 0 ${height}`}
              fill="none"
              strokeWidth={strokeWidth}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      </svg>
    );
  }
);
GridPattern.displayName = "GridPattern";

export { DotPattern, GridPattern };
