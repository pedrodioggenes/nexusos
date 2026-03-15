import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAlert } from '@/hooks/useMarketingAlerts';
import { useToast } from '@/hooks/use-toast';
import { Bell, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeOptions = [
  { value: 'budget', label: 'Orçamento' },
  { value: 'roi', label: 'ROI' },
  { value: 'execution', label: 'Execução' },
  { value: 'supplier', label: 'Fornecedor' },
  { value: 'goal', label: 'Meta' },
  { value: 'anomaly', label: 'Anomalia' },
];

const severityOptions = [
  { value: 'info', label: 'Informativo', icon: Info, color: 'text-blue-500 bg-blue-500/10' },
  { value: 'warning', label: 'Atenção', icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10' },
  { value: 'critical', label: 'Crítico', icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
];

export function CreateAlertDialog({ open, onOpenChange }: CreateAlertDialogProps) {
  const { toast } = useToast();
  const createAlert = useCreateAlert();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'budget' as 'budget' | 'roi' | 'execution' | 'supplier' | 'goal' | 'anomaly',
    severity: 'warning' as 'info' | 'warning' | 'critical',
    ai_suggestion: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAlert.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        severity: formData.severity,
        ai_suggestion: formData.ai_suggestion || null,
        tenant_id: null,
        data: {},
        related_entity_type: null,
        related_entity_id: null,
        rule_key: null,
        evidence: null,
        action_link: null,
        impact: null,
      });

      toast({
        title: 'Alerta criado',
        description: 'O alerta foi registrado com sucesso',
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o alerta',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'budget',
      severity: 'warning',
      ai_suggestion: '',
    });
  };

  const isLoading = createAlert.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-app-gestao" />
            Criar Alerta Manual
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Alerta</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Orçamento de Trade Marketing próximo do limite"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: typeof formData.type) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severidade</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: typeof formData.severity) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-3 w-3", option.color.split(' ')[0])} />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Severity Preview */}
          <div className={cn(
            "p-3 rounded-lg flex items-center gap-3",
            formData.severity === 'info' && "bg-blue-500/10",
            formData.severity === 'warning' && "bg-amber-500/10",
            formData.severity === 'critical' && "bg-destructive/10",
          )}>
            {formData.severity === 'info' && <Info className="h-5 w-5 text-blue-500" />}
            {formData.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {formData.severity === 'critical' && <AlertCircle className="h-5 w-5 text-destructive" />}
            <span className="text-sm">
              {formData.title || 'Preview do alerta'}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o contexto do alerta..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_suggestion">Sugestão de Ação (opcional)</Label>
            <Textarea
              id="ai_suggestion"
              value={formData.ai_suggestion}
              onChange={(e) => setFormData({ ...formData, ai_suggestion: e.target.value })}
              placeholder="Qual ação deve ser tomada para resolver..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Alerta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
