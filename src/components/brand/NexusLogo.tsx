import { cn } from "@/lib/utils";
import nexusLogo from "@/assets/nexus-logo.svg";

interface NexusLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
}

const sizeMap = {
  sm: "h-5",
  md: "h-7",
  lg: "h-10",
  xl: "h-14",
};

export function NexusLogo({ 
  size = "md", 
  className,
  showTagline = false
}: NexusLogoProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <img 
        src={nexusLogo} 
        alt="Nexus" 
        className={cn("w-auto", sizeMap[size])}
      />
      {showTagline && (
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">
          O ecossistema que conecta seu negócio
        </p>
      )}
    </div>
  );
}

export function NexusLogoInline({ className }: { className?: string }) {
  return (
    <img 
      src={nexusLogo} 
      alt="Nexus" 
      className={cn("h-5 w-auto", className)}
    />
  );
}
