import { useState } from "react";
import { useCreateIncident, INCIDENT_TYPES, SEVERITY_LEVELS } from "@/hooks/useHWIncidents";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface IncidentDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  userId: string;
  userName: string;
  tenantId: string;
  createdBy: string;
}

export function IncidentDialog({ open, onOpenChange, userId, userName, tenantId, createdBy }: IncidentDialogProps) {
  const [type, setType] = useState("observation");
  const [severity, setSeverity] = useState("low");
  const [description, setDescription] = useState("");
  const createIncident = useCreateIncident();

  const handleSubmit = () => {
    if (!description.trim()) return;
    createIncident.mutate(
      { user_id: userId, tenant_id: tenantId, type, description: description.trim(), severity, created_by: createdBy },
      {
        onSuccess: () => {
          toast.success("Ocorrência registrada");
          onOpenChange(false);
          setDescription("");
          setType("observation");
          setSeverity("low");
        },
        onError: () => toast.error("Erro ao registrar ocorrência"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-festval-graphite border-festval-border">
        <DialogHeader>
          <DialogTitle className="text-festval-ivory">Registrar Ocorrência</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-festval-stone">
          Para: <strong className="text-festval-ivory">{userName}</strong>
        </p>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-festval-stone">Tipo</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(INCIDENT_TYPES).map(([key, label]) => (
              <button key={key} onClick={() => setType(key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: type === key ? 'hsl(var(--festval-copper) / 0.2)' : 'hsl(var(--festval-border))',
                  color: type === key ? 'hsl(var(--festval-copper))' : 'hsl(var(--festval-stone))',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-festval-stone">Severidade</label>
          <div className="flex gap-1.5">
            {Object.entries(SEVERITY_LEVELS).map(([key, info]) => (
              <button key={key} onClick={() => setSeverity(key)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: severity === key ? info.bg : 'hsl(var(--festval-border))',
                  color: severity === key ? info.color : 'hsl(var(--festval-stone))',
                  border: severity === key ? `1px solid ${info.color}33` : '1px solid transparent',
                }}>
                {info.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva a ocorrência..." rows={3}
          style={{ backgroundColor: 'hsl(var(--festval-border))', borderColor: 'hsl(var(--festval-surface-elevated))', color: 'hsl(var(--festval-ivory))' }} />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-festval-stone">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!description.trim() || createIncident.isPending}
            className="bg-festval-copper text-white">
            {createIncident.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
