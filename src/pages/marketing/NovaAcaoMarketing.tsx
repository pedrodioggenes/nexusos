import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { useCreateMarketingPlan, useUpdateMarketingPlan, MarketingPlan } from '@/hooks/useMarketingPlans';

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

export default function NovaAcaoMarketing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultDate = searchParams.get('date') || '';
  const createPlan = useCreateMarketingPlan();
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('campaign');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('planned');
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await createPlan.mutateAsync({
        title: title.trim(), type, description: description || null, status,
        start_date: startDate || null, end_date: endDate || null,
        responsible: responsible || null, budget: budget ? parseFloat(budget) : null, color,
      });
      navigate('/app/marketing/planejamento');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageWrapper
      title="Nova Ação de Marketing"
      icon={<Calendar className="h-5 w-5 text-module-gestao" />}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/app/marketing/planejamento')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
      }
    >
      <Card>
        <CardContent className="p-6 max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Campanha de Páscoa" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PLAN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PLAN_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes da ação..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Data Início</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Data Fim</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Responsável</Label><Input value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="Nome do responsável" /></div>
              <div className="space-y-1.5"><Label>Orçamento (R$)</Label><Input type="number" min="0" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0,00" /></div>
            </div>

            <div className="space-y-1.5">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setColor(c.value)}
                    className={`h-8 w-8 rounded-full ${c.value} transition-all ${color === c.value ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'hover:scale-105'}`}
                    title={c.label} />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/app/marketing/planejamento')}>Cancelar</Button>
              <Button type="submit" disabled={isSaving || !title.trim()} className="bg-module-gestao hover:bg-module-gestao/90">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}