import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: string) => void;
  onCancel: () => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  renderEditTrigger?: (options: { onEdit: () => void }) => React.ReactNode;
}

interface EditModeProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

interface ViewModeProps {
  value: string;
  onEdit: () => void;
  className?: string;
  renderEditTrigger?: (options: { onEdit: () => void }) => React.ReactNode;
}

const EditMode: React.FC<EditModeProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = "Enter value...",
  disabled = false,
  maxLength,
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = () => {
    if (inputValue.trim() && inputValue !== value) {
      onSave(inputValue.trim());
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className="flex items-center gap-2 w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className="flex-1 min-w-0 h-8 text-sm focus:ring-0"
        autoFocus
      />
      <Button
        size="sm"
        variant="default"
        onClick={(e) => {
          e.stopPropagation();
          handleSave();
        }}
        disabled={disabled || !inputValue.trim()}
        className="shrink-0 h-7 w-7 p-0"
      >
        <Check size={14} />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
        disabled={disabled}
        className="shrink-0 h-7 w-7 p-0"
      >
        <X size={14} />
      </Button>
    </div>
  );
};

const ViewMode: React.FC<ViewModeProps> = ({
  value,
  onEdit,
  className = "",
  renderEditTrigger,
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className="truncate min-w-0"
        title={value}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        {value}
      </span>
      {renderEditTrigger ? (
        renderEditTrigger({ onEdit })
      ) : (
        <Button
          size="icon"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="opacity-0 group-hover:opacity-100 shrink-0 h-7 w-7"
        >
          <Pencil size={14} className="text-primary" />
        </Button>
      )}
    </div>
  );
};

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  className = "",
  placeholder,
  disabled,
  maxLength,
  renderEditTrigger,
}) => {
  if (isEditing) {
    return (
      <EditMode
        value={value}
        onSave={onSave}
        onCancel={onCancel}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
      />
    );
  }

  return (
    <ViewMode
      value={value}
      onEdit={onEdit}
      className={className}
      renderEditTrigger={renderEditTrigger}
    />
  );
};
