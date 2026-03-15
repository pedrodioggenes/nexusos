import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarQuickAddProps {
  date: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickCreate: (data: { title: string; type: string; color: string; date: Date }) => void;
  children: React.ReactNode;
}

const TYPE_OPTIONS = [
  { value: "campaign", label: "Campanha", color: "#10B981" },
  { value: "goal", label: "Meta", color: "#8B5CF6" },
  { value: "event", label: "Evento", color: "#F59E0B" },
  { value: "meeting", label: "Reunião", color: "#3B82F6" },
  { value: "deadline", label: "Prazo", color: "#EF4444" },
];

export function CalendarQuickAdd({ date, open, onOpenChange, onQuickCreate, children }: CalendarQuickAddProps) {
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("campaign");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setSelectedType("campaign");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const selectedColor = TYPE_OPTIONS.find(t => t.value === selectedType)?.color || "#10B981";

  const handleSubmit = () => {
    if (!title.trim()) return;
    onQuickCreate({ title: title.trim(), type: selectedType, color: selectedColor, date });
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent 
        className="w-72 p-3" 
        align="start" 
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground capitalize">
            {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </div>

          <Input
            ref={inputRef}
            placeholder="Título do evento..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") onOpenChange(false);
            }}
            className="h-8 text-sm"
          />

          <div className="flex flex-wrap gap-1.5">
            {TYPE_OPTIONS.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  "text-[11px] px-2 py-1 rounded-full border transition-all",
                  selectedType === type.value
                    ? "ring-1 ring-offset-1 ring-offset-background font-medium"
                    : "opacity-60 hover:opacity-100"
                )}
                style={{
                  borderColor: type.color,
                  backgroundColor: selectedType === type.value ? `${type.color}25` : "transparent",
                  color: type.color,
                }}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs bg-module-gestao hover:bg-module-gestao/90"
              onClick={handleSubmit}
              disabled={!title.trim()}
            >
              Criar ↵
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
