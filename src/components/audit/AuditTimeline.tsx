import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Upload, 
  Download, 
  LogIn, 
  LogOut,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditTimeline, AuditEntry, auditActionLabels } from '@/hooks/useAuditTimeline';
import { cn } from '@/lib/utils';

interface AuditTimelineProps {
  resourceType: string;
  resourceId: string;
  title?: string;
  maxHeight?: string;
  compact?: boolean;
}

const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Edit2,
  delete: Trash2,
  approve: Check,
  reject: X,
  upload: Upload,
  download: Download,
  login: LogIn,
  logout: LogOut,
};

const severityColors: Record<string, string> = {
  info: 'bg-muted text-muted-foreground',
  warning: 'bg-warning/15 text-warning border-warning/30',
  error: 'bg-destructive/15 text-destructive border-destructive/30',
  critical: 'bg-destructive text-destructive-foreground',
};

function AuditEntryItem({ entry, compact }: { entry: AuditEntry; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const actionConfig = auditActionLabels[entry.action] || { 
    label: entry.action, 
    icon: 'info', 
    color: 'muted' 
  };
  const Icon = actionIcons[entry.action] || User;

  const hasDetails = entry.old_values || entry.new_values || entry.metadata;

  return (
    <div className="relative pl-6 pb-4 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-[9px] top-5 bottom-0 w-px bg-border last:hidden" />
      
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 top-1 h-5 w-5 rounded-full flex items-center justify-center",
        severityColors[entry.severity] || 'bg-muted'
      )}>
        <Icon className="h-3 w-3" />
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[9px] px-1.5 py-0",
              actionConfig.color === 'success' && 'bg-success/15 text-success border-success/30',
              actionConfig.color === 'destructive' && 'bg-destructive/15 text-destructive border-destructive/30',
              actionConfig.color === 'accent' && 'bg-accent/15 text-accent border-accent/30',
              actionConfig.color === 'primary' && 'bg-primary/15 text-primary border-primary/30'
            )}
          >
            {actionConfig.label}
          </Badge>
          
          {entry.resource_name && (
            <span className="text-xs text-foreground font-medium truncate max-w-[150px]">
              {entry.resource_name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {entry.user_email && (
            <>
              <span className="truncate max-w-[120px]">{entry.user_email}</span>
              <span>·</span>
            </>
          )}
          <span>
            {formatDistanceToNow(new Date(entry.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
        </div>

        {/* Expandable details */}
        {hasDetails && !compact && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-[10px] text-muted-foreground px-1 -ml-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Ocultar detalhes
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Ver detalhes
                </>
              )}
            </Button>

            {expanded && (
              <div className="mt-2 p-2 rounded bg-muted/30 border border-border text-[10px] space-y-2">
                {entry.old_values && Object.keys(entry.old_values).length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Antes:</span>
                    <pre className="mt-1 p-1.5 bg-muted rounded overflow-x-auto">
                      {JSON.stringify(entry.old_values, null, 2)}
                    </pre>
                  </div>
                )}
                {entry.new_values && Object.keys(entry.new_values).length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Depois:</span>
                    <pre className="mt-1 p-1.5 bg-muted rounded overflow-x-auto">
                      {JSON.stringify(entry.new_values, null, 2)}
                    </pre>
                  </div>
                )}
                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Metadata:</span>
                    <pre className="mt-1 p-1.5 bg-muted rounded overflow-x-auto">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function AuditTimeline({ 
  resourceType, 
  resourceId, 
  title = 'Histórico',
  maxHeight = '300px',
  compact = false
}: AuditTimelineProps) {
  const { data: entries, isLoading, error } = useAuditTimeline({ 
    resourceType, 
    resourceId 
  });

  if (isLoading) {
    return (
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-destructive">Erro ao carregar histórico</p>
        </CardContent>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card className="card-base">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-muted-foreground">Nenhum registro encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-base">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium">{title}</CardTitle>
          <Badge variant="outline" className="text-[9px]">
            {entries.length} evento{entries.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ScrollArea style={{ maxHeight }} className="pr-2">
          <div className="space-y-0">
            {entries.map((entry) => (
              <AuditEntryItem key={entry.id} entry={entry} compact={compact} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default AuditTimeline;
