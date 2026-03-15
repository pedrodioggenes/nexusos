import { useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  Play,
  Send,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MarketingDemand,
  demandStatusConfig,
  demandPriorityConfig,
  useUpdateDemand,
} from "@/hooks/useMarketingDemands";
import {
  useMyDemandResponse,
  useCreateDemandResponse,
  useUpdateDemandResponse,
  responseStatusConfig,
} from "@/hooks/useDemandResponses";
import { DemandRichEditor, DemandContentViewer } from "./DemandRichEditor";
import { Json } from "@/integrations/supabase/types";

interface ColaboradorDemandSheetProps {
  demand: MarketingDemand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColaboradorDemandSheet({ demand, open, onOpenChange }: ColaboradorDemandSheetProps) {
  const [responseContent, setResponseContent] = useState<Json>([]);
  const [activeTab, setActiveTab] = useState<string>("details");
  
  const updateDemand = useUpdateDemand();
  const { data: myResponse, isLoading: responseLoading } = useMyDemandResponse(demand?.id);
  const createResponse = useCreateDemandResponse();
  const updateResponse = useUpdateDemandResponse();

  const handleContentChange = useCallback((content: unknown[]) => {
    setResponseContent(content as Json);
  }, []);

  if (!demand) return null;

  const priorityConfig = demandPriorityConfig[demand.priority];
  const statusConfig = demandStatusConfig[demand.status];
  const responseStatusCfg = myResponse ? responseStatusConfig[myResponse.status] : null;

  const isOverdue = demand.due_date && 
    new Date(demand.due_date) < new Date() && 
    !['completed', 'cancelled', 'approved'].includes(demand.status);

  const canStart = demand.status === 'open';
  const canRespond = ['in_progress', 'review'].includes(demand.status) && 
    (!myResponse || myResponse.status === 'draft' || myResponse.status === 'rejected');
  const isCompleted = ['completed', 'approved'].includes(demand.status);

  const handleStartDemand = async () => {
    await updateDemand.mutateAsync({ id: demand.id, status: 'in_progress' });
  };

  const handleSaveDraft = async () => {
    if (myResponse) {
      await updateResponse.mutateAsync({
        id: myResponse.id,
        content: responseContent,
      });
    } else {
      await createResponse.mutateAsync({
        demand_id: demand.id,
        content: responseContent,
      });
    }
  };

  const handleSubmitResponse = async () => {
    if (myResponse) {
      await updateResponse.mutateAsync({
        id: myResponse.id,
        content: responseContent,
        status: 'submitted',
      });
      // Also update demand status to review
      await updateDemand.mutateAsync({ id: demand.id, status: 'review' });
    } else {
      const response = await createResponse.mutateAsync({
        demand_id: demand.id,
        content: responseContent,
      });
      if (response) {
        await updateResponse.mutateAsync({
          id: response.id,
          status: 'submitted',
        });
        await updateDemand.mutateAsync({ id: demand.id, status: 'review' });
      }
    }
  };

  const isSaving = createResponse.isPending || updateResponse.isPending;

  // Parse description content
  const descriptionContent = (() => {
    if (!demand.description) return null;
    if (typeof demand.description === 'string') {
      try {
        return JSON.parse(demand.description);
      } catch {
        return null;
      }
    }
    return demand.description as unknown[];
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 pr-8">
              <SheetTitle className="text-lg leading-tight">
                {demand.title}
              </SheetTitle>
              <SheetDescription>
                Criado em {format(new Date(demand.created_at), "dd 'de' MMMM", { locale: ptBR })}
              </SheetDescription>
            </div>
          </div>

          {/* Status & Priority badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="outline" className={cn("text-xs", statusConfig.bgColor, statusConfig.color)}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className={cn("text-xs", priorityConfig.bgColor, priorityConfig.color)}>
              {priorityConfig.label}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Atrasado
              </Badge>
            )}
            {responseStatusCfg && (
              <Badge variant="outline" className={cn("text-xs", responseStatusCfg.bgColor, responseStatusCfg.color)}>
                Resposta: {responseStatusCfg.label}
              </Badge>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 pt-3 text-sm text-muted-foreground">
            {demand.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className={isOverdue ? "text-destructive" : ""}>
                  {format(new Date(demand.due_date), "dd/MM/yyyy")}
                </span>
              </div>
            )}
            {demand.estimated_hours && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{demand.estimated_hours}h estimadas</span>
              </div>
            )}
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="response">
              Minha Resposta
              {myResponse && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {responseStatusConfig[myResponse.status].label}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
              {descriptionContent ? (
                <DemandContentViewer content={descriptionContent} />
              ) : (
                <p className="text-sm">
                  {typeof demand.description === 'string' ? demand.description : 'Sem descrição'}
                </p>
              )}
            </div>

            {/* Start button for pending demands */}
            {canStart && (
              <Button 
                onClick={handleStartDemand} 
                className="w-full gap-2"
                disabled={updateDemand.isPending}
              >
                {updateDemand.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Iniciar Demanda
              </Button>
            )}
          </TabsContent>

          {/* Response Tab */}
          <TabsContent value="response" className="mt-4 space-y-4">
            {responseLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : isCompleted ? (
              <div className="space-y-4">
              <div className="bg-primary/10 text-primary p-4 rounded-lg text-center">
                <p className="font-medium">Demanda concluída!</p>
              </div>
                {myResponse && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Sua resposta</h4>
                    <DemandContentViewer content={myResponse.content as unknown[]} />
                  </div>
                )}
              </div>
            ) : canRespond ? (
              <div className="space-y-4">
                {myResponse?.status === 'rejected' && myResponse.review_notes && (
                  <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                    <p className="text-sm font-medium text-destructive mb-1">Ajustes solicitados:</p>
                    <p className="text-sm text-muted-foreground">{myResponse.review_notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Sua resposta</h4>
                  <DemandRichEditor
                    initialContent={myResponse?.content as unknown[] | undefined}
                    onChange={handleContentChange}
                    placeholder="Descreva o que foi feito, anexe imagens e arquivos..."
                    minHeight="250px"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Rascunho
                  </Button>
                  <Button 
                    onClick={handleSubmitResponse}
                    disabled={isSaving || !Array.isArray(responseContent) || responseContent.length === 0}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar para Revisão
                  </Button>
                </div>
              </div>
            ) : myResponse?.status === 'submitted' ? (
              <div className="space-y-4">
                <div className="bg-primary/10 text-primary p-4 rounded-lg text-center">
                  <p className="font-medium">Resposta enviada!</p>
                  <p className="text-sm mt-1">Aguardando revisão do gestor.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Sua resposta</h4>
                  <DemandContentViewer content={myResponse.content as unknown[]} />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Inicie a demanda para poder responder.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
