import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  onOpenModal?: () => void;
  mobileFull?: boolean;
}

export default function SearchInput({
  placeholder = "Search...",
  ariaLabel = "Open search",
  className,
  onOpenModal,
  mobileFull = false,
}: SearchInputProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const shortcutText = isMac ? "⌘K" : "Ctrl+K";

  return (
    <>
      {/* Mobile icon-only or full-width button */}
      {mobileFull ? (
        <Button
          onClick={onOpenModal}
          variant="ghost"
          size="sm"
          className={cn(
            "sm:hidden relative w-full h-8 px-3 text-sm justify-start",
            "bg-secondary border border-border rounded-full",
            "hover:bg-muted",
            "focus:outline-none",
            className
          )}
          aria-label={ariaLabel}
        >
          <Search className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
          <span className="flex-1 text-muted-foreground truncate">{placeholder}</span>
        </Button>
      ) : (
        <Button
          onClick={onOpenModal}
          variant="ghost"
          size="icon"
          aria-label={ariaLabel}
          className={cn("sm:hidden", className)}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
        </Button>
      )}

      {/* sm and up: pill with placeholder and shortcut */}
      <Button
        onClick={onOpenModal}
        variant="ghost"
        size="sm"
        className={cn(
          "hidden sm:flex relative items-center justify-between flex-1 min-w-0 h-8 px-3 text-sm",
          "bg-secondary border border-border rounded-full",
          "hover:bg-muted",
          "focus:outline-none",
          className
        )}
        aria-label={ariaLabel}
      >
        <div className="flex items-center gap-2 flex-1 text-start justify-start min-w-0">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 text-muted-foreground truncate">{placeholder}</span>
        </div>
        <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-card text-muted-foreground rounded-md border border-border">
          {shortcutText}
        </kbd>
      </Button>
    </>
  );
}
