import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { CampaignMediaUploader } from '@/components/marketing/campaigns/CampaignMediaUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignDemandsTab } from '@/components/marketing/campaigns/CampaignDemandsTab';
import { CampaignDemandsOverview } from '@/components/marketing/campaigns/CampaignDemandsOverview';
import { CampaignCalendarOverview } from '@/components/marketing/campaigns/CampaignCalendarOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { BlurFade } from '@/components/ui/blur-fade';
import {
  useMarketingCampaignById,
  campaignStatusLabels,
  campaignTypeLabels,
  campaignPriorityLabels,
  useUpdateCampaign,
  useApproveCampaign,
  useRejectCampaign,
} from '@/hooks/useMarketingCampaigns';
import { useCampaignResults, useCampaignTrackingLinks } from '@/hooks/useCampaignAttribution';
import { UTMBuilderDialog } from '@/components/marketing/UTMBuilderDialog';
import { RegisterCampaignResultDialog } from '@/components/marketing/RegisterCampaignResultDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  FileText,
  BarChart3,
  Image,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Link2,
  ClipboardList,
  Edit,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground border-muted',
  pending_approval: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-primary/10 text-primary border-primary/20',
  in_production: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  active: 'bg-success/10 text-success border-success/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/10 text-primary',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

