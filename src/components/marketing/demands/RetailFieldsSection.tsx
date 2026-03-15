/**
 * Shared retail fields section for demand forms.
 * Uses "Categorias de Execução" instead of the old "Canais" concept.
 * Renders inner content only (no card wrapper) — parent provides the card.
 */
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DELIVERABLE_KINDS,
  EXECUTION_CATEGORIES,
  CATEGORY_GROUPS,
} from "@/config/demandRetailFields";
import { useActiveUnits } from "@/hooks/useUnits";

interface RetailFieldsSectionProps {
  deliverableKind: string;
  onDeliverableKindChange: (v: string) => void;
  destinationScope: string;
  onDestinationScopeChange: (v: string) => void;
  channels: string[];
  onChannelsChange: (v: string[]) => void;
}

export function RetailFieldsSection({
  deliverableKind,
  onDeliverableKindChange,
  destinationScope,
  onDestinationScopeChange,
  channels,
  onChannelsChange,
}: RetailFieldsSectionProps) {
  const { data: activeUnits } = useActiveUnits();

  const toggleChannel = (ch: string) => {
    if (channels.includes(ch)) {
      onChannelsChange(channels.filter((c) => c !== ch));
    } else {
      onChannelsChange([...channels, ch]);
    }
  };

  const groups = ["digital", "direto", "operacional"] as const;

  return (
    <div className="space-y-4">
      {/* Deliverable Kind & Destination */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Tipo de Entregável</Label>
          <Select value={deliverableKind} onValueChange={onDeliverableKindChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecione o entregável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {DELIVERABLE_KINDS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  <span className="flex items-center gap-2">
                    <span>{d.icon}</span>
                    {d.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Destino</Label>
          <Select value={destinationScope} onValueChange={onDestinationScopeChange}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Selecione o destino" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Não definido</SelectItem>
              <SelectItem value="rede">
                <span className="flex items-center gap-2">
                  <span>🏢</span>
                  Toda a Rede
                </span>
              </SelectItem>
              {activeUnits?.map((unit) => (
                <SelectItem key={unit.id} value={`loja:${unit.id}`}>
                  <span className="flex items-center gap-2">
                    <span>📍</span>
                    {unit.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Execution Categories — grouped chips */}
      <div className="space-y-3">
        <Label className="text-sm flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5" />
          Categorias de Execução
        </Label>

        {groups.map((groupKey) => {
          const items = EXECUTION_CATEGORIES.filter((c) => c.group === groupKey);
          return (
            <div key={groupKey} className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {CATEGORY_GROUPS[groupKey]}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {items.map((ch) => {
                  const active = channels.includes(ch.value);
                  return (
                    <button
                      key={ch.value}
                      type="button"
                      onClick={() => toggleChannel(ch.value)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all",
                        active
                          ? "bg-app-gestao/10 border-app-gestao/40 text-app-gestao font-medium"
                          : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span>{ch.icon}</span>
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {channels.length > 0 && (
          <p className="text-[10px] text-muted-foreground">
            {channels.length} categoria{channels.length !== 1 ? "s" : ""} selecionada{channels.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
