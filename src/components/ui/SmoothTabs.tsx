import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SmoothTabItem {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  content?: React.ReactNode;
  cardContent?: React.ReactNode;
}

interface SmoothTabsProps {
  items: SmoothTabItem[];
  defaultTabId?: string;
  value?: string;
  onValueChange?: (tabId: string) => void;
  onChange?: (tabId: string) => void;
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  showCardContent?: boolean;
  cardHeight?: string;
  tabsPosition?: "top" | "bottom";
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    filter: "blur(8px)",
    position: "absolute" as const,
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    position: "relative" as const,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    filter: "blur(8px)",
    position: "absolute" as const,
  }),
};

const transition = {
  duration: 0.4,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
};

export function SmoothTabs({
  items,
  defaultTabId,
  value: controlledValue,
  onValueChange,
  onChange,
  className,
  containerClassName,
  contentClassName,
  showCardContent = true,
  cardHeight = "200px",
  tabsPosition = "bottom",
}: SmoothTabsProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<string>(
    controlledValue || defaultTabId || items[0]?.id || ""
  );
  const selected = isControlled ? controlledValue : internalValue;

  const [direction, setDirection] = React.useState(0);
  const [dimensions, setDimensions] = React.useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const buttonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const updateDimensions = () => {
      const selectedButton = buttonRefs.current.get(selected);
      const container = containerRef.current;
      if (selectedButton && container) {
        const rect = selectedButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
          offsetX: rect.left - containerRect.left,
          offsetY: rect.top - containerRect.top,
        });
      }
    };

    requestAnimationFrame(updateDimensions);
    window.addEventListener("resize", updateDimensions);

    const container = containerRef.current;
    let resizeObserver: ResizeObserver | null = null;
    if (container) {
      resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateDimensions));
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
        resizeObserver.disconnect();
      }
    };
  }, [selected]);

  const handleTabClick = (tabId: string) => {
    const currentIndex = items.findIndex((item) => item.id === selected);
    const newIndex = items.findIndex((item) => item.id === tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    if (!isControlled) setInternalValue(tabId);
    onValueChange?.(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tabId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabClick(tabId);
    }
  };

  const getTabWidth = (itemCount: number) => {
    switch (itemCount) {
      case 1: return "w-[48%] sm:w-[100%]";
      case 2: return "w-[48%] sm:w-[48%]";
      case 3: return "w-[48%] sm:w-[32%]";
      case 4: return "w-[48%] sm:w-[23%]";
      case 5: return "w-[48%] sm:w-[18%]";
      default: return "w-[48%] sm:w-auto";
    }
  };

  const selectedItem = items.find((item) => item.id === selected);

  const TabsToolbar = (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Smooth tabs"
      className={cn(
        "flex flex-wrap items-center gap-2 p-1 relative",
        "bg-[var(--surface,hsl(var(--card)))] w-full",
        "rounded-2xl border border-border/60",
        containerClassName
      )}
    >
      <motion.div
        className="absolute rounded-lg z-[1] bg-secondary"
        initial={false}
        animate={{
          width: Math.max(dimensions.width - 8, 0),
          height: Math.max(dimensions.height - 8, 0),
          left: dimensions.offsetX + 4,
          top: dimensions.offsetY + 4,
          opacity: 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{ left: dimensions.offsetX + 4, top: dimensions.offsetY + 4 }}
      />

      {items.map((item) => {
        const isSelected = selected === item.id;
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            ref={(el) => {
              if (el) buttonRefs.current.set(item.id, el);
              else buttonRefs.current.delete(item.id);
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={`panel-${item.id}`}
            id={`tab-${item.id}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => handleTabClick(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 z-[2]",
              "text-sm font-medium transition-opacity duration-300",
              "outline-none focus-visible:outline-none focus-visible:ring-0",
              "truncate text-foreground",
              getTabWidth(items.length),
              isSelected ? "opacity-100" : "opacity-75 hover:opacity-100"
            )}
            style={{ backgroundColor: "transparent" }}
          >
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span className="truncate">{item.title}</span>
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {tabsPosition === "top" && TabsToolbar}

      {showCardContent && (
        <div className={cn("flex-1 relative", tabsPosition === "top" ? "mt-4" : "mb-4")}>
          <div
            className={cn(
              "bg-card border border-border/60 rounded-lg w-full relative overflow-hidden",
              contentClassName
            )}
            style={{ height: cardHeight }}
          >
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.div
                key={`card-${selected}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="absolute inset-0 w-full h-full will-change-transform"
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              >
                {selectedItem?.cardContent || selectedItem?.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {tabsPosition === "bottom" && TabsToolbar}
    </div>
  );
}

export default SmoothTabs;
