import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPERATIONAL_STATUS_OPTIONS } from "@/config/executionFormProfiles";

interface OperationalFieldsProps {
  metadata: Record<string, unknown>;
  onChange: (metadata: Record<string, unknown>) => void;
}

export function OperationalFields({ metadata, onChange }: OperationalFieldsProps) {
  const update = (key: string, value: unknown) => onChange({ ...metadata, [key]: value });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Responsável pela ação</Label>
          <Input placeholder="Nome do responsável" value={(metadata.responsible as string) || ""} onChange={(e) => update("responsible", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Custo estimado (R$)</Label>
          <Input type="number" placeholder="0,00" value={(metadata.cost as string) || ""} onChange={(e) => update("cost", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Prazo de conclusão</Label>
          <Input type="date" value={(metadata.deadline as string) || ""} onChange={(e) => update("deadline", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Status da entrega</Label>
          <Select value={(metadata.delivery_status as string) || ""} onValueChange={(v) => update("delivery_status", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {OPERATIONAL_STATUS_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Descrição da entrega</Label>
        <Textarea placeholder="Descreva o que foi entregue ou produzido..." value={(metadata.delivery_description as string) || ""} onChange={(e) => update("delivery_description", e.target.value)} rows={2} />
      </div>
    </div>
  );
}
