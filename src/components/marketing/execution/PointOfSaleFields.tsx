import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveUnits } from "@/hooks/useUnits";

interface PointOfSaleFieldsProps {
  metadata: Record<string, unknown>;
  onChange: (metadata: Record<string, unknown>) => void;
}

export function PointOfSaleFields({ metadata, onChange }: PointOfSaleFieldsProps) {
  const { data: units = [] } = useActiveUnits();
  const selectedStores = (metadata.stores as string[]) || [];

  const update = (key: string, value: unknown) => onChange({ ...metadata, [key]: value });

  const addStore = (storeId: string) => {
    if (!selectedStores.includes(storeId)) {
      update("stores", [...selectedStores, storeId]);
    }
  };

  const removeStore = (storeId: string) => {
    update("stores", selectedStores.filter((s) => s !== storeId));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Lojas impactadas</Label>
        <Select onValueChange={addStore}>
          <SelectTrigger><SelectValue placeholder="Adicionar loja..." /></SelectTrigger>
          <SelectContent>
            {units
              .filter((u) => !selectedStores.includes(u.id))
              .map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
          </SelectContent>
        </Select>
        {selectedStores.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedStores.map((id) => {
              const unit = units.find((u) => u.id === id);
              return (
                <Badge key={id} variant="secondary" className="text-[10px] gap-1">
                  {unit?.name || id}
                  <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => removeStore(id)} />
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Qtd. materiais distribuídos</Label>
          <Input type="number" placeholder="0" value={(metadata.material_count as string) || ""} onChange={(e) => update("material_count", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Início da exposição</Label>
          <Input type="date" value={(metadata.exposure_start as string) || ""} onChange={(e) => update("exposure_start", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Fim da exposição</Label>
          <Input type="date" value={(metadata.exposure_end as string) || ""} onChange={(e) => update("exposure_end", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Local na loja</Label>
        <Input placeholder="Ex: Gôndola principal, vitrine, entrada..." value={(metadata.store_location as string) || ""} onChange={(e) => update("store_location", e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Dificuldades encontradas</Label>
        <Textarea placeholder="Problemas, falta de material, observações..." value={(metadata.difficulties as string) || ""} onChange={(e) => update("difficulties", e.target.value)} className="min-h-[60px] text-xs" />
      </div>
    </div>
  );
}
