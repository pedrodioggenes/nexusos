import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const itemVariants = cva(
  "flex items-center gap-3 rounded-lg transition-colors",
  {
    variants: {
      variant: {
        default: "hover:bg-accent",
        ghost: "hover:bg-accent/50",
        outline: "border border-border hover:bg-accent",
      },
      size: {
        sm: "px-2 py-1.5 text-sm",
        default: "px-3 py-2",
        lg: "px-4 py-3 text-lg",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: true,
    },
  }
);

interface ItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  label: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      asChild,
      icon,
      label,
      description,
      trailing,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        data-slot="item"
        data-disabled={disabled ? "" : undefined}
        className={cn(
          itemVariants({ variant, size, interactive }),
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        {...props}
      >
        {icon && (
          <span
            data-slot="item-icon"
            className="shrink-0 text-muted-foreground"
          >
            {icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div data-slot="item-label" className="font-medium truncate">
            {label}
          </div>
          {description && (
            <div
              data-slot="item-description"
              className="text-sm text-muted-foreground truncate"
            >
              {description}
            </div>
          )}
        </div>
        {trailing && (
          <span data-slot="item-trailing" className="shrink-0">
            {trailing}
          </span>
        )}
      </Comp>
    );
  }
);
Item.displayName = "Item";

export { Item, itemVariants };
