import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Check, X, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  showEditIcon?: boolean;
  maxLength?: number;
}

export function InlineEdit({
  value,
  onSave,
  className,
  inputClassName,
  placeholder = "Digite...",
  disabled = false,
  showEditIcon = true,
  maxLength,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            "h-6 text-xs px-1.5 py-0.5 min-w-0",
            inputClassName
          )}
        />
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-5 w-5 text-success hover:text-success hover:bg-success/10"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 cursor-pointer rounded px-0.5 -mx-0.5 hover:bg-muted/50 transition-colors min-w-0 overflow-hidden",
        disabled && "cursor-default hover:bg-transparent",
        className
      )}
      onClick={handleClick}
    >
      <span className="truncate min-w-0 flex-1">{value || placeholder}</span>
      {showEditIcon && !disabled && (
        <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </div>
  );
}

interface InlineEditNumberProps {
  value: number;
  onSave: (value: number) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  showEditIcon?: boolean;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  formatDisplay?: (value: number) => string;
}

export function InlineEditNumber({
  value,
  onSave,
  className,
  inputClassName,
  placeholder = "0",
  disabled = false,
  showEditIcon = true,
  prefix,
  suffix,
  min,
  max,
  step = 1,
  formatDisplay,
}: InlineEditNumberProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue !== value) {
      let finalValue = numValue;
      if (min !== undefined) finalValue = Math.max(min, finalValue);
      if (max !== undefined) finalValue = Math.min(max, finalValue);
      onSave(finalValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const displayValue = formatDisplay ? formatDisplay(value) : value.toString();

  if (isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {prefix && <span className="text-muted-foreground text-[10px]">{prefix}</span>}
        <Input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cn(
            "h-6 text-xs px-1.5 py-0.5 w-20",
            inputClassName
          )}
        />
        {suffix && <span className="text-muted-foreground text-[10px]">{suffix}</span>}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-5 w-5 text-success hover:text-success hover:bg-success/10"
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 cursor-pointer rounded px-0.5 -mx-0.5 hover:bg-muted/50 transition-colors",
        disabled && "cursor-default hover:bg-transparent",
        className
      )}
      onClick={handleClick}
    >
      <span>{prefix}{displayValue}{suffix}</span>
      {showEditIcon && !disabled && (
        <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </div>
  );
}
