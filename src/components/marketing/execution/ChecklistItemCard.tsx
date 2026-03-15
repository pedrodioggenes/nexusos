import { ExecutionItem } from "@/hooks/useRetailExecution";
import { useExecutionEvidenceForItem } from "@/hooks/useExecutionEvidence";
import { EvidenceSection } from "@/components/marketing/execution/EvidenceSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, MinusCircle, Camera, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { ITEM_STATUS_OPTIONS } from "@/hooks/useRetailExecution";

interface ChecklistItemCardProps {
  item: ExecutionItem;
  onStatusChange: (itemId: string, status: string) => void;
  onAddEvidence: (itemId: string) => void;
  onComprovar?: (itemId: string) => void;
}

export function ChecklistItemCard({ item, onStatusChange, onAddEvidence, onComprovar }: ChecklistItemCardProps) {
  const { data: itemEvidences = [], isLoading: itemEvLoading } = useExecutionEvidenceForItem(item.id);
  const evidences = Array.isArray(item.evidence_urls) ? item.evidence_urls : [];

  return (
    <Card className="border-border/50">
      <CardContent className="p-2.5">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-medium">{item.title}</span>
              {item.required && <Badge variant="outline" className="text-[9px] px-1 py-0">obrigatório</Badge>}
            </div>
            {item.notes && <p className="text-[11px] text-muted-foreground">{item.notes}</p>}
            {evidences.length > 0 && (
              <div className="flex gap-1 mt-1">
                {evidences.map((url: string, idx: number) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary underline">
                    Evidência {idx + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost" size="sm"
              className={cn("h-7 w-7 p-0", item.status === 'ok' && "text-green-600 bg-green-600/10")}
              onClick={() => onStatusChange(item.id, item.status === 'ok' ? 'pending' : 'ok')}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm"
              className={cn("h-7 w-7 p-0", item.status === 'not_ok' && "text-destructive bg-destructive/10")}
              onClick={() => onStatusChange(item.id, item.status === 'not_ok' ? 'pending' : 'not_ok')}
            >
              <XCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" size="sm"
              className={cn("h-7 w-7 p-0", item.status === 'na' && "text-muted-foreground bg-muted")}
              onClick={() => onStatusChange(item.id, item.status === 'na' ? 'pending' : 'na')}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onAddEvidence(item.id)}>
              <Camera className="h-4 w-4" />
            </Button>
            {onComprovar && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-primary" onClick={() => onComprovar(item.id)}>
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        {/* NexusDesk linked evidences */}
        {itemEvidences.length > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-border/30">
            <EvidenceSection evidences={itemEvidences} isLoading={itemEvLoading} label="Evidências vinculadas" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
