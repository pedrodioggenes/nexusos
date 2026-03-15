import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BarChart3, Plus, Trash2 } from 'lucide-react';
import { useCreateMarketingKPI, useCreateKPIByChannel } from '@/hooks/useMarketingKPIs';
import { useToast } from '@/hooks/use-toast';

const periodTypeLabels: Record<string, string> = {
  daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal', quarterly: 'Trimestral', yearly: 'Anual',
};

const channelOptions = ['Trade Marketing', 'Digital', 'PDV', 'WhatsApp', 'Email', 'Social Media', 'Outro'];

interface ChannelData { channel: string; investment: string; revenue: string; leads: string; conversions: string; }

export default function NovoKPI() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createKPI = useCreateMarketingKPI();
  const createKPIByChannel = useCreateKPIByChannel();

  const [formData, setFormData] = useState({
    period_type: 'monthly', period_start: new Date().toISOString().split('T')[0], period_end: '',
    roi: '', cac: '', ltv: '', conversion_rate: '', nps: '', average_ticket: '',
    impressions: '', clicks: '', visits: '', leads: '', conversions: '', revenue: '',
  });

  const [channels, setChannels] = useState<ChannelData[]>([]);
  const handleAddChannel = () => setChannels([...channels, { channel: '', investment: '', revenue: '', leads: '', conversions: '' }]);
  const handleRemoveChannel = (i: number) => setChannels(channels.filter((_, idx) => idx !== i));
  const handleChannelChange = (i: number, field: keyof ChannelData, value: string) => {
    const updated = [...channels]; updated[i] = { ...updated[i], [field]: value }; setChannels(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let periodEnd = formData.period_end;
      if (!periodEnd) {
        const start = new Date(formData.period_start);
        const end = new Date(start);
        if (formData.period_type === 'daily') end.setDate(end.getDate() + 1);
        else if (formData.period_type === 'weekly') end.setDate(end.getDate() + 7);
        else if (formData.period_type === 'monthly') end.setMonth(end.getMonth() + 1);
        else if (formData.period_type === 'quarterly') end.setMonth(end.getMonth() + 3);
        else if (formData.period_type === 'yearly') end.setFullYear(end.getFullYear() + 1);
        periodEnd = end.toISOString().split('T')[0];
      }

      const kpi = await createKPI.mutateAsync({
        period_type: formData.period_type, period_start: formData.period_start, period_end: periodEnd,
        roi: formData.roi ? parseFloat(formData.roi) : undefined, cac: formData.cac ? parseFloat(formData.cac) : undefined,
        ltv: formData.ltv ? parseFloat(formData.ltv) : undefined, conversion_rate: formData.conversion_rate ? parseFloat(formData.conversion_rate) : undefined,
        nps: formData.nps ? parseFloat(formData.nps) : undefined, average_ticket: formData.average_ticket ? parseFloat(formData.average_ticket) : undefined,
        impressions: formData.impressions ? parseInt(formData.impressions) : undefined, clicks: formData.clicks ? parseInt(formData.clicks) : undefined,
        visits: formData.visits ? parseInt(formData.visits) : undefined, leads: formData.leads ? parseInt(formData.leads) : undefined,
        conversions: formData.conversions ? parseInt(formData.conversions) : undefined, revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
      });

      for (const channel of channels) {
        if (channel.channel) {
          const inv = channel.investment ? parseFloat(channel.investment) : undefined;
          const rev = channel.revenue ? parseFloat(channel.revenue) : undefined;
          const lds = channel.leads ? parseInt(channel.leads) : undefined;
          const conv = channel.conversions ? parseInt(channel.conversions) : undefined;
          let roi: number | undefined; if (inv && rev) roi = ((rev - inv) / inv) * 100;
          let cr: number | undefined; if (lds && conv && lds > 0) cr = (conv / lds) * 100;
          await createKPIByChannel.mutateAsync({ kpi_id: kpi.id, channel: channel.channel, investment: inv, revenue: rev, roi, leads: lds, conversions: conv, conversion_rate: cr });
        }
      }

      toast({ title: 'KPIs registrados', description: 'Os indicadores foram salvos com sucesso' });
      navigate("/app/marketing/kpis");
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar os KPIs', variant: 'destructive' });
    }
  };

  const isLoading = createKPI.isPending || createKPIByChannel.isPending;

  return (
    <PageWrapper
      title="Registrar KPIs de Marketing"
      icon={<BarChart3 className="h-5 w-5 text-app-gestao" />}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/app/marketing/kpis")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader><CardTitle className="text-sm">Período</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5"><Label>Tipo</Label>
              <Select value={formData.period_type} onValueChange={v => setFormData({ ...formData, period_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(periodTypeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Início</Label><Input type="date" value={formData.period_start} onChange={e => setFormData({ ...formData, period_start: e.target.value })} required /></div>
            <div className="space-y-1.5"><Label>Fim (opcional)</Label><Input type="date" value={formData.period_end} onChange={e => setFormData({ ...formData, period_end: e.target.value })} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Indicadores Principais</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {([['roi', 'ROI (%)'], ['cac', 'CAC (R$)'], ['ltv', 'LTV (R$)'], ['conversion_rate', 'Taxa Conversão (%)'], ['nps', 'NPS'], ['average_ticket', 'Ticket Médio (R$)'], ['revenue', 'Receita (R$)']] as const).map(([key, label]) => (
              <div key={key} className="space-y-1.5"><Label>{label}</Label>
                <Input type="number" step="0.01" value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Funil de Marketing</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {([['impressions', 'Impressões'], ['clicks', 'Cliques'], ['visits', 'Visitas'], ['leads', 'Leads'], ['conversions', 'Conversões']] as const).map(([key, label]) => (
              <div key={key} className="space-y-1.5"><Label>{label}</Label>
                <Input type="number" value={(formData as any)[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">KPIs por Canal (opcional)</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddChannel}><Plus className="h-3 w-3 mr-1" /> Canal</Button>
          </CardHeader>
          <CardContent>
            {channels.length === 0 ? (
              <p className="text-xs text-muted-foreground">Clique em "Canal" para registrar métricas específicas por canal</p>
            ) : (
              <div className="space-y-3">
                {channels.map((ch, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <Select value={ch.channel} onValueChange={v => handleChannelChange(i, 'channel', v)}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Canal" /></SelectTrigger>
                        <SelectContent>{channelOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveChannel(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['investment', 'revenue', 'leads', 'conversions'] as const).map(field => (
                        <div key={field} className="space-y-1"><Label className="text-xs capitalize">{field === 'investment' ? 'Investimento' : field === 'revenue' ? 'Receita' : field}</Label>
                          <Input type="number" value={ch[field]} onChange={e => handleChannelChange(i, field, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/app/marketing/kpis")}>Cancelar</Button>
          <Button type="submit" disabled={isLoading} className="bg-app-gestao hover:bg-app-gestao/90">{isLoading ? 'Salvando...' : 'Registrar KPIs'}</Button>
        </div>
      </form>
    </PageWrapper>
  );
}
