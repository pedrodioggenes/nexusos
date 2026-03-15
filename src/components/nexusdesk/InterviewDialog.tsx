import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateHWInterview } from "@/hooks/useHWInterviews";
import { Calendar, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  candidateId: string;
  candidateName: string;
}

export function InterviewDialog({ open, onOpenChange, tenantId, candidateId, candidateName }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('30');
  const [type, setType] = useState('presencial');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const createInterview = useCreateHWInterview();

  const handleSubmit = () => {
    if (!date || !time) {
      toast.error('Informe data e horário');
      return;
    }
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    createInterview.mutate({
      tenantId,
      candidateId,
      scheduledAt,
      durationMinutes: parseInt(duration),
      type,
      location,
      notes,
    }, {
      onSuccess: () => {
        toast.success('Entrevista agendada com sucesso');
        onOpenChange(false);
        setDate(''); setTime('09:00'); setLocation(''); setNotes('');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-festval-graphite border-festval-border text-festval-ivory">
        <DialogHeader>
          <DialogTitle className="text-base text-festval-ivory">
            Agendar Entrevista
          </DialogTitle>
          <p className="text-xs text-festval-stone">Candidato: {candidateName}</p>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-medium mb-1 block text-festval-stone">
                <Calendar className="h-3 w-3 inline mr-1" />Data
              </label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-ivory))' }} />
            </div>
            <div className="w-24">
              <label className="text-[10px] font-medium mb-1 block text-festval-stone">
                <Clock className="h-3 w-3 inline mr-1" />Hora
              </label>
              <Input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-ivory))' }} />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] font-medium mb-1 block text-festval-stone">Tipo</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-stone))' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-festval-graphite border-festval-border">
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="video">Videochamada</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <label className="text-[10px] font-medium mb-1 block text-festval-stone">Duração</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-stone))' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-festval-graphite border-festval-border">
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium mb-1 block text-festval-stone">
              <MapPin className="h-3 w-3 inline mr-1" />Local
            </label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ex: Sala de reuniões 2"
              style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-ivory))' }} />
          </div>

          <div>
            <label className="text-[10px] font-medium mb-1 block text-festval-stone">Observações</label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas sobre a entrevista..."
              style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-ivory))' }} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-xs text-festval-stone">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createInterview.isPending}
            className="text-xs"
            style={{ backgroundColor: '#8B5CF6', color: 'hsl(var(--festval-ivory))' }}
          >
            {createInterview.isPending ? 'Agendando...' : 'Agendar Entrevista'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
