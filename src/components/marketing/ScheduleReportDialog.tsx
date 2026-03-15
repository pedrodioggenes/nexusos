import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Mail, FileText, Send } from 'lucide-react';

interface ScheduleReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportTypes = [
  { value: 'executive', label: 'Relatório Executivo', description: 'Visão geral de KPIs e performance' },
  { value: 'budget', label: 'Relatório de Orçamento', description: 'Análise detalhada de gastos' },
  { value: 'campaigns', label: 'Relatório de Campanhas', description: 'Performance de campanhas ativas' },
  { value: 'stores', label: 'Relatório por Lojas', description: 'Ranking e comparativos regionais' },
  { value: 'trade', label: 'Relatório de Trade', description: 'Verbas cooperadas e ROI por fornecedor' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
];

const dayOfWeekOptions = [
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
];

export function ScheduleReportDialog({ open, onOpenChange }: ScheduleReportDialogProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    reportType: 'executive',
    frequency: 'weekly',
    dayOfWeek: '1',
    time: '08:00',
    emails: '',
    includeCharts: true,
    includeSummary: true,
    includeRecommendations: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Agendamento criado',
      description: 'O relatório será enviado automaticamente conforme configurado.',
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  const selectedReport = reportTypes.find(r => r.value === formData.reportType);
  const showDayOfWeek = formData.frequency === 'weekly' || formData.frequency === 'biweekly';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Agendar Relatório Automático
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <Select
              value={formData.reportType}
              onValueChange={(value) => setFormData({ ...formData, reportType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReport && (
              <p className="text-xs text-muted-foreground">{selectedReport.description}</p>
            )}
          </div>

          {/* Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showDayOfWeek && (
              <div className="space-y-2">
                <Label>Dia da Semana</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayOfWeekOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Horário de Envio
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          {/* Emails */}
          <div className="space-y-2">
            <Label htmlFor="emails" className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Destinatários
            </Label>
            <Input
              id="emails"
              type="text"
              value={formData.emails}
              onChange={(e) => setFormData({ ...formData, emails: e.target.value })}
              placeholder="email1@empresa.com, email2@empresa.com"
            />
            <p className="text-xs text-muted-foreground">Separe múltiplos emails com vírgula</p>
          </div>

          {/* Options */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm font-medium mb-2">Incluir no Relatório:</p>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={formData.includeCharts}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, includeCharts: checked as boolean })
                  }
                />
                <label
                  htmlFor="includeCharts"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Gráficos e visualizações
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSummary"
                  checked={formData.includeSummary}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, includeSummary: checked as boolean })
                  }
                />
                <label
                  htmlFor="includeSummary"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Resumo executivo
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeRecommendations"
                  checked={formData.includeRecommendations}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, includeRecommendations: checked as boolean })
                  }
                />
                <label
                  htmlFor="includeRecommendations"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Recomendações de IA
                </label>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                'Agendando...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Agendar Relatório
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
