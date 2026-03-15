import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateMarketingKPI, useCreateKPIByChannel } from '@/hooks/useMarketingKPIs';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CreateKPIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const periodTypeLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

const channelOptions = [
  'Trade Marketing',
  'Digital',
  'PDV',
  'WhatsApp',
  'Email',
  'Social Media',
  'Outro',
];

interface ChannelData {
  channel: string;
  investment: string;
  revenue: string;
  leads: string;
  conversions: string;
}

export function CreateKPIDialog({ open, onOpenChange }: CreateKPIDialogProps) {
  const { toast } = useToast();
  const createKPI = useCreateMarketingKPI();
  const createKPIByChannel = useCreateKPIByChannel();
  
  const [formData, setFormData] = useState({
    period_type: 'monthly',
    period_start: new Date().toISOString().split('T')[0],
    period_end: '',
    roi: '',
    cac: '',
    ltv: '',
    conversion_rate: '',
    nps: '',
    average_ticket: '',
    impressions: '',
    clicks: '',
    visits: '',
    leads: '',
    conversions: '',
    revenue: '',
  });

  const [channels, setChannels] = useState<ChannelData[]>([]);

  const handleAddChannel = () => {
    setChannels([...channels, { channel: '', investment: '', revenue: '', leads: '', conversions: '' }]);
  };

  const handleRemoveChannel = (index: number) => {
    setChannels(channels.filter((_, i) => i !== index));
  };

  const handleChannelChange = (index: number, field: keyof ChannelData, value: string) => {
    const updated = [...channels];
    updated[index] = { ...updated[index], [field]: value };
    setChannels(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Calculate period_end if not set
      let periodEnd = formData.period_end;
      if (!periodEnd) {
        const start = new Date(formData.period_start);
        const end = new Date(start);
        if (formData.period_type === 'daily') {
          end.setDate(end.getDate() + 1);
        } else if (formData.period_type === 'weekly') {
          end.setDate(end.getDate() + 7);
        } else if (formData.period_type === 'monthly') {
          end.setMonth(end.getMonth() + 1);
        } else if (formData.period_type === 'quarterly') {
          end.setMonth(end.getMonth() + 3);
        } else if (formData.period_type === 'yearly') {
          end.setFullYear(end.getFullYear() + 1);
        }
        periodEnd = end.toISOString().split('T')[0];
      }

      const kpi = await createKPI.mutateAsync({
        period_type: formData.period_type,
        period_start: formData.period_start,
        period_end: periodEnd,
        roi: formData.roi ? parseFloat(formData.roi) : undefined,
        cac: formData.cac ? parseFloat(formData.cac) : undefined,
        ltv: formData.ltv ? parseFloat(formData.ltv) : undefined,
        conversion_rate: formData.conversion_rate ? parseFloat(formData.conversion_rate) : undefined,
        nps: formData.nps ? parseFloat(formData.nps) : undefined,
        average_ticket: formData.average_ticket ? parseFloat(formData.average_ticket) : undefined,
        impressions: formData.impressions ? parseInt(formData.impressions) : undefined,
        clicks: formData.clicks ? parseInt(formData.clicks) : undefined,
        visits: formData.visits ? parseInt(formData.visits) : undefined,
        leads: formData.leads ? parseInt(formData.leads) : undefined,
        conversions: formData.conversions ? parseInt(formData.conversions) : undefined,
        revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
      });

      // Create channel KPIs
      for (const channel of channels) {
        if (channel.channel) {
          const investment = channel.investment ? parseFloat(channel.investment) : undefined;
          const revenue = channel.revenue ? parseFloat(channel.revenue) : undefined;
          const leads = channel.leads ? parseInt(channel.leads) : undefined;
          const conversions = channel.conversions ? parseInt(channel.conversions) : undefined;
          
          let roi: number | undefined;
          if (investment && revenue) {
            roi = ((revenue - investment) / investment) * 100;
          }
          
          let conversionRate: number | undefined;
          if (leads && conversions && leads > 0) {
            conversionRate = (conversions / leads) * 100;
          }

          await createKPIByChannel.mutateAsync({
            kpi_id: kpi.id,
            channel: channel.channel,
            investment,
            revenue,
            roi,
            leads,
            conversions,
            conversion_rate: conversionRate,
          });
        }
      }

      toast({
        title: 'KPIs registrados',
        description: 'Os indicadores foram salvos com sucesso',
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os KPIs',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      period_type: 'monthly',
      period_start: new Date().toISOString().split('T')[0],
      period_end: '',
      roi: '',
      cac: '',
      ltv: '',
      conversion_rate: '',
      nps: '',
      average_ticket: '',
      impressions: '',
      clicks: '',
      visits: '',
      leads: '',
      conversions: '',
      revenue: '',
    });
    setChannels([]);
  };

  const isLoading = createKPI.isPending || createKPIByChannel.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-app-gestao" />
            Registrar KPIs de Marketing
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Period Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Período</Label>
              <Select
                value={formData.period_type}
                onValueChange={(value) => setFormData({ ...formData, period_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={formData.period_start}
                onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim (opcional)</Label>
              <Input
                type="date"
                value={formData.period_end}
                onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          {/* Main KPIs */}
          <div>
            <h4 className="text-sm font-medium mb-3">Indicadores Principais</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>ROI (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.roi}
                  onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                  placeholder="Ex: 324"
                />
              </div>

              <div className="space-y-2">
                <Label>CAC (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cac}
                  onChange={(e) => setFormData({ ...formData, cac: e.target.value })}
                  placeholder="Ex: 12.40"
                />
              </div>

              <div className="space-y-2">
                <Label>LTV (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.ltv}
                  onChange={(e) => setFormData({ ...formData, ltv: e.target.value })}
                  placeholder="Ex: 847"
                />
              </div>

              <div className="space-y-2">
                <Label>Taxa Conversão (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.conversion_rate}
                  onChange={(e) => setFormData({ ...formData, conversion_rate: e.target.value })}
                  placeholder="Ex: 3.8"
                />
              </div>

              <div className="space-y-2">
                <Label>NPS</Label>
                <Input
                  type="number"
                  value={formData.nps}
                  onChange={(e) => setFormData({ ...formData, nps: e.target.value })}
                  placeholder="Ex: 72"
                />
              </div>

              <div className="space-y-2">
                <Label>Ticket Médio (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.average_ticket}
                  onChange={(e) => setFormData({ ...formData, average_ticket: e.target.value })}
                  placeholder="Ex: 156"
                />
              </div>

              <div className="space-y-2">
                <Label>Receita (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="Ex: 150000"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Funnel Metrics */}
          <div>
            <h4 className="text-sm font-medium mb-3">Funil de Marketing</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Impressões</Label>
                <Input
                  type="number"
                  value={formData.impressions}
                  onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                  placeholder="Ex: 2100000"
                />
              </div>

              <div className="space-y-2">
                <Label>Cliques</Label>
                <Input
                  type="number"
                  value={formData.clicks}
                  onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
                  placeholder="Ex: 48500"
                />
              </div>

              <div className="space-y-2">
                <Label>Visitas</Label>
                <Input
                  type="number"
                  value={formData.visits}
                  onChange={(e) => setFormData({ ...formData, visits: e.target.value })}
                  placeholder="Ex: 32000"
                />
              </div>

              <div className="space-y-2">
                <Label>Leads</Label>
                <Input
                  type="number"
                  value={formData.leads}
                  onChange={(e) => setFormData({ ...formData, leads: e.target.value })}
                  placeholder="Ex: 5200"
                />
              </div>

              <div className="space-y-2">
                <Label>Conversões</Label>
                <Input
                  type="number"
                  value={formData.conversions}
                  onChange={(e) => setFormData({ ...formData, conversions: e.target.value })}
                  placeholder="Ex: 1216"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Channel KPIs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">KPIs por Canal (opcional)</h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddChannel}>
                <Plus className="h-3 w-3 mr-1" />
                Adicionar Canal
              </Button>
            </div>

            {channels.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Clique em "Adicionar Canal" para registrar métricas específicas por canal
              </p>
            ) : (
              <div className="space-y-3">
                {channels.map((channel, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <Select
                        value={channel.channel}
                        onValueChange={(value) => handleChannelChange(index, 'channel', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Selecione o canal" />
                        </SelectTrigger>
                        <SelectContent>
                          {channelOptions.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveChannel(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Investimento</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={channel.investment}
                          onChange={(e) => handleChannelChange(index, 'investment', e.target.value)}
                          placeholder="R$"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Receita</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={channel.revenue}
                          onChange={(e) => handleChannelChange(index, 'revenue', e.target.value)}
                          placeholder="R$"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Leads</Label>
                        <Input
                          type="number"
                          value={channel.leads}
                          onChange={(e) => handleChannelChange(index, 'leads', e.target.value)}
                          placeholder="Qtd"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Conversões</Label>
                        <Input
                          type="number"
                          value={channel.conversions}
                          onChange={(e) => handleChannelChange(index, 'conversions', e.target.value)}
                          placeholder="Qtd"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Registrar KPIs'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
