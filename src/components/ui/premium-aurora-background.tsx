import { cn } from '@/lib/utils';

interface PremiumAuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
  /** @deprecated Module presets removed — Festval Matte zinc is now universal */
  module?: string;
}

/**
 * Unified background wrapper.
 * Aurora orbs removed — Festval Matte zinc is the universal shell.
 * Kept as a thin wrapper for backward compatibility across all modules.
 */
export function PremiumAuroraBackground({
  children,
  className,
}: PremiumAuroraBackgroundProps) {
  return (
    <div className={cn("relative min-h-full", className)}>
      {children}
    </div>
  );
}
