import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CampaignMediaUploader } from '@/components/marketing/campaigns/CampaignMediaUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MarketingCampaign,
  campaignTypeLabels,
  campaignPriorityLabels,
  useUpdateCampaign,
} from '@/hooks/useMarketingCampaigns';

interface CampaignEditDialogProps {
  campaign: MarketingCampaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignEditDialog({ campaign, open, onOpenChange }: CampaignEditDialogProps) {
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

  if (!campaign) return null;

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Campanha</DialogTitle>
          <DialogDescription>Atualize os dados da campanha</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>Nome da Campanha</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as MarketingCampaign['type'] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(campaignTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v as MarketingCampaign['priority'] })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(campaignPriorityLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Término</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Orçamento Planejado</Label>
            <Input
              type="number"
              value={form.planned_budget || ''}
              onChange={(e) => setForm({ ...form, planned_budget: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Alcance Esperado</Label>
              <Input
                type="number"
                value={form.expected_reach || ''}
                onChange={(e) => setForm({ ...form, expected_reach: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Conversões Esperadas</Label>
              <Input
                type="number"
                value={form.expected_conversions || ''}
                onChange={(e) => setForm({ ...form, expected_conversions: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">ROI Esperado (%)</Label>
              <Input
                type="number"
                value={form.expected_roi || ''}
                onChange={(e) => setForm({ ...form, expected_roi: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Briefing</Label>
            <Textarea
              value={form.briefing}
              onChange={(e) => setForm({ ...form, briefing: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Materiais / Assets</Label>
            <CampaignMediaUploader
              assets={form.assets}
              onAssetsChange={(urls) => setForm({ ...form, assets: urls })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={!form.name || updateCampaign.isPending}
            className="bg-app-gestao hover:bg-app-gestao/90"
          >
            {updateCampaign.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
