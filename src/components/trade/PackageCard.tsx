import { motion } from "framer-motion";
import { Calendar, Building2, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { InlineEdit, InlineEditNumber } from "@/components/ui/inline-edit";

interface PackageData {
  id: string;
  name: string;
  status: string;
  supplier_name?: string | null;
  period_start: string;
  period_end: string;
  total_value: number | null;
  totalItems: number;
  completedItems: number;
}

interface PackageCardProps {
  package_: PackageData;
  onClick?: () => void;
  isDragging?: boolean;
  onUpdate?: (id: string, data: Partial<PackageData>) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "text-muted-foreground border-border" },
  active: { label: "Ativo", color: "text-success border-success/30" },
  completed: { label: "Concluído", color: "text-primary border-primary/30" },
};

function formatCurrency(value: number | null): string {
  if (!value) return "R$ 0";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string): string {
  return format(new Date(date), "dd/MM", { locale: ptBR });
}

export function PackageCard({ package_, onClick, isDragging, onUpdate }: PackageCardProps) {
  const config = statusConfig[package_.status] || statusConfig.draft;
  const progress = package_.totalItems > 0 
    ? (package_.completedItems / package_.totalItems) * 100 
    : 0;

  const handleNameUpdate = (newName: string) => {
    onUpdate?.(package_.id, { name: newName });
  };

  const handleValueUpdate = (newValue: number) => {
    onUpdate?.(package_.id, { total_value: newValue });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1
      }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      style={{ willChange: 'transform' }}
      className="animate-safe text-render-fix"
    >
      <Card
        className={cn(
          "cursor-pointer transition-all hover:border-app-trade/30",
          isDragging && "shadow-lg ring-2 ring-app-trade/20"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-md bg-app-trade/10 flex items-center justify-center shrink-0">
              <Package className="h-4 w-4 text-app-trade" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              {onUpdate ? (
                <InlineEdit
                  value={package_.name}
                  onSave={handleNameUpdate}
                  className="text-sm font-medium"
                  maxLength={100}
                />
              ) : (
                <h3 className="text-sm font-medium truncate">{package_.name}</h3>
              )}
            </div>
            <Badge variant="outline" className={cn("text-[10px] shrink-0 ml-1", config.color)}>
              {config.label}
            </Badge>
          </div>

          {/* Info */}
          <div className="space-y-1.5 text-[10px] text-muted-foreground">
            {package_.supplier_name && (
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span className="truncate">{package_.supplier_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDate(package_.period_start)} - {formatDate(package_.period_end)}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Itens</span>
              <span className="font-medium">
                {package_.completedItems}/{package_.totalItems}
              </span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-app-trade rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Value */}
          <div className="mt-2 pt-2 border-t border-border/50">
            {onUpdate ? (
              <InlineEditNumber
                value={package_.total_value || 0}
                onSave={handleValueUpdate}
                className="text-xs font-medium text-app-trade"
                formatDisplay={formatCurrency}
                min={0}
                step={100}
              />
            ) : (
              <span className="text-xs font-medium text-app-trade">
                {formatCurrency(package_.total_value)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
