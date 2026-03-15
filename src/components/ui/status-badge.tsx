import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ContactStatus = 'active' | 'opted_out' | 'blocked';
type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'canceled';

interface StatusBadgeProps {
  status: ContactStatus | CampaignStatus;
  className?: string;
}

const contactStatusLabels: Record<ContactStatus, string> = {
  active: 'Ativo',
  opted_out: 'Opt-out',
  blocked: 'Bloqueado',
};

const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  sent: 'Enviada',
  canceled: 'Cancelada',
};

const statusStyles: Record<ContactStatus | CampaignStatus, string> = {
  active: 'badge-active',
  opted_out: 'badge-opted-out',
  blocked: 'badge-blocked',
  draft: 'badge-draft',
  scheduled: 'badge-scheduled',
  sent: 'badge-sent',
  canceled: 'badge-canceled',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = contactStatusLabels[status as ContactStatus] || campaignStatusLabels[status as CampaignStatus];
  
  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium text-xs uppercase tracking-wide', statusStyles[status], className)}
    >
      {label}
    </Badge>
  );
}
