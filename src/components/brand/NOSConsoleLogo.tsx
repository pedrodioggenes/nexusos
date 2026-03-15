import { cn } from "@/lib/utils";

interface NOSConsoleLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
}

const sizeMap = {
  sm: {
    nos: "text-xl",
    console: "text-lg",
    tagline: "text-[9px]",
    gap: "gap-0.5",
  },
  md: {
    nos: "text-3xl",
    console: "text-2xl",
    tagline: "text-[10px]",
    gap: "gap-1",
  },
  lg: {
    nos: "text-5xl",
    console: "text-4xl",
    tagline: "text-xs",
    gap: "gap-1.5",
  },
  xl: {
    nos: "text-6xl md:text-7xl",
    console: "text-5xl md:text-6xl",
    tagline: "text-sm",
    gap: "gap-2",
  },
};

export function NOSConsoleLogo({ 
  size = "md", 
  className,
  showTagline = false 
}: NOSConsoleLogoProps) {
  const sizes = sizeMap[size];

  return (
    <div className={cn("flex flex-col", sizes.gap, className)}>
      <div className="flex items-baseline">
        <span className={cn(
          "font-bold tracking-tight leading-none text-[hsl(var(--festval-ivory))] font-['Playfair_Display']",
          sizes.nos
        )}>
          NOS
        </span>
        <span className={cn(
          "font-medium tracking-normal leading-none text-[hsl(var(--festval-copper))] ml-1.5 font-['DM_Sans']",
          sizes.console
        )}>
          Console
        </span>
      </div>
      
      {showTagline && (
        <p className={cn(
          "text-[hsl(var(--festval-stone-muted))] tracking-[0.15em] uppercase font-medium font-['DM_Mono']",
          sizes.tagline
        )}>
          Araripe.me · Governance
        </p>
      )}
    </div>
  );
}

// Compact inline version for headers
export function NOSConsoleLogoInline({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span className="font-bold tracking-tight text-lg leading-none text-[hsl(var(--festval-ivory))] font-['Playfair_Display']">
        NOS
      </span>
      <span className="font-medium tracking-normal text-base leading-none text-[hsl(var(--festval-copper))] ml-0.5 font-['DM_Sans']">
        Console
      </span>
    </span>
  );
}
