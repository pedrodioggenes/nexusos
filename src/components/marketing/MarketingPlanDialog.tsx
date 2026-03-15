import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { MarketingPlan } from '@/hooks/useMarketingPlans';

const PRESET_COLORS = [
  { value: 'bg-emerald-500', label: 'Verde' },
  { value: 'bg-blue-500', label: 'Azul' },
  { value: 'bg-violet-500', label: 'Violeta' },
  { value: 'bg-amber-500', label: 'Âmbar' },
  { value: 'bg-rose-500', label: 'Rosa' },
  { value: 'bg-cyan-500', label: 'Ciano' },
  { value: 'bg-orange-500', label: 'Laranja' },
];

const PLAN_TYPES = [
  { value: 'campaign', label: 'Campanha' },
  { value: 'goal', label: 'Meta' },
  { value: 'event', label: 'Evento' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'deadline', label: 'Prazo' },
];

const PLAN_STATUSES = [
  { value: 'planned', label: 'Planejado' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' },
];

interface MarketingPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: MarketingPlan | null;
  defaultDate?: Date | null;
  onSave: (data: Partial<MarketingPlan>) => Promise<void>;
}

export function MarketingPlanDialog({ 
  open, 
  onOpenChange, 
  plan, 
  defaultDate,
  onSave 
}: MarketingPlanDialogProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('campaign');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('planned');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setTitle(plan.title);
      setType(plan.type);
      setDescription(plan.description || '');
      setStatus(plan.status || 'planned');
      setStartDate(plan.start_date?.split('T')[0] || '');
      setEndDate(plan.end_date?.split('T')[0] || '');
      setResponsible(plan.responsible || '');
      setBudget(plan.budget?.toString() || '');
      setColor(plan.color || PRESET_COLORS[0].value);
    } else {
      setTitle('');
      setType('campaign');
      setDescription('');
      setStatus('planned');
      setStartDate(defaultDate ? defaultDate.toISOString().split('T')[0] : '');
      setEndDate('');
      setResponsible('');
      setBudget('');
      setColor(PRESET_COLORS[0].value);
    }
  }, [plan, defaultDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !type) return;

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        type,
        description: description || null,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        responsible: responsible || null,
        budget: budget ? parseFloat(budget) : null,
        color,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Editar Ação' : 'Nova Ação de Marketing'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Campanha de Páscoa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da ação..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento (R$)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-8 w-8 rounded-full ${c.value} transition-all ${
                    color === c.value 
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' 
                      : 'hover:scale-105'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || !title.trim()}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {plan ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
