import { PremiumAuroraBackground } from "./PremiumAuroraBackground";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Optional actions (buttons) */
  actions?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Premium PageWrapper component for Trade pages
 * Provides consistent Aurora background, header styling, and BlurFade animations
 */
export function PageWrapper({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
}: PageWrapperProps) {
  return (
    <PremiumAuroraBackground className={cn("min-h-full", className)}>
      <div className="space-y-6">
        {/* Header */}
        <BlurFade delay={0}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                {icon}
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {actions}
              </div>
            )}
          </div>
        </BlurFade>

        {/* Content */}
        {children}
      </div>
    </PremiumAuroraBackground>
  );
}
