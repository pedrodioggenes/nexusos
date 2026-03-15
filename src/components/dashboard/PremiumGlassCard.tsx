import { cn } from '@/lib/utils';

interface PremiumGlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** @deprecated Shimmer removed — Festval Matte solid cards */
  hasShimmer?: boolean;
  /** @deprecated No longer used */
  delay?: number;
  onClick?: () => void;
}

/**
 * Solid card — Festval Matte aesthetic.
 * Kept as wrapper for backward compatibility (46 files).
 * Visually identical to SolidCard "default" variant.
 */
export function PremiumGlassCard({ 
  children, 
  className,
  onClick,
}: PremiumGlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl p-6 bg-card border border-border",
        onClick && "cursor-pointer hover:border-border/80",
        className
      )}
    >
      {children}
    </div>
  );
}
