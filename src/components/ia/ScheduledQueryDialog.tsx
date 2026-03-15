import { useState } from 'react';
import { Calendar, Clock, Bell, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduledQueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDarkMode: boolean;
  initialQuery?: string;
}

export function ScheduledQueryDialog({
  open,
  onOpenChange,
  isDarkMode,
  initialQuery = '',
}: ScheduledQueryDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [scheduleType, setScheduleType] = useState<string>('daily');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [scheduleDay, setScheduleDay] = useState<string>('1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !query.trim()) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      let nextRun = new Date(now);
      nextRun.setHours(hours, minutes, 0, 0);

      if (nextRun <= now) {
        if (scheduleType === 'daily') {
          nextRun.setDate(nextRun.getDate() + 1);
        } else if (scheduleType === 'weekly') {
          const dayDiff = (parseInt(scheduleDay) - now.getDay() + 7) % 7 || 7;
          nextRun.setDate(nextRun.getDate() + dayDiff);
        } else if (scheduleType === 'monthly') {
          nextRun.setMonth(nextRun.getMonth() + 1);
          nextRun.setDate(parseInt(scheduleDay));
        }
      }

      const { error } = await (supabase as any)
        .from('ia_scheduled_queries')
        .insert({
          user_id: user.id,
          query: query.trim(),
          schedule_type: scheduleType,
          schedule_time: scheduleTime,
          schedule_day: scheduleType === 'daily' ? null : parseInt(scheduleDay),
          next_run: nextRun.toISOString(),
        });

      if (error) throw error;

      toast.success('Consulta agendada!', {
        description: `Próxima execução: ${nextRun.toLocaleString('pt-BR')}`,
      });
      onOpenChange(false);
      setQuery('');
    } catch (error) {
      console.error('Error scheduling query:', error);
      toast.error('Erro ao agendar consulta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Bell className="h-5 w-5" />
            Agendar consulta automática
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            A NexusIA executará esta consulta automaticamente e salvará os resultados.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-secondary-foreground">Consulta</Label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Me envie um resumo executivo do dia anterior"
              className="min-h-[80px] bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-secondary-foreground">Frequência</Label>
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-secondary-foreground">Horário</Label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="bg-muted border-border text-foreground"
              />
            </div>
          </div>

          {scheduleType === 'weekly' && (
            <div className="space-y-2">
              <Label className="text-secondary-foreground">Dia da semana</Label>
              <Select value={scheduleDay} onValueChange={setScheduleDay}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="0">Domingo</SelectItem>
                  <SelectItem value="1">Segunda</SelectItem>
                  <SelectItem value="2">Terça</SelectItem>
                  <SelectItem value="3">Quarta</SelectItem>
                  <SelectItem value="4">Quinta</SelectItem>
                  <SelectItem value="5">Sexta</SelectItem>
                  <SelectItem value="6">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {scheduleType === 'monthly' && (
            <div className="space-y-2">
              <Label className="text-secondary-foreground">Dia do mês</Label>
              <Select value={scheduleDay} onValueChange={setScheduleDay}>
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={cn("bg-popover border-border", "max-h-48")}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      Dia {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
