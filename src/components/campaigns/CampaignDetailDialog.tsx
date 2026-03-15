import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';
import { CampaignWithUnits } from '@/hooks/useCampaigns';

interface CampaignDetailDialogProps {
  campaign: CampaignWithUnits | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDetailDialog({ campaign, open, onOpenChange }: CampaignDetailDialogProps) {
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{campaign.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={campaign.status} />
            <span className="text-sm text-muted-foreground capitalize">
              {campaign.message_type}
            </span>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{campaign.content_text}</p>
              {campaign.media_url && (
                <a 
                  href={campaign.media_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-2 block"
                >
                  Ver mídia anexada
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escopo:</span>
                <span>
                  {campaign.unit_scope === 'all_units' 
                    ? 'Todas as Unidades' 
                    : `${campaign.campaign_units.length} unidade(s)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criada em:</span>
                <span>{format(new Date(campaign.created_at), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              {campaign.scheduled_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agendada para:</span>
                  <span>{format(new Date(campaign.scheduled_at), 'dd/MM/yyyy HH:mm')}</span>
                </div>
              )}
              {campaign.sent_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enviada em:</span>
                  <span>{format(new Date(campaign.sent_at), 'dd/MM/yyyy HH:mm')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {campaign.campaign_units.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Unidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {campaign.campaign_units.map(cu => (
                    <span 
                      key={cu.unit_id} 
                      className="bg-muted px-2 py-1 rounded text-xs"
                    >
                      {cu.units?.name || 'Unidade'}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
