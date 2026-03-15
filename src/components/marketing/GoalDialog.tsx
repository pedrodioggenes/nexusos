import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateGoal, useUpdateGoal, kpiTypeLabels, MarketingGoal } from '@/hooks/useMarketingGoals';
import { Target, TrendingUp } from 'lucide-react';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: MarketingGoal | null;
}

const periodTypeLabels: Record<string, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

type KpiType = 'roi' | 'cac' | 'ltv' | 'conversion_rate' | 'impressions' | 'clicks' | 'leads' | 'revenue' | 'nps';
type PeriodType = 'monthly' | 'quarterly' | 'yearly';

export function GoalDialog({ open, onOpenChange, goal }: GoalDialogProps) {
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  
  const [formData, setFormData] = useState({
    name: '',
    kpi_type: 'roi' as KpiType,
    period_type: 'monthly' as PeriodType,
    period_start: new Date().toISOString().split('T')[0],
    period_end: '',
    target_value: '',
    baseline_value: '',
    notes: '',
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        kpi_type: goal.kpi_type as KpiType,
        period_type: goal.period_type,
        period_start: goal.period_start,
        period_end: goal.period_end,
        target_value: goal.target_value?.toString() || '',
        baseline_value: goal.baseline_value?.toString() || '',
        notes: goal.notes || '',
      });
    } else {
      const start = new Date();
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      
      setFormData({
        name: '',
        kpi_type: 'roi',
        period_type: 'monthly',
        period_start: start.toISOString().split('T')[0],
        period_end: end.toISOString().split('T')[0],
        target_value: '',
        baseline_value: '',
        notes: '',
      });
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const basePayload = {
      name: formData.name,
      kpi_type: formData.kpi_type,
      period_type: formData.period_type,
      period_start: formData.period_start,
      period_end: formData.period_end,
      target_value: parseFloat(formData.target_value),
      baseline_value: formData.baseline_value ? parseFloat(formData.baseline_value) : null,
      notes: formData.notes || null,
    };

    if (goal) {
      await updateGoal.mutateAsync({ id: goal.id, ...basePayload });
    } else {
      await createGoal.mutateAsync({
        ...basePayload,
        tenant_id: null,
        current_value: 0,
        created_by: null,
      });
    }
    
    onOpenChange(false);
  };

  const isLoading = createGoal.isPending || updateGoal.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {goal ? 'Editar Meta' : 'Nova Meta de Marketing'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Meta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Aumentar ROI em 20%"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kpi_type">Tipo de KPI</Label>
              <Select
                value={formData.kpi_type}
                onValueChange={(value) => setFormData({ ...formData, kpi_type: value as KpiType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(kpiTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period_type">Período</Label>
              <Select
                value={formData.period_type}
                onValueChange={(value: PeriodType) => setFormData({ ...formData, period_type: value })}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start">Data Início</Label>
              <Input
                id="period_start"
                type="date"
                value={formData.period_start}
                onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period_end">Data Fim</Label>
              <Input
                id="period_end"
                type="date"
                value={formData.period_end}
                onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_value" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Valor Alvo
              </Label>
              <Input
                id="target_value"
                type="number"
                step="0.01"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="Ex: 150"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseline_value">Valor Baseline (opcional)</Label>
              <Input
                id="baseline_value"
                type="number"
                step="0.01"
                value={formData.baseline_value}
                onChange={(e) => setFormData({ ...formData, baseline_value: e.target.value })}
                placeholder="Valor anterior"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas sobre a meta..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : goal ? 'Atualizar' : 'Criar Meta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
