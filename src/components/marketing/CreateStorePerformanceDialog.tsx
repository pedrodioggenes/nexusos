import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateStorePerformance } from '@/hooks/useStorePerformance';
import { useUnits } from '@/hooks/useUnits';
import { useToast } from '@/hooks/use-toast';
import { Store, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CreateStorePerformanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const periodTypeLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export function CreateStorePerformanceDialog({ open, onOpenChange }: CreateStorePerformanceDialogProps) {
  const { toast } = useToast();
  const createPerformance = useCreateStorePerformance();
  const { data: units = [] } = useUnits();
  
  const [formData, setFormData] = useState({
    unit_id: '',
    period_type: 'monthly' as 'daily' | 'weekly' | 'monthly',
    period_start: new Date().toISOString().split('T')[0],
    period_end: '',
    investment: '',
    revenue: '',
    impressions: '',
    clicks: '',
    conversions: '',
    foot_traffic: '',
    average_ticket: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.unit_id) {
      toast({
        title: 'Erro',
        description: 'Selecione uma loja',
        variant: 'destructive',
      });
      return;
    }

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
        }
        periodEnd = end.toISOString().split('T')[0];
      }

      await createPerformance.mutateAsync({
        unit_id: formData.unit_id,
        tenant_id: null,
        period_type: formData.period_type,
        period_start: formData.period_start,
        period_end: periodEnd,
        investment: formData.investment ? parseFloat(formData.investment) : 0,
        revenue: formData.revenue ? parseFloat(formData.revenue) : 0,
        impressions: formData.impressions ? parseInt(formData.impressions) : 0,
        clicks: formData.clicks ? parseInt(formData.clicks) : 0,
        conversions: formData.conversions ? parseInt(formData.conversions) : 0,
        foot_traffic: formData.foot_traffic ? parseInt(formData.foot_traffic) : 0,
        average_ticket: formData.average_ticket ? parseFloat(formData.average_ticket) : 0,
      });

      toast({
        title: 'Performance registrada',
        description: 'Os dados da loja foram salvos com sucesso',
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      unit_id: '',
      period_type: 'monthly',
      period_start: new Date().toISOString().split('T')[0],
      period_end: '',
      investment: '',
      revenue: '',
      impressions: '',
      clicks: '',
      conversions: '',
      foot_traffic: '',
      average_ticket: '',
    });
  };

  const selectedUnit = units.find(u => u.id === formData.unit_id);
  const isLoading = createPerformance.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-app-gestao" />
            Registrar Performance de Loja
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Selection */}
          <div className="space-y-2">
            <Label>Loja</Label>
            <Select
              value={formData.unit_id}
              onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    <div className="flex items-center gap-2">
                      <span>{unit.name}</span>
                      {unit.city && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {unit.city}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {units.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhuma loja cadastrada. Cadastre as unidades primeiro.
              </p>
            )}
          </div>

          {/* Period */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select
                value={formData.period_type}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                  setFormData({ ...formData, period_type: value })
                }
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
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={formData.period_end}
                onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
              />
            </div>
          </div>

          <Separator />

          {/* Financial Metrics */}
          <div>
            <h4 className="text-sm font-medium mb-3">Métricas Financeiras</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Investimento (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.investment}
                  onChange={(e) => setFormData({ ...formData, investment: e.target.value })}
                  placeholder="Ex: 5000"
                />
              </div>

              <div className="space-y-2">
                <Label>Receita (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="Ex: 25000"
                />
              </div>

              <div className="space-y-2">
                <Label>Ticket Médio (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.average_ticket}
                  onChange={(e) => setFormData({ ...formData, average_ticket: e.target.value })}
                  placeholder="Ex: 85"
                />
              </div>

              <div className="space-y-2">
                <Label>Fluxo de Pessoas</Label>
                <Input
                  type="number"
                  value={formData.foot_traffic}
                  onChange={(e) => setFormData({ ...formData, foot_traffic: e.target.value })}
                  placeholder="Ex: 1200"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Funnel Metrics */}
          <div>
            <h4 className="text-sm font-medium mb-3">Funil de Marketing</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Impressões</Label>
                <Input
                  type="number"
                  value={formData.impressions}
                  onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                  placeholder="Ex: 50000"
                />
              </div>

              <div className="space-y-2">
                <Label>Cliques</Label>
                <Input
                  type="number"
                  value={formData.clicks}
                  onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
                  placeholder="Ex: 1500"
                />
              </div>

              <div className="space-y-2">
                <Label>Conversões</Label>
                <Input
                  type="number"
                  value={formData.conversions}
                  onChange={(e) => setFormData({ ...formData, conversions: e.target.value })}
                  placeholder="Ex: 45"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.unit_id}>
              {isLoading ? 'Salvando...' : 'Registrar Performance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
