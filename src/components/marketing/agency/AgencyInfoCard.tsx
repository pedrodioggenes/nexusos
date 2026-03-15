import { Building2, Mail, Phone, Globe, Calendar, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AgencyPartner } from '@/hooks/useAgencyPartner';
interface AgencyInfoCardProps {
  agency: AgencyPartner;
  onEdit?: () => void;
}
export function AgencyInfoCard({
  agency,
  onEdit
}: AgencyInfoCardProps) {
  const statusLabels: Record<string, string> = {
    active: 'Ativo',
    paused: 'Pausado',
    ended: 'Encerrado'
  };
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ended: 'bg-red-500/20 text-red-400 border-red-500/30'
  };
  return <div className="p-4 rounded-xl bg-card/50 border border-border/50 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {agency.logo_url ? <img src={agency.logo_url} alt={agency.name} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-app-gestao/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-app-gestao" />
            </div>}
          <div>
            <h3 className="font-semibold text-foreground">{agency.name}</h3>
            {agency.cnpj && <p className="text-xs text-muted-foreground">CNPJ: {agency.cnpj}</p>}
          </div>
        </div>
        <Badge className={statusColors[agency.status]}>
          {statusLabels[agency.status]}
        </Badge>
      </div>

      {/* Contact Info */}
      <div className="space-y-2">
        {agency.contact_name && <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{agency.contact_name}</span>
          </div>}
        {agency.contact_email && <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <a href={`mailto:${agency.contact_email}`} className="text-app-gestao hover:underline">
              {agency.contact_email}
            </a>
          </div>}
        {agency.contact_phone && <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <a href={`tel:${agency.contact_phone}`} className="text-foreground hover:text-app-gestao">
              {agency.contact_phone}
            </a>
          </div>}
        {agency.website && <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-app-gestao hover:underline flex items-center gap-1">
              {agency.website.replace(/^https?:\/\//, '')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>}
      </div>

      {/* Contract Info */}
      

      {/* Edit Button */}
      {onEdit && <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
          Editar Dados
        </Button>}
    </div>;
}