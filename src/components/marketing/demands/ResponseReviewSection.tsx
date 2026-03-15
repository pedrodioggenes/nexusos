import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  User,
  Clock,
  Send,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DemandResponse,
  useDemandResponses,
  useReviewDemandResponse,
  useUpdateDemandResponse,
  responseStatusConfig,
} from "@/hooks/useDemandResponses";
import { isFeatureEnabled } from "@/config/features";
import { Json } from "@/integrations/supabase/types";

interface ResponseReviewSectionProps {
  demandId: string;
}

// Simple text renderer for BlockNote content (fallback for complex content)
function renderBlockNoteContent(content: Json): React.ReactNode {
  if (!content) return <p className="text-muted-foreground italic">Sem conteúdo</p>;
  
  // If content is a string, just render it
  if (typeof content === 'string') {
    return <p>{content}</p>;
  }
  
  // If it's an array of blocks (BlockNote format)
  if (Array.isArray(content)) {
    return (
      <div className="space-y-2">
        {content.map((block: any, index: number) => {
          if (block.type === 'paragraph') {
            const text = block.content?.map((c: any) => c.text || '').join('') || '';
            if (!text) return null;
            return <p key={index} className="text-sm">{text}</p>;
          }
          if (block.type === 'heading') {
            const text = block.content?.map((c: any) => c.text || '').join('') || '';
            const level = block.props?.level || 1;
            const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
            return <HeadingTag key={index} className="font-semibold">{text}</HeadingTag>;
          }
          if (block.type === 'bulletListItem' || block.type === 'numberedListItem') {
            const text = block.content?.map((c: any) => c.text || '').join('') || '';
            return <li key={index} className="text-sm ml-4">{text}</li>;
          }
          if (block.type === 'image') {
            return (
              <img 
                key={index} 
                src={block.props?.url} 
                alt={block.props?.caption || 'Imagem'}
                className="max-w-full h-auto rounded-lg"
              />
            );
          }
          return null;
        })}
      </div>
    );
  }
  
  // Fallback for object content
  return <pre className="text-xs overflow-auto">{JSON.stringify(content, null, 2)}</pre>;
}

function ResponseCard({ 
  response, 
  onReview 
}: { 
  response: DemandResponse; 
  onReview: (id: string, status: 'approved' | 'rejected', notes?: string, markFinal?: boolean) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const [markFinal, setMarkFinal] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const useCompletionCriteria = isFeatureEnabled("DEMANDS_COMPLETION_CRITERIA_V1");
  const statusConfig = responseStatusConfig[response.status];

  const handleReview = async (status: 'approved' | 'rejected') => {
    setIsReviewing(true);
    await onReview(response.id, status, feedback, status === 'approved' ? markFinal : false);
    setIsReviewing(false);
    setFeedback("");
    setMarkFinal(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">Resposta Enviada</CardTitle>
              {response.submitted_at && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(response.submitted_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-xs", statusConfig.bgColor, statusConfig.color)}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        {/* Response Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {renderBlockNoteContent(response.content)}
        </div>

        {/* Show review notes if already reviewed */}
        {response.status !== 'draft' && response.status !== 'submitted' && response.review_notes && (
          <>
            <Separator />
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Feedback do Revisor:
              </p>
              <p className="text-sm">{response.review_notes}</p>
              {response.reviewed_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Revisado em {format(new Date(response.reviewed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          </>
        )}

        {/* Review actions for submitted responses */}
        {response.status === 'submitted' && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Feedback da Revisão (opcional)
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Adicione comentários sobre a entrega..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Mark as final delivery toggle */}
              {useCompletionCriteria && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Switch
                    id={`final-${response.id}`}
                    checked={markFinal}
                    onCheckedChange={setMarkFinal}
                  />
                  <Label htmlFor={`final-${response.id}`} className="text-sm cursor-pointer flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    Marcar como entrega final
                  </Label>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
                  onClick={() => handleReview('rejected')}
                  disabled={isReviewing}
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                  Solicitar Ajustes
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  variant="default"
                  onClick={() => handleReview('approved')}
                  disabled={isReviewing}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ResponseReviewSection({ demandId }: ResponseReviewSectionProps) {
  const { data: responses = [], isLoading } = useDemandResponses(demandId);
  const reviewResponse = useReviewDemandResponse();
  const updateResponse = useUpdateDemandResponse();

  // Filter to show submitted responses first, then others
  const sortedResponses = [...responses].sort((a, b) => {
    const statusOrder = { submitted: 0, rejected: 1, approved: 2, draft: 3 };
    return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
  });

  const handleReview = async (id: string, status: 'approved' | 'rejected', notes?: string, markFinal?: boolean) => {
    await reviewResponse.mutateAsync({ id, status, review_notes: notes });
    // If marking as final, update is_final on the response
    if (markFinal && status === 'approved') {
      await updateResponse.mutateAsync({ id, status: 'approved' } as any);
      // Update is_final via direct supabase call
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase
        .from("demand_responses")
        .update({ is_final: true })
        .eq("id", id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Respostas Enviadas
        </h4>
        <div className="animate-pulse space-y-3">
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const submittedCount = responses.filter(r => r.status === 'submitted').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Respostas Enviadas
          {responses.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {responses.length}
            </Badge>
          )}
        </h4>
        {submittedCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            <Send className="h-3 w-3 mr-1" />
            {submittedCount} aguardando revisão
          </Badge>
        )}
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-6 border rounded-lg bg-muted/30">
          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhuma resposta enviada ainda
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedResponses.map((response) => (
            <ResponseCard
              key={response.id}
              response={response}
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
