import * as React from "react";
import { cn } from "@/lib/utils";

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="input-group"
        className={cn("relative flex items-stretch", className)}
        {...props}
      />
    );
  }
);
InputGroup.displayName = "InputGroup";

interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "left" | "right";
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, position = "left", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="input-group-addon"
        className={cn(
          "flex items-center justify-center px-3 text-sm text-muted-foreground bg-muted border border-input",
          position === "left" && "rounded-l-xl border-r-0",
          position === "right" && "rounded-r-xl border-l-0",
          className
        )}
        {...props}
      />
    );
  }
);
InputGroupAddon.displayName = "InputGroupAddon";

interface InputGroupInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "left" | "right";
}

const InputGroupInset = React.forwardRef<HTMLDivElement, InputGroupInsetProps>(
  ({ className, position = "left", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="input-group-inset"
        className={cn(
          "absolute inset-y-0 flex items-center pointer-events-none text-muted-foreground",
          position === "left" && "left-0 pl-3",
          position === "right" && "right-0 pr-3",
          className
        )}
        {...props}
      />
    );
  }
);
InputGroupInset.displayName = "InputGroupInset";

export { InputGroup, InputGroupAddon, InputGroupInset };
