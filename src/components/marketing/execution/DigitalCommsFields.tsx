import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIGITAL_COMMS_TYPES } from "@/config/executionFormProfiles";

interface DigitalCommsFieldsProps {
  metadata: Record<string, unknown>;
  onChange: (metadata: Record<string, unknown>) => void;
  linkUrl: string;
  onLinkChange: (url: string) => void;
}

export function DigitalCommsFields({ metadata, onChange, linkUrl, onLinkChange }: DigitalCommsFieldsProps) {
  const update = (key: string, value: unknown) => onChange({ ...metadata, [key]: value });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={(metadata.comms_type as string) || ""} onValueChange={(v) => update("comms_type", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {DIGITAL_COMMS_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Link</Label>
          <Input placeholder="https://..." value={linkUrl} onChange={(e) => onLinkChange(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Segmento / Público-alvo</Label>
          <Input placeholder="Ex: Clientes VIP, região Sul" value={(metadata.target_audience as string) || ""} onChange={(e) => update("target_audience", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Qtd. envios / acessos</Label>
          <Input type="number" placeholder="0" value={(metadata.send_count as string) || ""} onChange={(e) => update("send_count", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
