import { 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  AlertTriangle, 
  GitBranch,
  MessageSquare,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AgencyCommunication } from '@/hooks/useAgencyPartner';

interface CommunicationTimelineProps {
  communications: AgencyCommunication[];
  onAddNew?: () => void;
}

const TYPE_CONFIG: Record<string, { 
  icon: React.ElementType; 
  label: string;
  color: string;
}> = {
  meeting: { 
    icon: Calendar, 
    label: 'Reunião',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  call: { 
    icon: Phone, 
    label: 'Ligação',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  email: { 
    icon: Mail, 
    label: 'E-mail',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  decision: { 
    icon: FileText, 
    label: 'Decisão',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  escalation: { 
    icon: AlertTriangle, 
    label: 'Escalação',
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  scope_change: { 
    icon: GitBranch, 
    label: 'Mudança de Escopo',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  note: { 
    icon: MessageSquare, 
    label: 'Nota',
    color: 'bg-muted text-muted-foreground border-border'
  },
};

export function CommunicationTimeline({ communications, onAddNew }: CommunicationTimelineProps) {
  if (communications.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Nenhuma comunicação registrada</p>
        <p className="text-xs text-muted-foreground mt-1">
          Registre reuniões, decisões e interações importantes
        </p>
        {onAddNew && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={onAddNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Comunicação
          </Button>
        )}
      </div>
    );
  }

  // Group by date
  const groupedByDate = communications.reduce((groups, comm) => {
    const date = format(new Date(comm.created_at), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(comm);
    return groups;
  }, {} as Record<string, AgencyCommunication[]>);

  return (
    <div className="space-y-6">
      {/* Add button */}
      {onAddNew && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAddNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Comunicação
          </Button>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, comms]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground px-2">
                {format(new Date(date), "dd 'de' MMMM", { locale: ptBR })}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Communications for this date */}
            <div className="space-y-3">
              {comms.map(comm => {
                const config = TYPE_CONFIG[comm.type];
                const Icon = config.icon;

                return (
                  <div 
                    key={comm.id}
                    className="flex gap-3"
                  >
                    {/* Icon */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border shrink-0",
                      config.color
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {comm.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comm.created_at), "HH:mm")}
                        </span>
                      </div>
                      
                      {comm.content && (
                        <p className="text-sm text-muted-foreground">
                          {comm.content}
                        </p>
                      )}

                      {/* Participants */}
                      {comm.participants.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <span>Participantes:</span>
                          <span>{comm.participants.join(', ')}</span>
                        </div>
                      )}

                      {/* Attachments */}
                      {comm.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {comm.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground"
                            >
                              📎 {att.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
