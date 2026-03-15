import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  Play,
  Send,
  Save,
  Loader2,
  Target,
  FileText,
  Tag,
  CheckCircle2,
  MessageSquare,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageWrapper } from "@/components/marketing/PageWrapper";
import { PremiumGlassCard } from "@/components/dashboard/PremiumGlassCard";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  useDemandById,
  demandStatusConfig,
  demandPriorityConfig,
  demandTypeConfig,
  useUpdateDemand,
} from "@/hooks/useMarketingDemands";
import {
  useMyDemandResponse,
  useCreateDemandResponse,
  useUpdateDemandResponse,
  responseStatusConfig,
} from "@/hooks/useDemandResponses";
import { DemandRichEditor, DemandContentViewer } from "@/components/marketing/demands/DemandRichEditor";
import { DemandComments } from "@/components/marketing/demands/DemandComments";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export default function MinhaDemanda() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: demand, isLoading: demandLoading } = useDemandById(id);
  const { data: myResponse, isLoading: responseLoading } = useMyDemandResponse(id);
  const updateDemand = useUpdateDemand();
  const createResponse = useCreateDemandResponse();
  const updateResponse = useUpdateDemandResponse();

  const [responseContent, setResponseContent] = useState<Json>([]);

  // Initialize response content when loaded
  useEffect(() => {
    if (myResponse?.content) {
      setResponseContent(myResponse.content);
    }
  }, [myResponse?.content]);

  const handleContentChange = useCallback((content: unknown[]) => {
    setResponseContent(content as Json);
  }, []);

  // Loading state
  if (demandLoading) {
    return (
      <PageWrapper
        title="Carregando..."
        subtitle="Buscando informações da demanda"
        icon={<Loader2 className="h-6 w-6 text-module-gestao animate-spin" />}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-module-gestao" />
        </div>
      </PageWrapper>
    );
  }

  // Not found
  if (!demand) {
    return (
      <PageWrapper
        title="Demanda não encontrada"
        subtitle="A demanda solicitada não existe ou você não tem permissão para acessá-la"
        icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
      >
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-4">A demanda que você está procurando não foi encontrada.</p>
          <Button onClick={() => navigate("/app/marketing/demandas")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Demandas
          </Button>
        </div>
      </PageWrapper>
    );
  }

  // Permission: is the current user the creator?
  const isOwner = demand.created_by === user?.id;

  const priorityConfig = demandPriorityConfig[demand.priority];
  const statusConfig = demandStatusConfig[demand.status];
  const typeConfig = demandTypeConfig[demand.type];
  const responseStatusCfg = myResponse ? responseStatusConfig[myResponse.status] : null;

  const isOverdue = demand.due_date && 
    new Date(demand.due_date) < new Date() && 
    !['completed', 'cancelled', 'approved'].includes(demand.status);

  const canStart = isOwner && demand.status === 'open';
  const canRespond = isOwner && ['in_progress', 'review'].includes(demand.status) && 
    (!myResponse || myResponse.status === 'draft' || myResponse.status === 'rejected');
  const isCompleted = ['completed', 'approved'].includes(demand.status);
  const isSubmitted = myResponse?.status === 'submitted';

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

  // Parse tags
  const tags = Array.isArray(demand.tags) 
    ? demand.tags 
    : (typeof demand.tags === 'string' ? JSON.parse(demand.tags) : []);

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

  return (
    <PageWrapper
      title={demand.title}
      subtitle={`Atribuída em ${format(new Date(demand.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
      icon={<MessageSquare className="h-6 w-6 text-module-gestao" />}
      actions={
        <Button 
          variant="outline" 
          onClick={() => navigate("/app/marketing/demandas")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      }
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Status Badges */}
        <BlurFade delay={0.1}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-sm px-3 py-1", statusConfig.bgColor, statusConfig.color)}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline" className={cn("text-sm px-3 py-1", priorityConfig.bgColor, priorityConfig.color)}>
              {priorityConfig.label}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Atrasado
              </Badge>
            )}
            {responseStatusCfg && (
              <Badge variant="outline" className={cn("text-sm px-3 py-1", responseStatusCfg.bgColor, responseStatusCfg.color)}>
                Resposta: {responseStatusCfg.label}
              </Badge>
            )}
            {!isOwner && (
              <Badge variant="outline" className="text-sm px-3 py-1 bg-muted text-muted-foreground">
                <Lock className="h-3 w-3 mr-1" />
                Somente leitura
              </Badge>
            )}
          </div>
        </BlurFade>

        {/* Informações da Demanda */}
        <BlurFade delay={0.15}>
          <PremiumGlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-module-gestao" />
              Informações da Demanda
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium">
                  {typeConfig.icon} {typeConfig.label}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Prazo</p>
                <p className={cn("text-sm font-medium flex items-center gap-1", isOverdue && "text-destructive")}>
                  <Calendar className="h-3.5 w-3.5" />
                  {demand.due_date 
                    ? format(new Date(demand.due_date), "dd/MM/yyyy") 
                    : "Não definido"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estimativa</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {demand.estimated_hours ? `${demand.estimated_hours}h` : "Não definido"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Horas Trabalhadas</p>
                <p className="text-sm font-medium">
                  {demand.actual_hours ? `${demand.actual_hours}h` : "-"}
                </p>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(demand.campaign_id || demand.document_id) && (
              <div className="flex flex-wrap gap-3">
                {demand.campaign_id && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Target className="h-4 w-4 text-module-gestao" />
                    <span>Campanha vinculada</span>
                  </div>
                )}
                {demand.document_id && (
                  <Link 
                    to={`/app/marketing/documentos/${demand.document_id}`}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Ver documento
                  </Link>
                )}
              </div>
            )}
          </PremiumGlassCard>
        </BlurFade>

        {/* Detalhamento */}
        <BlurFade delay={0.2}>
          <PremiumGlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">Detalhamento</h2>
            {descriptionContent ? (
              <DemandContentViewer content={descriptionContent} />
            ) : (
              <p className="text-sm text-muted-foreground italic">Sem detalhamento</p>
            )}
          </PremiumGlassCard>
        </BlurFade>

        {/* Ação: Iniciar Demanda (only for owner) */}
        {canStart && (
          <BlurFade delay={0.25}>
            <PremiumGlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-module-gestao" />
                Ação
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Esta demanda está aguardando para ser iniciada. Clique no botão abaixo para começar a trabalhar nela.
              </p>
              <Button 
                onClick={handleStartDemand} 
                className="gap-2"
                disabled={updateDemand.isPending}
                size="lg"
              >
                {updateDemand.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Iniciar Demanda
              </Button>
            </PremiumGlassCard>
          </BlurFade>
        )}

        {/* Minha Resposta (only for owner when not canStart) */}
        {isOwner && !canStart && (
          <BlurFade delay={0.3}>
            <PremiumGlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-module-gestao" />
                Minha Resposta
              </h2>

              {responseLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : isCompleted ? (
                <div className="space-y-4">
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-500">Demanda concluída!</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                      Esta demanda foi aprovada e concluída com sucesso.
                    </AlertDescription>
                  </Alert>
                  {myResponse && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Sua resposta</h4>
                      <DemandContentViewer content={myResponse.content as unknown[]} />
                    </div>
                  )}
                </div>
              ) : isSubmitted ? (
                <div className="space-y-4">
                  <Alert className="bg-primary/10 border-primary/20">
                    <Send className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Resposta enviada!</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                      Aguardando revisão do gestor.
                    </AlertDescription>
                  </Alert>
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
                    <Alert variant="destructive" className="bg-destructive/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Ajustes solicitados</AlertTitle>
                      <AlertDescription>{myResponse.review_notes}</AlertDescription>
                    </Alert>
                  )}

                  <DemandRichEditor
                    initialContent={myResponse?.content as unknown[] | undefined}
                    onChange={handleContentChange}
                    placeholder="Descreva o que foi feito, anexe imagens e arquivos..."
                    minHeight="350px"
                  />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                      className="flex-1 gap-2"
                      size="lg"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Salvar Rascunho
                    </Button>
                    <Button 
                      onClick={handleSubmitResponse}
                      disabled={isSaving || !Array.isArray(responseContent) || responseContent.length === 0}
                      className="flex-1 gap-2"
                      size="lg"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Enviar para Revisão
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Inicie a demanda para poder responder.
                </p>
              )}
            </PremiumGlassCard>
          </BlurFade>
        )}

        {/* Comentários - visible to everyone */}
        <BlurFade delay={0.35}>
          <DemandComments demandId={demand.id} />
        </BlurFade>
      </div>
    </PageWrapper>
  );
}
