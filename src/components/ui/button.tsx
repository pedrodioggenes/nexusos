import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-border bg-transparent hover:bg-secondary text-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-secondary text-muted-foreground hover:text-foreground",
      link: "text-foreground underline-offset-4 hover:underline",
      accent: "bg-accent text-accent-foreground hover:bg-accent/90",
      // Aurora gradient variants - Vibrantes
      aurora: "aurora-gradient text-black font-semibold hover:brightness-110 active:brightness-95",
      "aurora-outline": "border-2 border-transparent aurora-border text-white hover:aurora-gradient hover:text-black",
      // Aurora Soft variants - Apple-like with depth
      "aurora-soft": "aurora-btn-soft text-[hsl(44_50%_65%)] transition-all duration-200",
      "aurora-subtle": "aurora-btn-subtle text-[hsl(44_50%_65%)] transition-all duration-200",
      // Portal variant - Matching module portal aesthetic
      portal: "btn-portal font-medium rounded-lg transition-all duration-200"
    },
    size: {
      default: "h-8 px-3 py-1.5",
      sm: "h-7 rounded-md px-2.5 text-xs",
      lg: "h-9 rounded-lg px-4",
      icon: "h-8 w-8"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";
export { Button, buttonVariants };
