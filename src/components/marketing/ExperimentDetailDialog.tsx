import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Lightbulb,
  Target,
  Calendar,
  Link2,
  CheckCircle2,
  Play,
  Archive,
  FlaskConical,
} from "lucide-react";
import { useUpdateExperiment, type Experiment, type ExperimentResults } from "@/hooks/useExperiments";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusActions: Record<string, { next: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  planned: [{ next: "running", label: "Iniciar Teste", icon: Play }],
  running: [{ next: "completed", label: "Concluir", icon: CheckCircle2 }],
  completed: [{ next: "archived", label: "Arquivar", icon: Archive }],
  archived: [],
};

const statusColors: Record<string, string> = {
  planned: "bg-muted text-muted-foreground",
  running: "bg-blue-500/10 text-blue-600",
  completed: "bg-green-500/10 text-green-600",
  archived: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  planned: "Planejado",
  running: "Em Execução",
  completed: "Concluído",
  archived: "Arquivado",
};

interface Props {
  experiment: Experiment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExperimentDetailDialog({ experiment, open, onOpenChange }: Props) {
  const updateMutation = useUpdateExperiment();

  const [decision, setDecision] = useState(experiment.decision || "");
  const [winner, setWinner] = useState(experiment.results?.winner || "");
  const [resultNotes, setResultNotes] = useState(experiment.results?.notes || "");

  // Simple results entry per variant
  const [variantValues, setVariantValues] = useState<Record<string, string>>(() => {
    const vals: Record<string, string> = {};
    experiment.variants.forEach((v) => {
      const existing = (experiment.results as any)?.[`variant_${v.name}`];
      vals[v.name] = existing?.value?.toString() || "";
    });
    return vals;
  });

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id: experiment.id, status: newStatus as any });
      toast.success(`Status atualizado para ${statusLabels[newStatus]}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveResults = async () => {
    const results: ExperimentResults = {
      ...experiment.results,
      winner: winner || undefined,
      notes: resultNotes || undefined,
    };

    // Save variant metric values
    experiment.variants.forEach((v) => {
      const val = variantValues[v.name];
      if (val) {
        (results as any)[`variant_${v.name}`] = { value: parseFloat(val) };
      }
    });

    try {
      await updateMutation.mutateAsync({
        id: experiment.id,
        results,
        decision: decision || undefined,
      });
      toast.success("Resultados salvos!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const actions = statusActions[experiment.status] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-app-gestao" />
            <DialogTitle className="flex-1">{experiment.title}</DialogTitle>
            <Badge className={statusColors[experiment.status]}>
              {statusLabels[experiment.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Hypothesis */}
          {experiment.hypothesis && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Hipótese
              </div>
              <p className="text-sm text-muted-foreground">{experiment.hypothesis}</p>
            </div>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {experiment.metric_key && (
              <span className="flex items-center gap-1.5">
                <Target className="h-4 w-4" /> Métrica: <strong>{experiment.metric_key}</strong>
              </span>
            )}
            {experiment.start_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(experiment.start_date), "dd/MM/yyyy", { locale: ptBR })}
                {experiment.end_date && ` → ${format(new Date(experiment.end_date), "dd/MM/yyyy", { locale: ptBR })}`}
              </span>
            )}
            {experiment.campaign && (
              <span className="flex items-center gap-1.5">
                <Link2 className="h-4 w-4" /> {experiment.campaign.name}
              </span>
            )}
          </div>

          <Separator />

          {/* Variants */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Variantes</h4>
            <div className="grid gap-2">
              {experiment.variants.map((v, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{v.name}</span>
                    {winner === v.name && (
                      <Badge className="bg-green-500/10 text-green-600">🏆 Vencedor</Badge>
                    )}
                  </div>
                  {v.description && (
                    <p className="text-xs text-muted-foreground mt-1">{v.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Results entry */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Resultados</h4>
            <div className="space-y-3">
              {experiment.variants.map((v) => (
                <div key={v.name} className="grid grid-cols-[1fr_120px] gap-2 items-center">
                  <Label className="text-sm">{v.name} — valor da métrica</Label>
                  <Input
                    type="number"
                    step="any"
                    value={variantValues[v.name] || ""}
                    onChange={(e) =>
                      setVariantValues((prev) => ({ ...prev, [v.name]: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
              ))}

              <div>
                <Label className="text-sm">Vencedor</Label>
                <Select value={winner} onValueChange={setWinner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar vencedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {experiment.variants.map((v) => (
                      <SelectItem key={v.name} value={v.name}>
                        {v.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="inconclusive">Inconclusivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Notas sobre resultado</Label>
                <Textarea
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  placeholder="Observações sobre os resultados..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Decision */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Decisão Final</h4>
            <Textarea
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="O que aprendemos e o que faremos a partir disso..."
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.next}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(action.next)}
                  disabled={updateMutation.isPending}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {action.label}
                </Button>
              );
            })}
          </div>
          <Button
            onClick={handleSaveResults}
            disabled={updateMutation.isPending}
            className="bg-module-gestao hover:bg-module-gestao/90"
          >
            Salvar Resultados
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
