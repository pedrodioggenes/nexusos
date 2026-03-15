import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SOCIAL_VIDEO_TYPES } from "@/config/executionFormProfiles";

interface SocialVideoFieldsProps {
  metadata: Record<string, unknown>;
  onChange: (metadata: Record<string, unknown>) => void;
  linkUrl: string;
  onLinkChange: (url: string) => void;
}

export function SocialVideoFields({ metadata, onChange, linkUrl, onLinkChange }: SocialVideoFieldsProps) {
  const update = (key: string, value: unknown) => onChange({ ...metadata, [key]: value });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo de Vídeo</Label>
          <Select value={(metadata.video_type as string) || ""} onValueChange={(v) => update("video_type", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {SOCIAL_VIDEO_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Link do Vídeo</Label>
          <Input placeholder="https://youtube.com/..." value={linkUrl} onChange={(e) => onLinkChange(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Duração</Label>
          <Input placeholder="5:30" value={(metadata.duration as string) || ""} onChange={(e) => update("duration", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Investimento (R$)</Label>
          <Input type="number" placeholder="0,00" value={(metadata.investment as string) || ""} onChange={(e) => update("investment", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Visualizações</Label>
          <Input type="number" placeholder="0" value={(metadata.views as string) || ""} onChange={(e) => update("views", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
