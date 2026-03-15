import { useState } from 'react';
import { Plus, Search, Filter, FileText, Clock, Send, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  type AgencyBriefing, 
  BRIEFING_TYPE_LABELS, 
  BRIEFING_STATUS_LABELS,
  BRIEFING_PRIORITY_LABELS,
} from '@/hooks/useAgencyBriefings';

interface BriefingHubProps {
  briefings: AgencyBriefing[];
  onCreateNew: () => void;
  onSelect: (briefing: AgencyBriefing) => void;
  onSend: (id: string) => void;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  draft: FileText,
  sent: Send,
  received: CheckCircle,
  in_production: Clock,
  delivered: CheckCircle,
  cancelled: FileText,
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-500/20 text-blue-400',
  received: 'bg-purple-500/20 text-purple-400',
  in_production: 'bg-amber-500/20 text-amber-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-amber-500/20 text-amber-400',
  urgent: 'bg-red-500/20 text-red-400',
};

export function BriefingHub({ briefings, onCreateNew, onSelect, onSend }: BriefingHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredBriefings = briefings.filter(b => {
    const matchesSearch = !searchQuery || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.objective?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['draft', 'sent', 'in_production', 'delivered'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar briefings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={statusFilter === null ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(null)}
            >
              Todos
            </Button>
            {statuses.map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {BRIEFING_STATUS_LABELS[status as keyof typeof BRIEFING_STATUS_LABELS]}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={onCreateNew} className="bg-app-gestao hover:bg-app-gestao/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Briefing
        </Button>
      </div>

      {/* Briefings List */}
      <div className="space-y-2">
        {filteredBriefings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum briefing encontrado</p>
          </div>
        ) : (
          filteredBriefings.map(briefing => {
            const StatusIcon = STATUS_ICONS[briefing.status];
            return (
              <div
                key={briefing.id}
                className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-app-gestao/50 transition-colors cursor-pointer group"
                onClick={() => onSelect(briefing)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate">
                        {briefing.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {BRIEFING_TYPE_LABELS[briefing.type]}
                      </Badge>
                    </div>
                    {briefing.objective && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {briefing.objective}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {briefing.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(briefing.deadline), "dd MMM", { locale: ptBR })}
                        </span>
                      )}
                      {briefing.budget && (
                        <span>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL',
                            maximumFractionDigits: 0
                          }).format(briefing.budget)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", PRIORITY_COLORS[briefing.priority])}>
                      {BRIEFING_PRIORITY_LABELS[briefing.priority]}
                    </Badge>
                    <Badge className={cn("text-xs", STATUS_COLORS[briefing.status])}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {BRIEFING_STATUS_LABELS[briefing.status]}
                    </Badge>
                    {briefing.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSend(briefing.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
