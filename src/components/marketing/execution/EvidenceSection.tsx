import { HyperworksEntityLink } from "@/hooks/useExecutionEvidence";
import { useTenantProfiles } from "@/hooks/useTenantProfiles";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ExternalLink, ImageOff, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EvidenceSectionProps {
  evidences: HyperworksEntityLink[];
  isLoading?: boolean;
  label?: string;
}

export function EvidenceSection({ evidences, isLoading, label = "Evidências" }: EvidenceSectionProps) {
  const [open, setOpen] = useState(false);
  const { resolveName } = useTenantProfiles();

  if (isLoading) return null;
  if (!evidences || evidences.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-muted/50 transition-colors">
          <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-90")} />
          <FileText className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-medium text-primary">{label}</span>
          <Badge variant="outline" className="text-[9px] px-1 py-0 ml-1">{evidences.length}</Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-1.5 mt-1 ml-3 border-l-2 border-primary/20 pl-2">
          {evidences.map(ev => (
            <EvidenceCard key={ev.id} evidence={ev} resolveName={resolveName} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function EvidenceCard({ evidence, resolveName }: { evidence: HyperworksEntityLink; resolveName: (id: string | null) => string }) {
  const mediaUrls = evidence.media_urls || [];
  const authorName = resolveName(evidence.created_by);
  const dateStr = format(new Date(evidence.created_at), "dd/MM/yy HH:mm", { locale: ptBR });

  return (
    <div className="rounded-md border border-border/50 bg-card p-2 space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-medium text-foreground truncate">{authorName}</span>
          <span className="text-[9px] text-muted-foreground shrink-0">{dateStr}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 text-[9px] text-primary shrink-0"
          onClick={() => {
            // Navigate to NexusDesk message - for now, scroll to channel
            window.location.hash = `#message-${evidence.message_id}`;
          }}
        >
          <ExternalLink className="h-2.5 w-2.5 mr-0.5" />
          Abrir Post
        </Button>
      </div>

      {/* Excerpt */}
      {evidence.excerpt && (
        <p className="text-[10px] text-muted-foreground line-clamp-2 italic">
          "{evidence.excerpt}"
        </p>
      )}

      {/* Media thumbnails */}
      {mediaUrls.length > 0 ? (
        <div className="flex gap-1 flex-wrap">
          {mediaUrls.map((url, idx) => (
            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={url}
                alt={`Evidência ${idx + 1}`}
                className="h-10 w-10 rounded object-cover border border-border/50 hover:ring-1 hover:ring-primary transition-all"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </a>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <ImageOff className="h-2.5 w-2.5" />
          <span>Sem mídia</span>
        </div>
      )}

      {/* Label badge */}
      {evidence.label && (
        <Badge variant="outline" className="text-[8px] px-1 py-0">{evidence.label}</Badge>
      )}
    </div>
  );
}
