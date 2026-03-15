import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./scroll-area";

const sidebar2Variants = cva(
  "flex flex-col border-r bg-background transition-all duration-300",
  {
    variants: {
      variant: {
        default: "",
        floating: "m-2 rounded-2xl border shadow-lg",
        inset: "border-0 bg-muted/30",
      },
      collapsed: {
        true: "w-14",
        false: "w-60",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsed: false,
    },
  }
);

interface Sidebar2ContextValue {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  variant: "default" | "floating" | "inset";
}

const Sidebar2Context = React.createContext<Sidebar2ContextValue | null>(null);

export function useSidebar2() {
  const context = React.useContext(Sidebar2Context);
  if (!context) {
    throw new Error("useSidebar2 must be used within a Sidebar2Provider");
  }
  return context;
}

interface Sidebar2ProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  variant?: "default" | "floating" | "inset";
}

export function Sidebar2Provider({
  children,
  defaultCollapsed = false,
  variant = "default",
}: Sidebar2ProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <Sidebar2Context.Provider value={{ collapsed, setCollapsed, variant }}>
      {children}
    </Sidebar2Context.Provider>
  );
}

interface Sidebar2Props
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "dir">,
    VariantProps<typeof sidebar2Variants> {}

const Sidebar2 = React.forwardRef<HTMLDivElement, Sidebar2Props>(
  ({ className, variant, collapsed, ...props }, ref) => {
    const context = React.useContext(Sidebar2Context);
    const isCollapsed = collapsed ?? context?.collapsed ?? false;
    const sidebarVariant = variant ?? context?.variant ?? "default";

    return (
      <aside
        ref={ref}
        data-slot="sidebar2"
        data-collapsed={isCollapsed}
        className={cn(
          sidebar2Variants({ variant: sidebarVariant, collapsed: isCollapsed }),
          className
        )}
        {...props}
      />
    );
  }
);
Sidebar2.displayName = "Sidebar2";

const Sidebar2Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar2-header"
    className={cn("flex h-14 items-center px-4 border-b", className)}
    {...props}
  />
));
Sidebar2Header.displayName = "Sidebar2Header";

interface Sidebar2ContentProps {
  className?: string;
  children?: React.ReactNode;
}

const Sidebar2Content = React.forwardRef<HTMLDivElement, Sidebar2ContentProps>(
  ({ className, children }, ref) => (
    <ScrollArea ref={ref} data-slot="sidebar2-content" className={cn("flex-1", className)}>
      <div className="p-2">{children}</div>
    </ScrollArea>
  )
);
Sidebar2Content.displayName = "Sidebar2Content";

const Sidebar2Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar2-footer"
    className={cn("mt-auto p-4 border-t", className)}
    {...props}
  />
));
Sidebar2Footer.displayName = "Sidebar2Footer";

const Sidebar2Group = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar2-group"
    className={cn("space-y-1", className)}
    {...props}
  />
));
Sidebar2Group.displayName = "Sidebar2Group";

const Sidebar2GroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(Sidebar2Context);
  const isCollapsed = context?.collapsed ?? false;

  if (isCollapsed) return null;

  return (
    <div
      ref={ref}
      data-slot="sidebar2-group-label"
      className={cn(
        "px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
Sidebar2GroupLabel.displayName = "Sidebar2GroupLabel";

interface Sidebar2ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}

const Sidebar2Item = React.forwardRef<HTMLDivElement, Sidebar2ItemProps>(
  ({ className, icon, active, disabled, children, ...props }, ref) => {
    const context = React.useContext(Sidebar2Context);
    const isCollapsed = context?.collapsed ?? false;

    return (
      <div
        ref={ref}
        data-slot="sidebar2-item"
        data-active={active}
        data-disabled={disabled}
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors cursor-pointer",
          "hover:bg-accent hover:text-accent-foreground",
          active && "bg-accent text-accent-foreground font-medium",
          disabled && "opacity-50 pointer-events-none",
          isCollapsed && "justify-center px-0",
          className
        )}
        {...props}
      >
        {icon && (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        )}
        {!isCollapsed && <span className="truncate">{children}</span>}
      </div>
    );
  }
);
Sidebar2Item.displayName = "Sidebar2Item";

export {
  Sidebar2,
  Sidebar2Header,
  Sidebar2Content,
  Sidebar2Footer,
  Sidebar2Group,
  Sidebar2GroupLabel,
  Sidebar2Item,
  sidebar2Variants,
};