export default function CampaignDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useMarketingCampaignById(id);

  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showUTMBuilder, setShowUTMBuilder] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const updateCampaign = useUpdateCampaign();
  const approveCampaign = useApproveCampaign();
  const rejectCampaign = useRejectCampaign();

  const { data: trackingLinks = [] } = useCampaignTrackingLinks(id || '');
  const { data: campaignResults = [] } = useCampaignResults(id || '');

  if (isLoading) {
    return (
      <PageWrapper title="Carregando..." icon={<Megaphone className="h-5 w-5 text-module-gestao" />}>
        <div className="flex items-center justify-center h-48">
          <div className="h-5 w-5 border-2 border-module-gestao/30 border-t-module-gestao rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!campaign) {
    return (
      <PageWrapper title="Campanha não encontrada" icon={<Megaphone className="h-5 w-5 text-module-gestao" />}>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Campanha não encontrada</p>
          <Button onClick={() => navigate('/app/marketing/campanhas')}>Voltar</Button>
        </div>
      </PageWrapper>
    );
  }

  const budgetUsage = campaign.approved_budget > 0
    ? (campaign.spent_amount / campaign.approved_budget) * 100
    : 0;

  const latestResult = campaignResults[0];
  const attributionRoi = latestResult?.calculated_roi ?? campaign.actual_roi ?? null;

  const handleApprove = async () => {
    await approveCampaign.mutateAsync({ campaignId: campaign.id, approvedBudget: campaign.planned_budget });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    await rejectCampaign.mutateAsync({ campaignId: campaign.id, reason: rejectReason });
    setShowRejectForm(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    await updateCampaign.mutateAsync({ id: campaign.id, status: newStatus as any });
  };

  const getNextStatus = () => {
    switch (campaign.status) {
      case 'approved': return { status: 'in_production', label: 'Iniciar Produção' };
      case 'in_production': return { status: 'active', label: 'Ativar Campanha' };
      case 'active': return { status: 'completed', label: 'Concluir Campanha' };
      default: return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <PageWrapper
      title={campaign.name}
      subtitle="Detalhes da campanha"
      icon={<Megaphone className="h-5 w-5 text-module-gestao" />}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => navigate('/app/marketing/campanhas')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-module-gestao hover:bg-module-gestao/90"
            onClick={() => navigate(`/app/marketing/campanhas/${campaign.id}/editar`)}
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
        </div>
      }
    >
      {/* Status & Meta */}
      <BlurFade delay={0.05}>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn('border', statusColors[campaign.status])}>
            {campaignStatusLabels[campaign.status]}
          </Badge>
          <Badge variant="outline" className={priorityColors[campaign.priority]}>
            {campaignPriorityLabels[campaign.priority]}
          </Badge>
          <Badge variant="secondary">{campaignTypeLabels[campaign.type]}</Badge>
        </div>
      </BlurFade>

      {/* Main Content */}
      <BlurFade delay={0.1}>
        <Tabs defaultValue="briefing">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="briefing" className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Briefing</span>
            </TabsTrigger>
            <TabsTrigger value="demands" className="flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Demandas</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Métricas</span>
            </TabsTrigger>
            <TabsTrigger value="attribution" className="flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Atribuição</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-1.5">
              <Image className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* Briefing Tab */}
          <TabsContent value="briefing" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {campaign.start_date && campaign.end_date
                      ? `${format(new Date(campaign.start_date), 'dd/MM/yyyy')} - ${format(new Date(campaign.end_date), 'dd/MM/yyyy')}`
                      : 'Não definido'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Orçamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{formatCurrency(campaign.approved_budget || campaign.planned_budget)}</p>
                  {campaign.approved_budget > 0 && (
                    <p className="text-xs text-muted-foreground">Planejado: {formatCurrency(campaign.planned_budget)}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Descrição</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.description || 'Sem descrição'}</p>
              </CardContent>
            </Card>

            {campaign.briefing && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Briefing Detalhado</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.briefing}</p>
                </CardContent>
              </Card>
            )}

            {campaign.supplier && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Fornecedor</CardTitle></CardHeader>
                <CardContent><p className="font-medium">{campaign.supplier.name}</p></CardContent>
              </Card>
            )}

            {/* Approval actions */}
            {campaign.status === 'pending_approval' && (
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="pt-4">
                  {!showRejectForm ? (
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-warning">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Aguardando aprovação</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowRejectForm(true)} className="text-destructive hover:text-destructive">
                          <XCircle className="h-4 w-4 mr-1" />Rejeitar
                        </Button>
                        <Button size="sm" onClick={handleApprove} disabled={approveCampaign.isPending} className="bg-success hover:bg-success/90">
                          <CheckCircle className="h-4 w-4 mr-1" />Aprovar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Textarea placeholder="Motivo da rejeição..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setShowRejectForm(false)}>Cancelar</Button>
                        <Button variant="destructive" size="sm" onClick={handleReject} disabled={rejectCampaign.isPending || !rejectReason.trim()}>
                          Confirmar Rejeição
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {nextStatus && (
              <div className="flex justify-end">
                <Button onClick={() => handleStatusChange(nextStatus.status)}>{nextStatus.label}</Button>
              </div>
            )}

            {/* Calendar Overview */}
            <CampaignCalendarOverview campaignId={campaign.id} />

            {/* Demands Overview */}
            <CampaignDemandsOverview campaignId={campaign.id} />
          </TabsContent>

          {/* Demands Tab */}
          <TabsContent value="demands" className="mt-4">
            <CampaignDemandsTab campaignId={campaign.id} campaignName={campaign.name} />
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1"><Target className="h-4 w-4" /><span className="text-xs">Alcance</span></div>
                  <p className="text-2xl font-bold">{(campaign.actual_reach || 0).toLocaleString('pt-BR')}</p>
                  {campaign.expected_reach && <p className="text-xs text-muted-foreground">Meta: {campaign.expected_reach.toLocaleString('pt-BR')}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1"><Users className="h-4 w-4" /><span className="text-xs">Conversões</span></div>
                  <p className="text-2xl font-bold">{(campaign.actual_conversions || 0).toLocaleString('pt-BR')}</p>
                  {campaign.expected_conversions && <p className="text-xs text-muted-foreground">Meta: {campaign.expected_conversions.toLocaleString('pt-BR')}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1"><DollarSign className="h-4 w-4" /><span className="text-xs">Gasto</span></div>
                  <p className="text-2xl font-bold">{formatCurrency(campaign.spent_amount)}</p>
                  <p className="text-xs text-muted-foreground">de {formatCurrency(campaign.approved_budget || campaign.planned_budget)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" /><span className="text-xs">ROI</span></div>
                  <p className={cn('text-2xl font-bold', (campaign.actual_roi || 0) >= 100 ? 'text-success' : 'text-destructive')}>
                    {(campaign.actual_roi || 0).toFixed(1)}%
                  </p>
                  {campaign.expected_roi && <p className="text-xs text-muted-foreground">Esperado: {campaign.expected_roi.toFixed(1)}%</p>}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Uso do Orçamento</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Gasto: {formatCurrency(campaign.spent_amount)}</span>
                    <span>{budgetUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(budgetUsage, 100)} className="h-2" />
                  {budgetUsage > 100 && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Orçamento excedido em {formatCurrency(campaign.spent_amount - campaign.approved_budget)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attribution Tab */}
          <TabsContent value="attribution" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowUTMBuilder(true)}>
                <Link2 className="h-4 w-4 mr-2" />Gerar Links UTM
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowResultDialog(true)}>
                <ClipboardList className="h-4 w-4 mr-2" />Registrar Resultado
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{trackingLinks.length}</p><p className="text-[10px] text-muted-foreground">Links UTM</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{campaignResults.length}</p><p className="text-[10px] text-muted-foreground">Resultados</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{formatCurrency(campaign.spent_amount)}</p><p className="text-[10px] text-muted-foreground">Gasto Total</p></CardContent></Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className={cn('text-2xl font-bold', attributionRoi !== null && attributionRoi >= 0 ? 'text-success' : 'text-destructive')}>
                    {attributionRoi !== null ? `${attributionRoi.toFixed(1)}%` : 'N/A'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">ROI</p>
                </CardContent>
              </Card>
            </div>

            {campaignResults.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Resultados por Período</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {campaignResults.map(r => (
                    <div key={r.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{r.period_start} → {r.period_end}</span>
                        <Badge variant="outline" className={cn('text-xs', (r.calculated_roi || 0) >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                          ROI: {r.calculated_roi?.toFixed(1) || 'N/A'}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><p className="text-muted-foreground">Investimento</p><p className="font-medium">{formatCurrency(r.total_investment)}</p></div>
                        <div><p className="text-muted-foreground">Receita</p><p className="font-medium">{formatCurrency(r.total_revenue)}</p></div>
                        <div><p className="text-muted-foreground">KPIs</p><p className="font-medium">{Object.keys(r.kpi_snapshot || {}).length} métricas</p></div>
                      </div>
                      {r.notes && <p className="text-[10px] text-muted-foreground">{r.notes}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {trackingLinks.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Links de Rastreio</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {trackingLinks.map(link => (
                    <div key={link.id} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                      <Badge variant="outline" className="text-[9px] shrink-0">{link.channel}</Badge>
                      <p className="text-[10px] font-mono text-muted-foreground truncate flex-1">{link.final_url}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Materiais da Campanha</CardTitle></CardHeader>
              <CardContent>
                <CampaignMediaUploader
                  assets={campaign.assets || []}
                  onAssetsChange={(urls) => {
                    updateCampaign.mutate({ id: campaign.id, assets: urls });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Linha do Tempo</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="font-medium text-sm">Campanha criada</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(campaign.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {campaign.approved_at && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-success mt-2" />
                      <div>
                        <p className="font-medium text-sm">Aprovada</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(campaign.approved_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}
                  {campaign.rejection_reason && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                      <div>
                        <p className="font-medium text-sm">Rejeitada</p>
                        <p className="text-xs text-muted-foreground">{campaign.rejection_reason}</p>
                      </div>
                    </div>
                  )}
                  {campaign.learnings && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium text-sm">Aprendizados</p>
                        <p className="text-xs text-muted-foreground">{campaign.learnings}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </BlurFade>

      {/* Attribution Dialogs (these are small action dialogs, ok to keep) */}
      <UTMBuilderDialog campaignId={campaign.id} campaignName={campaign.name} open={showUTMBuilder} onOpenChange={setShowUTMBuilder} />
      <RegisterCampaignResultDialog campaignId={campaign.id} campaignName={campaign.name} open={showResultDialog} onOpenChange={setShowResultDialog} />
    </PageWrapper>
  );
}
