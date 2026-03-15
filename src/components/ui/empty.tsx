import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyProps {
  icon?: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  size?: "sm" | "default" | "lg";
  className?: string;
}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  (
    { className, icon, title, description, action, size = "default" },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="empty"
        className={cn(
          "flex flex-col items-center justify-center text-center",
          size === "sm" && "py-6 gap-2",
          size === "default" && "py-12 gap-4",
          size === "lg" && "py-20 gap-6",
          className
        )}
      >
        {icon && (
          <div
            data-slot="empty-icon"
            className={cn(
              "text-muted-foreground",
              size === "sm" && "[&>svg]:h-8 [&>svg]:w-8",
              size === "default" && "[&>svg]:h-12 [&>svg]:w-12",
              size === "lg" && "[&>svg]:h-16 [&>svg]:w-16"
            )}
          >
            {icon}
          </div>
        )}
        {title && (
          <h3
            data-slot="empty-title"
            className={cn(
              "font-semibold text-foreground",
              size === "sm" && "text-sm",
              size === "default" && "text-base",
              size === "lg" && "text-lg"
            )}
          >
            {title}
          </h3>
        )}
        {description && (
          <p
            data-slot="empty-description"
            className={cn(
              "text-muted-foreground max-w-sm",
              size === "sm" && "text-xs",
              size === "default" && "text-sm",
              size === "lg" && "text-base"
            )}
          >
            {description}
          </p>
        )}
        {action && (
          <div data-slot="empty-action" className="mt-2">
            {action}
          </div>
        )}
      </div>
    );
  }
);
Empty.displayName = "Empty";

export { Empty };
