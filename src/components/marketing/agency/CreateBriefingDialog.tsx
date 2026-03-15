import { useState } from 'react';
import { X, Calendar, DollarSign, Target, Users, Link2, Upload } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
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
  BRIEFING_TYPE_LABELS, 
  BRIEFING_PRIORITY_LABELS,
  type BriefingType,
  type BriefingPriority,
  type AgencyBriefing
} from '@/hooks/useAgencyBriefings';

interface CreateBriefingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: Partial<AgencyBriefing>) => void;
  agencyId?: string;
}

export function CreateBriefingDialog({ 
  open, 
  onOpenChange, 
  onCreate,
  agencyId 
}: CreateBriefingDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'campaign' as BriefingType,
    priority: 'medium' as BriefingPriority,
    objective: '',
    target_audience: '',
    deadline: '',
    budget: '',
    references_urls: [] as string[],
    newReference: '',
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.type) return;

    onCreate({
      title: formData.title,
      type: formData.type,
      priority: formData.priority,
      objective: formData.objective || null,
      target_audience: formData.target_audience || null,
      deadline: formData.deadline || null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      references_urls: formData.references_urls,
      agency_id: agencyId,
      status: 'draft',
    });

    // Reset form
    setFormData({
      title: '',
      type: 'campaign',
      priority: 'medium',
      objective: '',
      target_audience: '',
      deadline: '',
      budget: '',
      references_urls: [],
      newReference: '',
    });
    
    onOpenChange(false);
  };

  const addReference = () => {
    if (formData.newReference && formData.newReference.startsWith('http')) {
      setFormData(prev => ({
        ...prev,
        references_urls: [...prev.references_urls, prev.newReference],
        newReference: '',
      }));
    }
  };

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references_urls: prev.references_urls.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Briefing</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title & Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Campanha Dia das Mães 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as BriefingType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BRIEFING_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority & Deadline Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as BriefingPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BRIEFING_PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">
                <Calendar className="w-4 h-4 inline mr-1" />
                Prazo de Entrega
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
          </div>

          {/* Objective */}
          <div className="space-y-2">
            <Label htmlFor="objective">
              <Target className="w-4 h-4 inline mr-1" />
              Objetivo
            </Label>
            <Textarea
              id="objective"
              value={formData.objective}
              onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
              placeholder="Descreva o objetivo principal desta demanda..."
              rows={3}
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="target_audience">
              <Users className="w-4 h-4 inline mr-1" />
              Público-Alvo
            </Label>
            <Textarea
              id="target_audience"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              placeholder="Descreva o público que deseja atingir..."
              rows={2}
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Orçamento Estimado
            </Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              placeholder="0,00"
            />
          </div>

          {/* References */}
          <div className="space-y-2">
            <Label>
              <Link2 className="w-4 h-4 inline mr-1" />
              Referências Visuais
            </Label>
            <div className="flex gap-2">
              <Input
                value={formData.newReference}
                onChange={(e) => setFormData(prev => ({ ...prev, newReference: e.target.value }))}
                placeholder="https://..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReference())}
              />
              <Button type="button" variant="outline" onClick={addReference}>
                Adicionar
              </Button>
            </div>
            {formData.references_urls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.references_urls.map((url, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs"
                  >
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-app-gestao hover:underline truncate max-w-[200px]"
                    >
                      {url}
                    </a>
                    <button 
                      onClick={() => removeReference(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.title}
            className="bg-app-gestao hover:bg-app-gestao/90"
          >
            Criar Briefing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
