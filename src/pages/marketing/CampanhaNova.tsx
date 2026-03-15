import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/marketing/PageWrapper';
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
import { useAuth } from '@/contexts/AuthContext';
import {
  useCreateCampaign,
  campaignTypeLabels,
  campaignPriorityLabels,
  type MarketingCampaign,
} from '@/hooks/useMarketingCampaigns';
import { CampaignMediaUploader } from '@/components/marketing/campaigns/CampaignMediaUploader';
import { BlurFade } from '@/components/ui/blur-fade';

export default function CampanhaNova() {
  const navigate = useNavigate();
  const { user, tenant } = useAuth();
  const createCampaign = useCreateCampaign();

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'promotional' as MarketingCampaign['type'],
    priority: 'medium' as MarketingCampaign['priority'],
    planned_budget: 0,
    start_date: '',
    end_date: '',
    briefing: '',
    assets: [] as string[],
  });

  const handleCreate = async () => {
    await createCampaign.mutateAsync({
      ...form,
      tenant_id: tenant?.id || null,
      status: 'draft',
      approved_budget: 0,
      spent_amount: 0,
      supplier_id: null,
      coop_fund_id: null,
      expected_reach: null,
      actual_reach: null,
      expected_conversions: null,
      actual_conversions: null,
      expected_roi: null,
      actual_roi: null,
      created_by: user?.id || null,
      approved_by: null,
      approved_at: null,
      rejection_reason: null,
      learnings: null,
      approval_deadline: null,
    });
    navigate('/app/marketing/campanhas');
  };

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <PageWrapper
      title="Nova Campanha"
      subtitle="Crie uma nova campanha de marketing"
      icon={<Megaphone className="h-5 w-5 text-module-gestao" />}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/app/marketing/campanhas')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
      }
    >
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Form */}
        <BlurFade delay={0.1} className="order-2 lg:order-1">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Campanha *</Label>
                  <Input
                    placeholder="Ex: Promoção de Verão 2026"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                  />
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
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Período e Orçamento</CardTitle>
              </CardHeader>
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
                  <Input
                    type="number"
                    placeholder="R$ 0,00"
                    value={form.planned_budget || ''}
                    onChange={(e) => set('planned_budget', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Description & Briefing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Descrição e Briefing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva os objetivos da campanha..."
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Briefing</Label>
                  <Textarea
                    placeholder="Detalhes e especificações da campanha..."
                    value={form.briefing}
                    onChange={(e) => set('briefing', e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Materiais / Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <CampaignMediaUploader
                  assets={form.assets}
                  onAssetsChange={(urls) => set('assets', urls)}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pb-6">
              <Button variant="outline" onClick={() => navigate('/app/marketing/campanhas')}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!form.name || createCampaign.isPending}
                className="bg-module-gestao hover:bg-module-gestao/90 gap-1.5"
              >
                <Save className="h-4 w-4" />
                {createCampaign.isPending ? 'Criando...' : 'Criar Campanha'}
              </Button>
            </div>
          </div>
        </BlurFade>

        {/* Sidebar Preview */}
        <BlurFade delay={0.2} className="order-1 lg:order-2">
          <div className="space-y-4 lg:sticky lg:top-4">
            <Card className="border-module-gestao/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {/* Compact mobile layout */}
                <div className="flex flex-wrap items-center gap-2 lg:hidden">
                  <span className="font-medium text-xs truncate max-w-[150px]">{form.name || '—'}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {campaignTypeLabels[form.type]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {campaignPriorityLabels[form.priority]}
                  </Badge>
                  {form.planned_budget > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(form.planned_budget)}
                    </Badge>
                  )}
                  {form.assets.length > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {form.assets.length} arquivo(s)
                    </Badge>
                  )}
                </div>
                {/* Full desktop layout */}
                <div className="hidden lg:block space-y-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Nome</p>
                    <p className="font-medium">{form.name || '—'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {campaignTypeLabels[form.type]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {campaignPriorityLabels[form.priority]}
                    </Badge>
                  </div>
                  {(form.start_date || form.end_date) && (
                    <div>
                      <p className="text-muted-foreground text-xs">Período</p>
                      <p className="font-medium">
                        {form.start_date || '?'} → {form.end_date || '?'}
                      </p>
                    </div>
                  )}
                  {form.planned_budget > 0 && (
                    <div>
                      <p className="text-muted-foreground text-xs">Orçamento</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(form.planned_budget)}
                      </p>
                    </div>
                  )}
                  {form.assets.length > 0 && (
                    <div>
                      <p className="text-muted-foreground text-xs">Assets</p>
                      <p className="font-medium">{form.assets.length} arquivo(s)</p>
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
