import { PremiumAuroraBackground } from "@/components/dashboard/PremiumAuroraBackground";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  /** Page title */
  title?: string;
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
  /** Control content overflow - useful for kanban boards */
  contentOverflow?: "hidden" | "auto" | "visible";
  /** Hide the default header (for pages with custom headers) */
  hideHeader?: boolean;
}

/**
 * Premium PageWrapper component for Marketing pages
 * Provides consistent Aurora background, header styling, and BlurFade animations
 */
export function PageWrapper({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
  contentOverflow = "visible",
  hideHeader = false,
}: PageWrapperProps) {
  const overflowClass = {
    hidden: "overflow-hidden",
    auto: "overflow-auto",
    visible: "",
  }[contentOverflow];

  return (
    <PremiumAuroraBackground className={cn("min-h-full w-full", className)}>
      <div className={cn("space-y-4 flex flex-col min-w-0 w-full max-w-full", overflowClass)}>
        {/* Header */}
        {!hideHeader && title && (
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
        )}

        {/* Content */}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </PremiumAuroraBackground>
  );
}
