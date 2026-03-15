import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { CampaignMediaUploader } from '@/components/marketing/campaigns/CampaignMediaUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Megaphone, Save } from 'lucide-react';
import {
  useMarketingCampaignById,
  useUpdateCampaign,
  campaignTypeLabels,
  campaignPriorityLabels,
  type MarketingCampaign,
} from '@/hooks/useMarketingCampaigns';
import { BlurFade } from '@/components/ui/blur-fade';

export default function CampanhaEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useMarketingCampaignById(id);
  const updateCampaign = useUpdateCampaign();

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'promotional' as MarketingCampaign['type'],
    priority: 'medium' as MarketingCampaign['priority'],
    planned_budget: 0,
    start_date: '',
    end_date: '',
    briefing: '',
    expected_reach: 0,
    expected_conversions: 0,
    expected_roi: 0,
    assets: [] as string[],
  });

  useEffect(() => {
    if (campaign) {
      setForm({
        name: campaign.name || '',
        description: campaign.description || '',
        type: campaign.type,
        priority: campaign.priority,
        planned_budget: campaign.planned_budget || 0,
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || '',
        briefing: campaign.briefing || '',
        expected_reach: campaign.expected_reach || 0,
        expected_conversions: campaign.expected_conversions || 0,
        expected_roi: campaign.expected_roi || 0,
        assets: campaign.assets || [],
      });
    }
  }, [campaign]);

  if (isLoading) {
    return (
      <PageWrapper title="Carregando..." icon={<Megaphone className="h-5 w-5 text-app-gestao" />}>
        <div className="flex items-center justify-center h-48">
          <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  if (!campaign) {
    return (
      <PageWrapper title="Campanha não encontrada" icon={<Megaphone className="h-5 w-5 text-app-gestao" />}>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Campanha não encontrada</p>
          <Button onClick={() => navigate('/app/marketing/campanhas')}>Voltar</Button>
        </div>
      </PageWrapper>
    );
  }

  const handleSave = async () => {
    await updateCampaign.mutateAsync({
      id: campaign.id,
      name: form.name,
      description: form.description || null,
      type: form.type,
      priority: form.priority,
      planned_budget: form.planned_budget,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      briefing: form.briefing || null,
      expected_reach: form.expected_reach || null,
      expected_conversions: form.expected_conversions || null,
      expected_roi: form.expected_roi || null,
      assets: form.assets,
    });
    navigate(`/app/marketing/campanhas/${campaign.id}`);
  };

  const goBack = () => navigate(`/app/marketing/campanhas/${campaign.id}`);
  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <PageWrapper
      title="Editar Campanha"
      subtitle={campaign.name}
      icon={<Megaphone className="h-5 w-5 text-module-gestao" />}
      actions={
        <Button variant="outline" size="sm" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />Voltar
        </Button>
      }
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <BlurFade delay={0.1} className="order-2 lg:order-1">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Informações Básicas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Campanha *</Label>
                  <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={form.type} onValueChange={(v) => set('type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(campaignTypeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(campaignPriorityLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Period & Budget */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Período e Orçamento</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Input type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Término</Label>
                    <Input type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Orçamento Planejado</Label>
                  <Input type="number" value={form.planned_budget || ''} onChange={(e) => set('planned_budget', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Alcance Esperado</Label>
                    <Input type="number" value={form.expected_reach || ''} onChange={(e) => set('expected_reach', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Conversões Esperadas</Label>
                    <Input type="number" value={form.expected_conversions || ''} onChange={(e) => set('expected_conversions', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">ROI Esperado (%)</Label>
                    <Input type="number" value={form.expected_roi || ''} onChange={(e) => set('expected_roi', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description & Briefing */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Descrição e Briefing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Briefing</Label>
                  <Textarea value={form.briefing} onChange={(e) => set('briefing', e.target.value)} rows={4} />
                </div>
              </CardContent>
            </Card>

            {/* Assets */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Materiais / Assets</CardTitle></CardHeader>
              <CardContent>
                <CampaignMediaUploader assets={form.assets} onAssetsChange={(urls) => set('assets', urls)} />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pb-6">
              <Button variant="outline" onClick={goBack}>Cancelar</Button>
              <Button
                onClick={handleSave}
                disabled={!form.name || updateCampaign.isPending}
                className="bg-module-gestao hover:bg-module-gestao/90 gap-1.5"
              >
                <Save className="h-4 w-4" />
                {updateCampaign.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Sidebar Preview */}
        <BlurFade delay={0.2} className="order-1 lg:order-2">
          <div className="space-y-4 lg:sticky lg:top-4">
            <Card className="border-module-gestao/30">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Resumo</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <div className="flex flex-wrap items-center gap-2 lg:hidden">
                  <span className="font-medium text-xs truncate max-w-[150px]">{form.name || '—'}</span>
                  <Badge variant="secondary" className="text-[10px]">{campaignTypeLabels[form.type]}</Badge>
                  <Badge variant="outline" className="text-[10px]">{campaignPriorityLabels[form.priority]}</Badge>
                </div>
                <div className="hidden lg:block space-y-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Nome</p>
                    <p className="font-medium">{form.name || '—'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">{campaignTypeLabels[form.type]}</Badge>
                    <Badge variant="outline" className="text-xs">{campaignPriorityLabels[form.priority]}</Badge>
                  </div>
                  {(form.start_date || form.end_date) && (
                    <div>
                      <p className="text-muted-foreground text-xs">Período</p>
                      <p className="font-medium">{form.start_date || '?'} → {form.end_date || '?'}</p>
                    </div>
                  )}
                  {form.planned_budget > 0 && (
                    <div>
                      <p className="text-muted-foreground text-xs">Orçamento</p>
                      <p className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(form.planned_budget)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </BlurFade>
      </div>
    </PageWrapper>
  );
}
