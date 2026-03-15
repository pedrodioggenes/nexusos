import { cn } from "@/lib/utils";

interface ConsoleLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
}

const sizeMap = {
  sm: {
    nexus: "text-xl",
    console: "text-lg",
    tagline: "text-[9px]",
    gap: "gap-0.5",
  },
  md: {
    nexus: "text-3xl",
    console: "text-2xl",
    tagline: "text-[10px]",
    gap: "gap-1",
  },
  lg: {
    nexus: "text-5xl",
    console: "text-4xl",
    tagline: "text-xs",
    gap: "gap-1.5",
  },
  xl: {
    nexus: "text-6xl md:text-7xl",
    console: "text-5xl md:text-6xl",
    tagline: "text-sm",
    gap: "gap-2",
  },
};

export function ConsoleLogo({
  size = "md",
  className,
  showTagline = false
}: ConsoleLogoProps) {
  const sizes = sizeMap[size];

  return (
    <div className={cn("flex flex-col", sizes.gap, className)}>
      <div className="flex items-baseline">
        <span className={cn(
          "font-extrabold tracking-tight leading-none text-[#FFCC00]",
          sizes.nexus
        )}>
          NOS
        </span>
        <span className={cn(
          "font-medium tracking-normal leading-none text-app-console ml-1",
          sizes.console
        )}>
          Console
        </span>
      </div>
      
      {showTagline && (
        <p className={cn(
          "text-muted-foreground/70 tracking-widest uppercase font-medium",
          sizes.tagline
        )}>
          Administração da Plataforma
        </p>
      )}
    </div>
  );
}

// Compact inline version for headers
export function ConsoleLogoInline({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span className="font-extrabold tracking-tight text-lg leading-none text-[#FFCC00]">
        NOS
      </span>
      <span className="font-medium tracking-normal text-base leading-none text-app-console ml-0.5">
        Console
      </span>
    </span>
  );
}
