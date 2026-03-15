import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  buildUTMUrl,
  useCreateTrackingLink,
  useCampaignTrackingLinks,
  useDeleteTrackingLink,
} from '@/hooks/useCampaignAttribution';
import {
  Link2,
  Copy,
  Trash2,
  Plus,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UTMBuilderDialogProps {
  campaignId: string;
  campaignName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const channelPresets: Record<string, { utm_source: string; utm_medium: string }> = {
  'Instagram': { utm_source: 'instagram', utm_medium: 'social' },
  'Facebook': { utm_source: 'facebook', utm_medium: 'social' },
  'Google Ads': { utm_source: 'google', utm_medium: 'cpc' },
  'WhatsApp': { utm_source: 'whatsapp', utm_medium: 'messaging' },
  'Email': { utm_source: 'email', utm_medium: 'email' },
  'PDV': { utm_source: 'pdv', utm_medium: 'offline' },
  'Panfleto': { utm_source: 'panfleto', utm_medium: 'print' },
  'Outro': { utm_source: '', utm_medium: '' },
};

export function UTMBuilderDialog({ campaignId, campaignName, open, onOpenChange }: UTMBuilderDialogProps) {
  const { toast } = useToast();
  const { data: existingLinks = [] } = useCampaignTrackingLinks(campaignId);
  const createLink = useCreateTrackingLink();
  const deleteLink = useDeleteTrackingLink();

  const [channel, setChannel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const utmCampaign = campaignName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const previewUrl = baseUrl
    ? buildUTMUrl(baseUrl, {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent || undefined,
      })
    : '';

  const handleChannelChange = (ch: string) => {
    setChannel(ch);
    const preset = channelPresets[ch];
    if (preset) {
      setUtmSource(preset.utm_source);
      setUtmMedium(preset.utm_medium);
    }
  };

  const handleCreate = async () => {
    if (!baseUrl || !utmSource || !utmMedium) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: role } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', user!.id)
        .single();

      await createLink.mutateAsync({
        tenant_id: role!.tenant_id!,
        campaign_id: campaignId,
        channel: channel || 'Outro',
        base_url: baseUrl,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent || null,
        utm_term: null,
        final_url: previewUrl,
      });

      toast({ title: 'Link criado', description: 'Link de rastreio gerado com sucesso' });
      setBaseUrl('');
      setUtmContent('');
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar link', variant: 'destructive' });
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copiado!', description: 'Link copiado para a área de transferência' });
  };

  const handleDelete = (id: string) => {
    deleteLink.mutate({ id, campaignId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-app-gestao" />
            Links de Rastreio (UTM)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Channel preset */}
          <div className="space-y-2">
            <Label>Canal</Label>
            <Select value={channel} onValueChange={handleChannelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o canal..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(channelPresets).map(ch => (
                  <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL base */}
          <div className="space-y-2">
            <Label>URL de destino</Label>
            <Input
              placeholder="https://seusite.com.br/oferta"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          {/* UTM params */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Source</Label>
              <Input
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="instagram"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Medium</Label>
              <Input
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="social"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Campaign (auto)</Label>
            <Input value={utmCampaign} readOnly className="h-8 text-xs bg-muted" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Content (opcional)</Label>
            <Input
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
              placeholder="banner-hero"
              className="h-8 text-xs"
            />
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground mb-1">Preview do link:</p>
              <p className="text-xs font-mono break-all">{previewUrl}</p>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!baseUrl || !utmSource || !utmMedium || createLink.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Gerar Link
          </Button>

          <Separator />

          {/* Existing links */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Links Gerados ({existingLinks.length})
            </h3>
            {existingLinks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhum link gerado ainda
              </p>
            ) : (
              <div className="space-y-2">
                {existingLinks.map(link => (
                  <div
                    key={link.id}
                    className="p-3 rounded-lg border border-border/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px]">{link.channel}</Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopy(link.final_url, link.id)}
                        >
                          {copiedId === link.id ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground break-all">
                      {link.final_url}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
