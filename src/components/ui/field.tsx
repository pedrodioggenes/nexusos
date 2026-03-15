import * as React from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="field"
        data-orientation={orientation}
        className={cn(
          "space-y-2",
          orientation === "horizontal" &&
            "flex items-center gap-4 space-y-0 [&>[data-slot=label]]:min-w-[120px] [&>[data-slot=label]]:mb-0",
          className
        )}
        {...props}
      />
    );
  }
);
Field.displayName = "Field";

interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
}

const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, columns = 1, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="field-group"
        className={cn(
          "grid gap-4",
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-1 sm:grid-cols-2",
          columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          className
        )}
        {...props}
      />
    );
  }
);
FieldGroup.displayName = "FieldGroup";

interface FieldDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      data-slot="field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        data-slot="field-error"
        className={cn("text-sm text-destructive", className)}
        {...props}
      />
    );
  }
);
FieldError.displayName = "FieldError";

export { Field, FieldGroup, FieldDescription, FieldError };
