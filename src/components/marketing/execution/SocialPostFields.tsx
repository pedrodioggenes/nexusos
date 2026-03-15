import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOCIAL_POST_CONTENT_TYPES } from "@/config/executionFormProfiles";

interface SocialPostFieldsProps {
  metadata: Record<string, unknown>;
  onChange: (metadata: Record<string, unknown>) => void;
  linkUrl: string;
  onLinkChange: (url: string) => void;
}

export function SocialPostFields({ metadata, onChange, linkUrl, onLinkChange }: SocialPostFieldsProps) {
  const update = (key: string, value: unknown) => onChange({ ...metadata, [key]: value });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo de Conteúdo</Label>
          <Select value={(metadata.content_type as string) || ""} onValueChange={(v) => update("content_type", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {SOCIAL_POST_CONTENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Link do Post</Label>
          <Input placeholder="https://..." value={linkUrl} onChange={(e) => onLinkChange(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Hashtags principais</Label>
        <Input placeholder="#marketing #campanha" value={(metadata.hashtags as string) || ""} onChange={(e) => update("hashtags", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Investimento em mídia (R$)</Label>
          <Input type="number" placeholder="0,00" value={(metadata.investment as string) || ""} onChange={(e) => update("investment", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Alcance obtido</Label>
          <Input type="number" placeholder="0" value={(metadata.reach as string) || ""} onChange={(e) => update("reach", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
