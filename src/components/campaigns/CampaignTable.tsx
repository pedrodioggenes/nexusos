import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Send, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { CampaignWithUnits } from '@/hooks/useCampaigns';
import { TableSkeleton } from '@/components/ui/loading-skeleton';

interface CampaignTableProps {
  campaigns: CampaignWithUnits[] | undefined;
  isLoading: boolean;
  onView: (campaign: CampaignWithUnits) => void;
  onSend: (campaignId: string) => void;
}

export function CampaignTable({ campaigns, isLoading, onView, onSend }: CampaignTableProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-4">
        <TableSkeleton rows={5} columns={7} />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Escopo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criada em</TableHead>
            <TableHead>Enviada em</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns?.map(campaign => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.title}</TableCell>
              <TableCell className="capitalize">{campaign.message_type}</TableCell>
              <TableCell>
                {campaign.unit_scope === 'all_units' ? 'Todas' : 
                 campaign.unit_scope === 'single_unit' ? '1 unidade' : 
                 `${campaign.campaign_units.length} unidades`}
              </TableCell>
              <TableCell><StatusBadge status={campaign.status} /></TableCell>
              <TableCell>{format(new Date(campaign.created_at), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{campaign.sent_at ? format(new Date(campaign.sent_at), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(campaign)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {campaign.status === 'draft' && (
                    <Button variant="ghost" size="icon" onClick={() => onSend(campaign.id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && (!campaigns || campaigns.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Nenhuma campanha encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
